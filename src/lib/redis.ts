import Redis from 'ioredis';
import Redlock from 'redlock';
import { config } from '../config/config';

let redisClient: Redis | null = null;
let redlock: Redlock | null = null;

function getRedis() {
  if (redisClient) return redisClient;
  
  // Si no hay URL de Redis configurada, retornar null
  if (!config.redis.url) {
    console.warn('Redis URL not configured, Redis features will be disabled');
    return null;
  }
  
  try {
    // reuse connection across invocations in serverless
    redisClient = new Redis(config.redis.url, {
      lazyConnect: true, // No conectar inmediatamente
      maxRetriesPerRequest: 2, // Aumentar reintentos a 2
      enableReadyCheck: false, // Desactivar ready check
      connectTimeout: 3000, // 3 segundos timeout (aumentado)
      commandTimeout: 3000, // 3 segundos para comandos (aumentado)
      enableOfflineQueue: false, // No encolar comandos si está offline
      retryStrategy(times) {
        // Estrategia de reintento exponencial con límite
        if (times > 3) {
          return null; // Detener reintentos después de 3 intentos
        }
        return Math.min(times * 200, 1000); // Máximo 1 segundo entre reintentos
      },
      // enable TLS if URL uses rediss://
    });
    
    redisClient.on('error', (err) => {
      console.error('Redis connection error:', err);
    });
    
    redisClient.on('connect', () => {
      console.log('Redis connected successfully');
    });
    
    redisClient.on('close', () => {
      console.warn('Redis connection closed');
    });
    
    return redisClient;
  } catch (err) {
    console.error('Failed to initialize Redis:', err);
    return null;
  }
}

function getRedlock() {
  if (redlock) return redlock;
  
  const client = getRedis();
  
  // Si Redis no está disponible, retornar null
  if (!client) {
    console.warn('Redis not available, distributed locking disabled');
    return null;
  }
  
  try {
    redlock = new Redlock([client], {
      // recommended defaults
      driftFactor: 0.01,
      retryCount: config.lock.retryCount,
      retryDelay: config.lock.retryDelay,
      retryJitter: 50,
      automaticExtensionThreshold: 500
    });
    
    redlock.on('error', (err) => {
      console.error('Redlock error:', err);
    });
    
    return redlock;
  } catch (err) {
    console.error('Failed to initialize Redlock:', err);
    return null;
  }
}

export { getRedis, getRedlock };
