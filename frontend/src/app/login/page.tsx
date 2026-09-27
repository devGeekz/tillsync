'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  // ponytail: fake submit until backend exists
  const [error, setError] = useState('');

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!phone || !password) setError('Fill in all fields');
    else setError('Backend not ready yet');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4">
      <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-zinc-900">TillSync</h1>
        <p className="mt-1 text-sm text-zinc-500">Sign in to your account</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <Input
            id="phone"
            label="Phone"
            type="tel"
            placeholder="+233 XX XXX XXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <Input
            id="password"
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full">Login</Button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-medium text-[#22C55E] hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
}
