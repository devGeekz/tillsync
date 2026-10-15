import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import tillRoutes from './routes/tills.js';
import attendantRoutes from './routes/attendants.js';
import notificationRoutes from './routes/notifications.js';
import dashboardRoutes from './routes/dashboard.js';
import webhookRoutes from './routes/webhooks.js';
import billingRoutes from './routes/billing.js';
import referralRoutes from './routes/referrals.js';
import adminRoutes from './routes/admin.js';
import { rateLimit } from './utils/rateLimit.js';

const app = express();

// browsers reach the API through the Next rewrite (same-origin), so CORS is only
// for direct access from the app's own origin — no wildcard
const allowedOrigins = (process.env.APP_URL ?? 'http://localhost:3000').split(',').map((o) => o.trim());
app.use(
  cors({
    origin(origin, cb) {
      cb(null, !origin || allowedOrigins.includes(origin));
    },
    credentials: true,
  })
);

// rawBody kept so the webhook can verify its HMAC signature
app.use(express.json({ verify: (req, _res, buf) => { req.rawBody = buf; } }));

// credential endpoints are the brute-force target — bcrypt makes each hit expensive,
// this stops the flood itself
const credentialsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  key: (req) => `${req.ip}:${req.body?.phone ?? ''}`,
});
app.use('/api/v1/auth/login', credentialsLimiter);
app.use('/api/v1/auth/register', credentialsLimiter);
app.use('/api/v1/auth/forgot-password', credentialsLimiter);
app.use('/api/v1/auth/reset-password', credentialsLimiter);

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tills', tillRoutes);
app.use('/api/v1/attendants', attendantRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/webhook', webhookRoutes);
app.use('/api/v1/billing', billingRoutes);
app.use('/api/v1/referrals', referralRoutes);
app.use('/api/v1/merchants', adminRoutes);

app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON body' });
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`TillSync API listening on http://localhost:${port}`));
