import { Router } from 'express';
import { prisma } from '../config/database.js';
import { requireAuth } from '../middleware/auth.js';
import { required, badRequest } from '../utils/validate.js';
import { createNotification, publicNotification } from '../services/notifications.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));

  const where = { tenantId: req.auth.tenantId };
  if (req.query.status) where.status = req.query.status;
  if (req.query.tillId) where.tillId = req.query.tillId;
  if (req.query.startDate || req.query.endDate) {
    where.createdAt = {};
    if (req.query.startDate) where.createdAt.gte = new Date(req.query.startDate);
    if (req.query.endDate) where.createdAt.lte = new Date(req.query.endDate);
  }

  const [rows, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      include: { till: { select: { tillNumber: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.notification.count({ where }),
  ]);

  res.json({
    data: rows.map((n) => ({
      id: n.id,
      tillNumber: n.till?.tillNumber ?? n.tillNumber,
      amount: n.amount,
      currency: n.currency,
      senderName: n.senderName ?? undefined,
      senderPhone: n.senderPhone ?? undefined,
      channel: n.channel,
      status: n.status,
      createdAt: n.createdAt,
    })),
    total,
    page,
    limit,
  });
});

router.post('/', async (req, res) => {
  const { tillId, amount, currency, senderName, senderPhone, channel } = req.body ?? {};
  const details = required(req.body, ['tillId', 'amount']);
  if (amount !== undefined && (typeof amount !== 'number' || amount <= 0)) {
    details.push({ field: 'amount', message: 'Amount must be a positive number' });
  }
  if (details.length) return badRequest(res, details);

  const result = await createNotification({
    tenantId: req.auth.tenantId,
    tillId,
    amount,
    currency,
    senderName,
    senderPhone,
    channel,
  });
  if (result.error) return res.status(result.status).json({ error: result.error });
  res.status(201).json({ data: publicNotification(result.notification, result.tillNumber) });
});

export default router;
