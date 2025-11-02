import Redis from 'ioredis';
import Redlock from 'redlock';
import { config } from '../config/config';

let redisClient: Redis | null = null;
let redlock: Redlock | null = null;

function getRedis() {
  if (redisClient) return redisClient;
  // reuse connection across invocations in serverless
  redisClient = new Redis(config.redis.url, {
    lazyConnect: false,
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    // enable TLS if URL uses rediss://
  });
  
  redisClient.on('error', (err) => {
    console.error('Redis connection error:', err);
  });
  
  redisClient.on('connect', () => {
    console.log('Redis connected successfully');
  });
  
  return redisClient;
}

function getRedlock() {
  if (redlock) return redlock;
  const client = getRedis();
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
}

export { getRedis, getRedlock };
