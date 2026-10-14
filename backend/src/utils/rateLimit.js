// ponytail: in-memory fixed window — fine for one instance.
// Move to Redis when running more than one backend process.
export function rateLimit({ windowMs, max, key }) {
  const hits = new Map();

  return (req, res, next) => {
    const now = Date.now();
    if (hits.size > 5000) {
      for (const [k, v] of hits) if (now > v.reset) hits.delete(k);
    }

    const k = key(req);
    const rec = hits.get(k);
    if (!rec || now > rec.reset) {
      hits.set(k, { count: 1, reset: now + windowMs });
      return next();
    }
    if (++rec.count > max) {
      res.setHeader('Retry-After', Math.ceil((rec.reset - now) / 1000));
      return res.status(429).json({ error: 'Too many attempts. Try again later.' });
    }
    next();
  };
}