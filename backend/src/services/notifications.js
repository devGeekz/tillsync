import { prisma } from '../config/database.js';
import { sendSms } from './sms.js';

const publicNotification = (n, tillNumber) => ({
  id: n.id,
  tillNumber,
  amount: n.amount,
  currency: n.currency,
  ...(n.senderName ? { senderName: n.senderName } : {}),
  ...(n.senderPhone ? { senderPhone: n.senderPhone } : {}),
  channel: n.channel,
  status: n.status,
  createdAt: n.createdAt,
});

// Creates the record, then SMSes every attendant assigned to the till and records the outcome.
// ponytail: fire-and-forget on the SMS (no queue yet) — add BullMQ when sends outpace the request
export async function createNotification({ tenantId, tillId, amount, currency, senderName, senderPhone, channel, externalId }) {
  const till = await prisma.till.findFirst({ where: { id: tillId, tenantId } });
  if (!till) return { error: 'Till not found', status: 404 };

  if (externalId) {
    const dupe = await prisma.notification.findFirst({ where: { tenantId, externalId } });
    if (dupe) return { duplicate: true, notification: dupe, tillNumber: till.tillNumber };
  }

  const notification = await prisma.notification.create({
    data: {
      tenantId,
      tillId: till.id,
      tillNumber: till.tillNumber,
      amount,
      currency: currency ?? 'GHS',
      senderName: senderName ?? null,
      senderPhone: senderPhone ?? null,
      channel: channel ?? 'sms',
      externalId: externalId ?? null,
    },
  });

  const attendants = await prisma.user.findMany({
    where: { tenantId, role: 'attendant', tillAssignments: { some: { till: till.id } } },
    select: { phone: true },
  });

  const message = `Till ${till.tillNumber}: GH¢${amount} received${senderName ? ` from ${senderName}` : ''}.`;
  const sends = await Promise.all(
    attendants.map((a) =>
      sendSms(a.phone, message)
        .then((r) => ({ ok: true, messageId: r.messageId }))
        .catch(() => ({ ok: false }))
    )
  );
  const sentIds = sends.filter((s) => s.ok && s.messageId).map((s) => s.messageId);

  const updated = await prisma.notification.update({
    where: { id: notification.id },
    data: {
      status: attendants.length === 0 ? 'pending' : sentIds.length ? 'sent' : 'failed',
      smsIds: sentIds,
    },
  });

  return { notification: updated, tillNumber: till.tillNumber };
}

export { publicNotification };