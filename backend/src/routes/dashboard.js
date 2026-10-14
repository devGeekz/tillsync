import { Router } from 'express';
import { prisma } from '../config/database.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// attendants see only their own tills and the notifications on them
const tillFilter = (req) =>
  req.auth.role === 'attendant' ? { attendants: { some: { attendant: req.auth.id } } } : {};
const notificationFilter = (req) =>
  req.auth.role === 'attendant' ? { till: { attendants: { some: { attendant: req.auth.id } } } } : {};

router.get('/stats', async (req, res) => {
  const tenantId = req.auth.tenantId;
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalTills, activeTills, totalAttendants, notificationsToday, notificationsThisWeek, notificationsThisMonth] =
    await Promise.all([
      prisma.till.count({ where: { tenantId, ...tillFilter(req) } }),
      prisma.till.count({ where: { tenantId, isActive: true, ...tillFilter(req) } }),
      prisma.user.count({ where: { tenantId, role: 'attendant' } }),
      prisma.notification.count({ where: { tenantId, createdAt: { gte: startOfToday }, ...notificationFilter(req) } }),
      prisma.notification.count({ where: { tenantId, createdAt: { gte: startOfWeek }, ...notificationFilter(req) } }),
      prisma.notification.count({ where: { tenantId, createdAt: { gte: startOfMonth }, ...notificationFilter(req) } }),
    ]);

  res.json({
    data: {
      totalTills,
      activeTills,
      // attendants have no business knowing shop staffing levels
      ...(req.auth.role === 'attendant' ? {} : { totalAttendants }),
      notificationsToday,
      notificationsThisWeek,
      notificationsThisMonth,
    },
  });
});

export default router;
