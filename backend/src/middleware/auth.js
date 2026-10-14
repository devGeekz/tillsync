import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
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
