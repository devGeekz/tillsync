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

const app = express();
app.use(cors()); // ponytail: open CORS for dev; restrict to APP_URL origin in production
// rawBody kept so the webhook can verify its HMAC signature
app.use(express.json({ verify: (req, _res, buf) => { req.rawBody = buf; } }));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tills', tillRoutes);
app.use('/api/v1/attendants', attendantRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/webhook', webhookRoutes);
app.use('/api/v1/billing', billingRoutes);
app.use('/api/v1/referrals', referralRoutes);

app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON body' });
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`TillSync API listening on http://localhost:${port}`));
