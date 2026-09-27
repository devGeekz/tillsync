export const PHONE_RE = /^\+[1-9]\d{9,14}$/;

export function required(body, fields) {
  return fields
    .filter((f) => body?.[f] === undefined || body?.[f] === null || body?.[f] === '')
    .map((f) => ({ field: f, message: `${f} is required` }));
}

export function badRequest(res, details) {
  return res.status(400).json({ error: 'Validation failed', details });
}
