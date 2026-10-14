import { Router } from 'express';
import crypto from 'node:crypto';
import { prisma } from '../config/database.js';
import { createNotification } from '../services/notifications.js';

const router = Router();

function verifySignature(req) {
  const secret = process.env.WEBHOOK_SECRET;
  const header = req.get('X-TillSync-Signature');
  if (!secret || !header || !req.rawBody) return false;
  const expected = crypto.createHmac('sha256', secret).update(req.rawBody).digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(header);
  return a.length === b.length && crypto.timingSafeEqual(a, b); // ponytail: length check first, timingSafeEqual throws on mismatch
}

// Called by MTN MoMo, not the frontend — auth is the signature, not a JWT
router.post('/momo', async (req, res) => {
  if (!verifySignature(req)) return res.status(401).json({ error: 'Invalid signature' });

  const { momoNumber, tillNumber, amount, currency, senderName, senderPhone, externalId, referenceId, status } = req.body ?? {};
  if (status && status !== 'SUCCESSFUL') {
    console.log(`[momo] ignoring ${status} for ${momoNumber}`);
    return res.json({ status: 'ignored' });
  }
  if (!momoNumber || !tillNumber || amount === undefined) {
    return res.status(400).json({ error: 'Missing momoNumber, tillNumber or amount' });
  }

  const tenant = await prisma.tenant.findUnique({ where: { momoNumber } });
  if (!tenant) return res.status(404).json({ error: 'Unknown momoNumber' });

  const till = await prisma.till.findFirst({ where: { tenantId: tenant.id, tillNumber } });
  if (!till) return res.status(404).json({ error: 'Unknown tillNumber for this merchant' });

  const result = await createNotification({
    tenantId: tenant.id,
    tillId: till.id,
    amount: Number(amount),
    currency: currency ?? 'GHS',
    senderName: senderName ?? undefined,
    senderPhone: senderPhone ?? (req.body?.payer?.partyId ? `+${req.body.payer.partyId}` : undefined),
    channel: 'sms',
    externalId: externalId ?? referenceId ?? null,
  });
  if (result.error) return res.status(result.status).json({ error: result.error });
  if (result.duplicate) return res.json({ status: 'duplicate' });

  res.json({ status: 'received', notificationId: result.notification.id });
});

export default router;