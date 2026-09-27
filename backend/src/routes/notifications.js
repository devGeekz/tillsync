import { Router } from 'express';
import { prisma } from '../config/database.js';
import { requireAuth } from '../middleware/auth.js';

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

export default router;
