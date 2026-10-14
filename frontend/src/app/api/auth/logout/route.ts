import { NextResponse } from 'next/server';
import { BACKEND } from '@/lib/server-env';

export async function POST() {
  await fetch(`${BACKEND}/api/v1/auth/logout`, { method: 'POST' }).catch(() => {});
  const res = NextResponse.json({ message: 'Logged out successfully' });
  res.cookies.delete('token');
  return res;
}