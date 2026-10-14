import { NextResponse } from 'next/server';

const BACKEND = process.env.BACKEND_URL ?? 'http://localhost:4000';
const WEEK = 60 * 60 * 24 * 7;

// Exchanges credentials for an httpOnly session cookie. The token never reaches JS,
// so an XSS bug can't read it out of localStorage.
export async function proxyAuth(
  req: Request,
  path: string,
  { withToken }: { withToken: boolean }
) {
  const upstream = await fetch(`${BACKEND}/api/v1/auth/${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: await req.text(),
  });
  const json = await upstream.json().catch(() => null);

  if (!upstream.ok) {
    return NextResponse.json(json ?? { error: 'Request failed' }, { status: upstream.status });
  }

  const res = NextResponse.json({ data: json?.data });
  if (withToken && json?.token) {
    res.cookies.set('token', json.token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: WEEK,
    });
  }
  return res;
}