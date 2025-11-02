import { Context, Next } from 'hono';
import { getRedis } from '../lib/redis';
import { config } from '../config/config';

interface RateLimitOptions {
  windowMs: number;      // Ventana de tiempo en milisegundos
  maxRequests: number;   // Máximo de peticiones en la ventana
  message?: string;      // Mensaje personalizado
  skipSuccessfulRequests?: boolean;  // No contar peticiones exitosas
  skipFailedRequests?: boolean;      // No contar peticiones fallidas
}

const defaultOptions: RateLimitOptions = {
  windowMs: 15 * 60 * 1000, // 15 minutos
  maxRequests: 100,          // 100 peticiones
  message: 'Too many requests, please try again later.',
  skipSuccessfulRequests: false,
  skipFailedRequests: false
};

export function rateLimit(options: Partial<RateLimitOptions> = {}) {
  const opts = { ...defaultOptions, ...options };
  const redis = getRedis();

  return async (c: Context, next: Next) => {
    // Si Redis no está disponible, permitir la petición sin rate limiting
    if (!redis) {
      console.warn('Rate limiting disabled: Redis not available');
      await next();
      return;
    }

    // Obtener IP del cliente
    const ip = c.req.header('x-forwarded-for')?.split(',')[0].trim() 
      || c.req.header('x-real-ip') 
      || 'unknown';

    // Clave única para esta IP
    const key = `ratelimit:${ip}`;
    const now = Date.now();
    const windowStart = now - opts.windowMs;

    try {
      // Asegurar que Redis está conectado antes de ejecutar comandos
      if (redis.status !== 'ready') {
        await redis.connect();
      }
      
      // Usar Redis para contar peticiones
      const multi = redis.multi();
      
      // Eliminar peticiones antiguas fuera de la ventana
      multi.zremrangebyscore(key, 0, windowStart);
      
      // Contar peticiones en la ventana actual
      multi.zcard(key);
      
      // Añadir la petición actual
      multi.zadd(key, now, `${now}-${Math.random()}`);
      
      // Establecer expiración de la clave
      multi.expire(key, Math.ceil(opts.windowMs / 1000));
      
      const results = await multi.exec();
      
      // El resultado de zcard está en results[1]
      const requestCount = results?.[1]?.[1] as number || 0;
      
      // Headers de rate limit
      const limit = opts.maxRequests;
      const remaining = Math.max(0, limit - requestCount - 1);
      const resetTime = now + opts.windowMs;
      
      c.header('X-RateLimit-Limit', limit.toString());
      c.header('X-RateLimit-Remaining', remaining.toString());
      c.header('X-RateLimit-Reset', Math.ceil(resetTime / 1000).toString());
      
      // Verificar si se excedió el límite
      if (requestCount >= limit) {
        const retryAfter = Math.ceil((resetTime - now) / 1000);
        c.header('Retry-After', retryAfter.toString());
        
        return c.json({
          error: 'rate_limit_exceeded',
          message: opts.message,
          retryAfter: retryAfter
        }, 429);
      }
      
      await next();
      
    } catch (error) {
      console.error('Rate limit error:', error);
      // En caso de error con Redis, permitir la petición sin rate limiting
      // Esto evita que fallos de Redis bloqueen la aplicación
      await next();
    }
  };
}

// Presets comunes
export const rateLimitPresets = {
  // Límite estricto para APIs públicas
  strict: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 50,           // 50 peticiones
    message: 'Too many requests. Please try again in 15 minutes.'
  }),
  
  // Límite moderado para uso general
  moderate: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 100,          // 100 peticiones
    message: 'Too many requests. Please try again later.'
  }),
  
  // Límite permisivo para desarrollo
  permissive: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 500,          // 500 peticiones
    message: 'Rate limit exceeded.'
  }),
  
  // Límite muy estricto para operaciones sensibles
  veryStrict: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    maxRequests: 10,           // 10 peticiones
    message: 'Too many attempts. Please try again in 1 hour.'
  })
};
