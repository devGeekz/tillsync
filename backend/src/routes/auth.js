import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/database.js';
import { requireAuth, requireManager, signToken } from '../middleware/auth.js';
import { PHONE_RE, required, badRequest } from '../utils/validate.js';
import { generateReferralCode } from './referrals.js';

const router = Router();

// compared against when the phone doesn't exist, so login timing doesn't leak which phones are registered
const DUMMY_HASH = bcrypt.hashSync('unused', 10);

router.post('/register', async (req, res) => {
  const { name, phone, email, password, momoNumber, ref } = req.body ?? {};
  const details = required(req.body, ['name', 'phone', 'password']);
  if (phone && !PHONE_RE.test(phone)) details.push({ field: 'phone', message: 'Invalid phone number' });
  if (password && password.length < 8) details.push({ field: 'password', message: 'Password must be at least 8 characters' });
  if (email && !/^\S+@\S+\.\S+$/.test(email)) details.push({ field: 'email', message: 'Invalid email' });
  if (momoNumber && !PHONE_RE.test(momoNumber)) details.push({ field: 'momoNumber', message: 'Invalid mobile money number' });
  if (details.length) return badRequest(res, details);

  if (await prisma.user.findUnique({ where: { phone } })) {
    return res.status(400).json({ error: 'Phone number already registered' });
  }
  if (momoNumber && (await prisma.tenant.findUnique({ where: { momoNumber } }))) {
    return res.status(400).json({ error: 'Mobile money number already registered' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const referrer = ref ? await prisma.tenant.findUnique({ where: { referralCode: ref } }) : null;
  const user = await prisma.$transaction(async (tx) => {
    const tenant = await tx.tenant.create({
      data: {
        name,
        momoNumber: momoNumber || null,
        referralCode: await generateReferralCode(),
        referredById: referrer?.id ?? null,
      },
    });
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

// ponytail: stateless JWT â€” client drops the token; server-side revocation needs a denylist (add if tokens get stolen)
router.post('/logout', (req, res) => res.json({ message: 'Logged out successfully' }));

// Update the shop's profile. Business name and MoMo number live on the tenant, the rest on the user.
// ponytail: manager-only â€” attendants can't rename the shop or change the number payments arrive on
router.put('/profile', requireAuth, requireManager, async (req, res) => {
  const { name, phone, email, momoNumber } = req.body ?? {};
  const details = required(req.body, ['name']);
  if (phone && !PHONE_RE.test(phone)) details.push({ field: 'phone', message: 'Invalid phone number' });
  if (momoNumber && !PHONE_RE.test(momoNumber)) details.push({ field: 'momoNumber', message: 'Invalid mobile money number' });
  if (email && !/^\S+@\S+\.\S+$/.test(email)) details.push({ field: 'email', message: 'Invalid email' });
  if (details.length) return badRequest(res, details);

  const user = await prisma.user.findUniqueOrThrow({ where: { id: req.auth.id } });

  if (phone && phone !== user.phone) {
    if (await prisma.user.findUnique({ where: { phone } })) {
      return res.status(400).json({ error: 'Phone number already registered' });
    }
  }
  if (momoNumber) {
    const taken = await prisma.tenant.findUnique({ where: { momoNumber } });
    if (taken && taken.id !== req.auth.tenantId) {
      return res.status(400).json({ error: 'Mobile money number already registered' });
    }
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(phone !== undefined ? { phone } : {}),
        ...(email !== undefined ? { email: email || null } : {}),
      },
    }),
    prisma.tenant.update({
      where: { id: req.auth.tenantId },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(momoNumber !== undefined ? { momoNumber: momoNumber || null } : {}),
      },
    }),
  ]);

  res.json({
    data: {
      id: user.id,
      name: name ?? user.name,
      phone: phone ?? user.phone,
      ...(momoNumber !== undefined ? { momoNumber: momoNumber || null } : {}),
      email: email !== undefined ? email || null : user.email,
      role: user.role,
      tenantId: user.tenantId,
    },
  });
});

router.get('/me', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.auth.id } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  const tenant = await prisma.tenant.findUnique({ where: { id: user.tenantId } });
  res.json({
    data: {
      id: user.id,
      name: user.name,
      phone: user.phone,
      ...(user.email ? { email: user.email } : {}),
      ...(tenant?.momoNumber ? { momoNumber: tenant.momoNumber } : {}),
      role: user.role,
      tenantId: user.tenantId,
    },
  });
});

router.post('/change-password', requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body ?? {};
  const details = required(req.body, ['currentPassword', 'newPassword']);
  if (newPassword && newPassword.length < 8) details.push({ field: 'newPassword', message: 'Password must be at least 8 characters' });
  if (details.length) return badRequest(res, details);

  const user = await prisma.user.findUnique({ where: { id: req.auth.id } });
  if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(newPassword, 10) } });
  res.json({ message: 'Password updated successfully' });
});

export default router;
