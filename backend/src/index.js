import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import tillRoutes from './routes/tills.js';
import attendantRoutes from './routes/attendants.js';
import notificationRoutes from './routes/notifications.js';
import dashboardRoutes from './routes/dashboard.js';

const app = express();
app.use(cors()); // ponytail: open CORS for dev; restrict to APP_URL origin in production
app.use(express.json());

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tills', tillRoutes);
app.use('/api/v1/attendants', attendantRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON body' });
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`TillSync API listening on http://localhost:${port}`));
