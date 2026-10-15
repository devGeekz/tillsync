'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { api, apiError } from '@/lib/api';

export default function ResetPasswordPage() {
  const router = useRouter();
  // ponytail: phone from the URL directly — useSearchParams would need a Suspense boundary
  const [phone, setPhone] = useState(() =>
    typeof window === 'undefined' ? '' : new URLSearchParams(window.location.search).get('phone') ?? ''
  );
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!phone || !code || !password) return setError('Fill in all fields');
    setBusy(true);
    setError('');
    try {
      await api.post('/api/v1/auth/reset-password', { phone, code, newPassword: password });
      router.push('/login');
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4">
      <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-zinc-900">New password</h1>
        <p className="mt-1 text-sm text-zinc-500">Enter the code and choose a new password.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <Input id="phone" label="Phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Input
            id="code"
            label="6-digit code"
            inputMode="numeric"
            placeholder="482913"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <Input
            id="password"
            label="New password"
            type="password"
            placeholder="at least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? 'Resetting…' : 'Reset password'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          <Link href="/login" className="font-medium text-[#22C55E] hover:underline">Back to login</Link>
        </p>
      </div>
    </div>
  );
}
