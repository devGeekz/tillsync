'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { api, apiError } from '@/lib/api';
import { setToken, setStoredUser } from '@/lib/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function set(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [key]: e.target.value });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { name, phone, email, password, confirm } = form;
    if (!name || !phone || !password || !confirm) return setError('Fill in all fields');
    if (password !== confirm) return setError('Passwords do not match');
    setBusy(true);
    setError('');
    try {
      const { data } = await api.post('/api/v1/auth/register', {
        name,
        phone,
        password,
        ...(email ? { email } : {}),
      });
      setToken(data.token);
      setStoredUser(data.data);
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4">
      <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-zinc-900">TillSync</h1>
        <p className="mt-1 text-sm text-zinc-500">Create your merchant account</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <Input id="name" label="Business Name" placeholder="Kwame's Shop" value={form.name} onChange={set('name')} />
          <Input id="phone" label="Phone" type="tel" placeholder="+233 XX XXX XXXX" value={form.phone} onChange={set('phone')} />
          <Input id="email" label="Email (optional)" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} />
          <Input id="password" label="Password" type="password" placeholder="••••••••" value={form.password} onChange={set('password')} />
          <Input id="confirm" label="Confirm Password" type="password" placeholder="••••••••" value={form.confirm} onChange={set('confirm')} />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? 'Creating account…' : 'Register'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-[#22C55E] hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
