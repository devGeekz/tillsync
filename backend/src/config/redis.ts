import { createClient } from 'redis';
import { env } from './env';

export const redisClient = createClient({
  url: env.redisUrl,
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error', err);
});

export async function connectRedis() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
  return redisClient;
}