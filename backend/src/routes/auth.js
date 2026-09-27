import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/database.js';
import { requireAuth, signToken } from '../middleware/auth.js';
import { PHONE_RE, required, badRequest } from '../utils/validate.js';

const router = Router();

// compared against when the phone doesn't exist, so login timing doesn't leak which phones are registered
const DUMMY_HASH = bcrypt.hashSync('unused', 10);

router.post('/register', async (req, res) => {
  const { name, phone, email, password } = req.body ?? {};
  const details = required(req.body, ['name', 'phone', 'password']);
  if (phone && !PHONE_RE.test(phone)) details.push({ field: 'phone', message: 'Invalid phone number' });
  if (password && password.length < 8) details.push({ field: 'password', message: 'Password must be at least 8 characters' });
  if (email && !/^\S+@\S+\.\S+$/.test(email)) details.push({ field: 'email', message: 'Invalid email' });
  if (details.length) return badRequest(res, details);

  if (await prisma.user.findUnique({ where: { phone } })) {
    return res.status(400).json({ error: 'Phone number already registered' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.$transaction(async (tx) => {
    const tenant = await tx.tenant.create({ data: { name } });
    return tx.user.create({
      data: { name, phone, email: email || null, passwordHash, tenantId: tenant.id },
    });
  });

  res.status(201).json({
    data: {
      id: user.id,
      name: user.name,
      phone: user.phone,
      ...(user.email ? { email: user.email } : {}),
      role: user.role,
      createdAt: user.createdAt,
    },
    token: signToken(user),
  });
});

router.post('/login', async (req, res) => {
  const { phone, password } = req.body ?? {};
  const details = required(req.body, ['phone', 'password']);
  if (details.length) return badRequest(res, details);

  const user = await prisma.user.findUnique({ where: { phone } });
  const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !ok) return res.status(401).json({ error: 'Invalid phone or password' });

  res.json({
    data: { id: user.id, name: user.name, phone: user.phone, role: user.role },
    token: signToken(user),
  });
});

// ponytail: stateless JWT — client drops the token; server-side revocation needs a denylist (add if tokens get stolen)
router.post('/logout', (req, res) => res.json({ message: 'Logged out successfully' }));

router.get('/me', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.auth.id } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({
    data: {
      id: user.id,
      name: user.name,
      phone: user.phone,
      ...(user.email ? { email: user.email } : {}),
      role: user.role,
      tenantId: user.tenantId,
    },
  });
});

export default router;
