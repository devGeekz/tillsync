'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');

  function set(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [key]: e.target.value });
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (Object.values(form).some((v) => !v)) return setError('Fill in all fields');
    if (form.password !== form.confirm) return setError('Passwords do not match');
    setError('Backend not ready yet');
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
          <Button type="submit" className="w-full">Register</Button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-[#22C55E] hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
