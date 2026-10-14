import { proxyAuth } from '@/lib/server-auth';

export async function POST(req: Request) {
  return proxyAuth(req, 'login', { withToken: true });
}