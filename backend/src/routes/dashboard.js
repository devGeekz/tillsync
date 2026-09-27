import { Router } from 'express';
import { prisma } from '../config/database.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/stats', async (req, res) => {
  const tenantId = req.auth.tenantId;
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalTills, activeTills, totalAttendants, notificationsToday, notificationsThisWeek, notificationsThisMonth] =
    await Promise.all([
      prisma.till.count({ where: { tenantId } }),
      prisma.till.count({ where: { tenantId, isActive: true } }),
      prisma.user.count({ where: { tenantId, role: 'attendant' } }),
      prisma.notification.count({ where: { tenantId, createdAt: { gte: startOfToday } } }),
      prisma.notification.count({ where: { tenantId, createdAt: { gte: startOfWeek } } }),
      prisma.notification.count({ where: { tenantId, createdAt: { gte: startOfMonth } } }),
    ]);

  res.json({
    data: {
      totalTills,
      activeTills,
      totalAttendants,
      notificationsToday,
      notificationsThisWeek,
      notificationsThisMonth,
    },
  });
});

export default router;
