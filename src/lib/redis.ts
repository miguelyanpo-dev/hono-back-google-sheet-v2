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
      maxRetriesPerRequest: 1, // Solo 1 reintento
      enableReadyCheck: false, // Desactivar ready check
      connectTimeout: 2000, // 2 segundos timeout
      commandTimeout: 2000, // 2 segundos para comandos
      enableOfflineQueue: false, // No encolar comandos si está offline
      // enable TLS if URL uses rediss://
    });
    
    redisClient.on('error', (err) => {
      console.error('Redis connection error:', err);
    });
    
    redisClient.on('connect', () => {
      console.log('Redis connected successfully');
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
