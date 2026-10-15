import jwt from 'jsonwebtoken';
import { prisma } from '../config/database.js';

function parseCookies(header = '') {
  const out = {};
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization ?? '';
  const bearer = header.startsWith('Bearer ') ? header.slice(7) : null;
  // browsers send the httpOnly cookie; API clients send Bearer
  const token = bearer || parseCookies(req.headers.cookie).token;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.auth = { id: payload.sub, tenantId: payload.tenantId, role: payload.role };
    next();
  } catch {
    res.status(401).json({ error: 'Not authenticated' });
  }
}

export function signToken(user) {
  // ponytail: role lives in the token — role changes take effect after expiry (7d)
  return jwt.sign(
    { sub: user.id, tenantId: user.tenantId, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

const MANAGER_ROLES = ['owner', 'manager'];

export const isManager = (req) => MANAGER_ROLES.includes(req.auth.role);

// Attendants only ever see the tills they're assigned to
export function tillScope(req) {
  return isManager(req)
    ? { tenantId: req.auth.tenantId }
    : { tenantId: req.auth.tenantId, attendants: { some: { attendant: req.auth.id } } };
}

export function requireManager(req, res, next) {
  if (!isManager(req)) return res.status(403).json({ error: 'Not allowed for attendants' });
  next();
}

// platform admin — checked against the DB (not the token) so revoking access is instant
export async function requireAdmin(req, res, next) {
  const user = await prisma.user.findUnique({ where: { id: req.auth.id }, select: { isAdmin: true } });
  if (!user?.isAdmin) return res.status(403).json({ error: 'Admin only' });
  next();
}
