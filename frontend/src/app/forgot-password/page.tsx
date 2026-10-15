'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { api, apiError } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [phone, setPhone] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!phone) return setError('Enter your phone number');
    setBusy(true);
    setError('');
    try {
      await api.post('/api/v1/auth/forgot-password', { phone });
      setDone(true);
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4">
      <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-zinc-900">Reset password</h1>
        <p className="mt-1 text-sm text-zinc-500">
          {done ? 'Check your phone for the 6-digit code.' : "We'll text you a 6-digit code."}
        </p>

        {done ? (
          <Link href={`/reset-password?phone=${encodeURIComponent(phone)}`} className="mt-6 block">
            <Button className="w-full">Enter code</Button>
          </Link>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <Input
              id="phone"
              label="Phone"
              type="tel"
              placeholder="+233 XX XXX XXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? 'Sending…' : 'Send code'}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-zinc-500">
          <Link href="/login" className="font-medium text-[#22C55E] hover:underline">Back to login</Link>
        </p>
      </div>
    </div>
  );
}
