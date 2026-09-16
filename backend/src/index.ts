import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './config/env';
import { prisma } from './config/database';
import { connectRedis, redisClient } from './config/redis';
import { AppError } from './utils/errors';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());


app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.get('/db-check', async (req: Request, res: Response) => {
  try {
    const count = await prisma.tenant.count();
    res.json({ connected: true, tenantCount: count });
  } catch (err) {
    res.status(500).json({ connected: false, error: (err as Error).message });
  }
});

app.get('/redis-check', async (req: Request, res: Response) => {
  try {
    await redisClient.set('healthcheck', 'ok');
    const value = await redisClient.get('healthcheck');
    res.json({ connected: true, value });
  } catch (err) {
    res.status(500).json({ connected: false, error: (err as Error).message });
  }
});

async function start() {
  await connectRedis();
  app.listen(env.port, () => {
    console.log(`TillSync backend running on port ${env.port}`);
  });
}

start();

app.use((err: any, req: Request, res: Response, next: any) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }
  if (err?.name === 'ZodError') {
    return res.status(400).json({ error: 'Validation failed', details: err.errors });
  }
  if (err?.statusCode) {
    return res.status(err.statusCode).json({ error: err.message || 'Bad request' });
  }
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});