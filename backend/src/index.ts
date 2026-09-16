import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './config/env';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Routes mount here as we build them:
// app.use('/api/v1/auth', authRoutes);

app.listen(env.port, () => {
  console.log(`TillSync backend running on port ${env.port}`);
});