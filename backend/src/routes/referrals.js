import { Router } from 'express';
import { prisma } from '../config/database.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// 8 chars from an unambiguous alphabet (no 0/O/1/I) so it survives being read over the phone
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export async function generateReferralCode() {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = Array.from({ length: 8 }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join('');
    if (!(await prisma.tenant.findUnique({ where: { referralCode: code } }))) return code;
  }
  throw new Error('Could not generate a unique referral code');
}

router.get('/code', async (req, res) => {
  const tenant = await prisma.tenant.findUniqueOrThrow({ where: { id: req.auth.tenantId } });
  const code = tenant.referralCode ?? (await generateReferralCode());
  if (code !== tenant.referralCode) {
    await prisma.tenant.update({ where: { id: tenant.id }, data: { referralCode: code } });
  }
  res.json({ data: { code, link: `${process.env.APP_URL ?? 'http://localhost:3000'}/register?ref=${code}` } });
});

router.get('/stats', async (req, res) => {
  const referrals = await prisma.tenant.findMany({
    where: { referredById: req.auth.tenantId },
    select: { name: true, createdAt: true, subscriptionStatus: true },
    orderBy: { createdAt: 'desc' },
  });
  const successful = referrals.filter((r) => r.subscriptionStatus === 'active').length;
  res.json({
    data: {
      totalReferrals: referrals.length,
      successfulReferrals: successful,
      pendingReferrals: referrals.length - successful,
      totalCommission: 0, // ponytail: no commission engine yet — always 0 until payouts exist
      currency: 'GHS',
      referrals: referrals.map((r) => ({
        name: r.name,
        joinedAt: r.createdAt,
        status: r.subscriptionStatus === 'active' ? 'successful' : 'pending',
        commission: 0,
      })),
    },
  });
});

export default router;