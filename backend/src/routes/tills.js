import { Router } from 'express';
import { prisma } from '../config/database.js';
import { requireAuth } from '../middleware/auth.js';
import { required, badRequest } from '../utils/validate.js';

const router = Router();
router.use(requireAuth);

const tillPublic = (t, attendantCount) => ({
  id: t.id,
  tillNumber: t.tillNumber,
  name: t.name,
  isActive: t.isActive,
  ...(attendantCount !== undefined ? { attendantCount } : {}),
  createdAt: t.createdAt,
});

async function findTill(req, res) {
  const till = await prisma.till.findFirst({ where: { id: req.params.id, tenantId: req.auth.tenantId } });
  if (!till) {
    res.status(404).json({ error: 'Till not found' });
    return null;
  }
  return till;
}

router.get('/', async (req, res) => {
  const rows = await prisma.till.findMany({
    where: { tenantId: req.auth.tenantId },
    include: { _count: { select: { attendants: true } } },
    orderBy: { createdAt: 'asc' },
  });
  const data = rows.map((t) => tillPublic(t, t._count.attendants));
  res.json({ data, total: data.length });
});

router.post('/', async (req, res) => {
  const { tillNumber, name } = req.body ?? {};
  const details = required(req.body, ['tillNumber', 'name']);
  if (details.length) return badRequest(res, details);

  const existing = await prisma.till.findUnique({
    where: { tenantId_tillNumber: { tenantId: req.auth.tenantId, tillNumber } },
  });
  if (existing) return res.status(400).json({ error: 'Till number already exists for this merchant' });

  const till = await prisma.till.create({ data: { tillNumber, name, tenantId: req.auth.tenantId } });
  res.status(201).json({ data: tillPublic(till) });
});

router.get('/:id', async (req, res) => {
  const till = await prisma.till.findFirst({
    where: { id: req.params.id, tenantId: req.auth.tenantId },
    include: {
      attendants: {
        include: { attendantRel: { select: { id: true, name: true, phone: true } } },
        orderBy: { assignedAt: 'desc' },
      },
    },
  });
  if (!till) return res.status(404).json({ error: 'Till not found' });
  const { attendants, ...rest } = till;
  res.json({
    data: {
      ...tillPublic(rest),
      attendants: attendants.map((a) => ({
        id: a.attendantRel.id,
        name: a.attendantRel.name,
        phone: a.attendantRel.phone,
        assignedAt: a.assignedAt,
      })),
    },
  });
});

router.put('/:id', async (req, res) => {
  const till = await findTill(req, res);
  if (!till) return;
  const { name, isActive } = req.body ?? {};
  const data = {
    ...(name !== undefined ? { name } : {}),
    ...(isActive !== undefined ? { isActive } : {}),
  };
  if (!Object.keys(data).length) return badRequest(res, [{ field: 'name', message: 'No fields to update' }]);
  const updated = await prisma.till.update({ where: { id: till.id }, data });
  res.json({ data: { id: updated.id, tillNumber: updated.tillNumber, name: updated.name, isActive: updated.isActive } });
});

router.delete('/:id', async (req, res) => {
  const till = await findTill(req, res);
  if (!till) return;
  await prisma.till.delete({ where: { id: till.id } });
  res.json({ message: 'Till deleted successfully' });
});

// ─── Till attendants ───────────────────────────────────

router.get('/:id/attendants', async (req, res) => {
  const till = await prisma.till.findFirst({
    where: { id: req.params.id, tenantId: req.auth.tenantId },
    include: {
      attendants: {
        include: { attendantRel: { select: { id: true, name: true, phone: true } } },
        orderBy: { assignedAt: 'desc' },
      },
    },
  });
  if (!till) return res.status(404).json({ error: 'Till not found' });
  res.json({
    data: till.attendants.map((a) => ({
      id: a.attendantRel.id,
      name: a.attendantRel.name,
      phone: a.attendantRel.phone,
      assignedAt: a.assignedAt,
    })),
  });
});

router.post('/:id/attendants', async (req, res) => {
  const { attendantId } = req.body ?? {};
  const details = required(req.body, ['attendantId']);
  if (details.length) return badRequest(res, details);

  const till = await findTill(req, res);
  if (!till) return;

  const attendant = await prisma.user.findFirst({
    where: { id: attendantId, tenantId: req.auth.tenantId, role: 'attendant' },
  });
  if (!attendant) return res.status(404).json({ error: 'Till or attendant not found' });

  try {
    await prisma.tillAttendant.create({ data: { till: till.id, attendant: attendant.id } });
  } catch (e) {
    if (e.code === 'P2002') return res.status(400).json({ error: 'Attendant already assigned to this till' });
    throw e;
  }
  res.status(201).json({ message: 'Attendant assigned successfully' });
});

router.delete('/:id/attendants/:attendantId', async (req, res) => {
  const till = await findTill(req, res);
  if (!till) return;
  const removed = await prisma.tillAttendant.deleteMany({
    where: { till: till.id, attendant: req.params.attendantId },
  });
  if (!removed.count) return res.status(404).json({ error: 'Till or attendant not found' });
  res.json({ message: 'Attendant removed successfully' });
});

export default router;
