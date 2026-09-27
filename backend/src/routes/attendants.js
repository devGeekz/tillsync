import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/database.js';
import { requireAuth } from '../middleware/auth.js';
import { PHONE_RE, required, badRequest } from '../utils/validate.js';

const router = Router();
router.use(requireAuth);

// Not in the original contract — added while building the attendants page (frontend needs a flat list).
router.get('/', async (req, res) => {
  const rows = await prisma.user.findMany({
    where: { tenantId: req.auth.tenantId, role: 'attendant' },
    include: { tillAssignments: { include: { tillRel: { select: { id: true, tillNumber: true } } } } },
    orderBy: { createdAt: 'asc' },
  });
  const data = rows.map((u) => ({
    id: u.id,
    name: u.name,
    phone: u.phone,
    tills: u.tillAssignments.map((a) => ({ id: a.tillRel.id, tillNumber: a.tillRel.tillNumber })),
  }));
  res.json({ data, total: data.length });
});

router.post('/', async (req, res) => {
  const { name, phone, password } = req.body ?? {};
  const details = required(req.body, ['name', 'phone', 'password']);
  if (phone && !PHONE_RE.test(phone)) details.push({ field: 'phone', message: 'Invalid phone number' });
  if (password && password.length < 8) details.push({ field: 'password', message: 'Password must be at least 8 characters' });
  if (details.length) return badRequest(res, details);

  if (await prisma.user.findUnique({ where: { phone } })) {
    return res.status(400).json({ error: 'Phone number already exists' });
  }

  const user = await prisma.user.create({
    data: { name, phone, passwordHash: await bcrypt.hash(password, 10), role: 'attendant', tenantId: req.auth.tenantId },
  });
  res.status(201).json({ data: { id: user.id, name: user.name, phone: user.phone, role: user.role } });
});

export default router;
