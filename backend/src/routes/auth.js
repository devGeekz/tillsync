import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
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
      ...(user.isAdmin ? { isAdmin: true } : {}),
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

// 6-digit code over SMS, 15 minutes to use it. Always 200 for well-formed numbers
// so attackers can't probe which phones are registered.
router.post('/forgot-password', async (req, res) => {
  const { phone } = req.body ?? {};
  if (!phone || !PHONE_RE.test(phone)) {
    return res.status(400).json({ error: 'Validation failed', details: [{ field: 'phone', message: 'Invalid phone number' }] });
  }

  const user = await prisma.user.findUnique({ where: { phone } });
  if (user) {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    await prisma.$transaction([
      prisma.passwordReset.deleteMany({ where: { userId: user.id } }),
      prisma.passwordReset.create({
        data: {
          userId: user.id,
          codeHash: crypto.createHash('sha256').update(code).digest('hex'),
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        },
      }),
    ]);
    console.log(`[sms:stub] password reset code for ${phone}: ${code}`);
  }
  res.json({ message: 'If that number is registered, a reset code is on its way' });
});

router.post('/reset-password', async (req, res) => {
  const { phone, code, newPassword } = req.body ?? {};
  const details = required(req.body, ['phone', 'code', 'newPassword']);
  if (newPassword && newPassword.length < 8) details.push({ field: 'newPassword', message: 'Password must be at least 8 characters' });
  if (details.length) return badRequest(res, details);

  const generic = () => res.status(400).json({ error: 'Invalid or expired code' });
  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user) return generic();

  const hash = crypto.createHash('sha256').update(String(code)).digest();
  const rows = await prisma.passwordReset.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } });
  const match = rows.find((r) => {
    const b = Buffer.from(r.codeHash, 'hex');
    return b.length === hash.length && crypto.timingSafeEqual(b, hash);
  });
  if (!match || match.expiresAt < new Date()) return generic();

  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(newPassword, 10) } }),
    prisma.passwordReset.deleteMany({ where: { userId: user.id } }),
  ]);
  res.json({ message: 'Password reset successfully' });
});

export default router;
