import { Router } from 'express';
import { prisma } from '../config/database.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// ponyletail: plan limits are hardcoded until there are paid plans — move to a table when prices exist
const PLANS = {
  trial: { price: 0, tillsAllowed: 1, smsAllowed: 100 },
  basic: { price: 15, tillsAllowed: 3, smsAllowed: -1 },
  pro: { price: 40, tillsAllowed: 10, smsAllowed: -1 },
  enterprise: { price: 0, tillsAllowed: -1, smsAllowed: -1 },
};

router.get('/subscription', async (req, res) => {
  const tenant = await prisma.tenant.findUniqueOrThrow({ where: { id: req.auth.tenantId } });
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [tillsUsed, smsUsed] = await Promise.all([
    prisma.till.count({ where: { tenantId: tenant.id } }),
    prisma.notification.count({ where: { tenantId: tenant.id, createdAt: { gte: startOfMonth } } }),
  ]);

  const plan = PLANS[tenant.plan] ?? PLANS.trial;
  res.json({
    data: {
      plan: tenant.plan,
      status: tenant.subscriptionStatus,
      price: plan.price,
      currency: 'GHS',
      tillsAllowed: plan.tillsAllowed,
      tillsUsed,
      smsUsed,
      smsAllowed: plan.smsAllowed,
      expiresAt: tenant.subscriptionExpiresAt ?? null,
    },
  });
});

// ponytail: stub until MTN billing collection is wired — throws loudly instead of pretending to charge
router.post('/subscribe', (req, res) => res.status(501).json({ error: 'Online payment not available yet' }));

export default router;