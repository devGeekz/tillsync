import { Router } from 'express';
import { prisma } from '../config/database.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth, requireAdmin);

const merchantPublic = (t) => ({
  id: t.id,
  name: t.name,
  phone: t.users[0]?.phone ?? null,
  email: t.users[0]?.email ?? null,
  subscriptionStatus: t.subscriptionStatus,
  createdAt: t.createdAt,
});

router.get('/', async (req, res) => {
  const rows = await prisma.tenant.findMany({
    include: { users: { where: { role: 'owner' }, take: 1, select: { phone: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ data: rows.map(merchantPublic), total: rows.length });
});

router.get('/:id', async (req, res) => {
  const tenant = await prisma.tenant.findUnique({
    where: { id: req.params.id },
    include: { users: { where: { role: 'owner' }, take: 1, select: { phone: true, email: true } } },
  });
  if (!tenant) return res.status(404).json({ error: 'Merchant not found' });
  res.json({
    data: {
      ...merchantPublic(tenant),
      subscriptionExpiresAt: tenant.subscriptionExpiresAt ?? null,
    },
  });
});

router.put('/:id', async (req, res) => {
  const { name, email } = req.body ?? {};
  const tenant = await prisma.tenant.findUnique({
    where: { id: req.params.id },
    include: { users: { where: { role: 'owner' }, take: 1, select: { id: true } } },
  });
  if (!tenant) return res.status(404).json({ error: 'Merchant not found' });

  await prisma.$transaction([
    ...(name !== undefined ? [prisma.tenant.update({ where: { id: tenant.id }, data: { name } })] : []),
    ...(email !== undefined && tenant.users[0]
      ? [prisma.user.update({ where: { id: tenant.users[0].id }, data: { email: email || null } })]
      : []),
  ]);
  const updated = await prisma.tenant.findUnique({
    where: { id: tenant.id },
    include: { users: { where: { role: 'owner' }, take: 1, select: { phone: true, email: true } } },
  });
  res.json({ data: { id: updated.id, name: updated.name, phone: updated.users[0]?.phone ?? null, email: updated.users[0]?.email ?? null } });
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.tenant.delete({ where: { id: req.params.id } }); // users, tills, notifications cascade
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ error: 'Merchant not found' });
    throw e;
  }
  res.json({ message: 'Merchant deleted successfully' });
});

export default router;