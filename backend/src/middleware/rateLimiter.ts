import rateLimit from 'express-rate-limit';
import { Request } from 'express';

export const tenantRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 req/min per tenant, per your roadmap
  keyGenerator: (req: Request) => req.auth?.tenantId || req.ip || 'anonymous',
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, slow down' },
});