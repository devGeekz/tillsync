'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { api, apiError, fetcher } from '@/lib/api';
import { setStoredUser } from '@/lib/auth';
import type { ApiResponse, User } from '@/lib/types';

type Me = User & { momoNumber?: string };

function ProfileForm({ initial, onSaved }: { initial: Me; onSaved: () => void }) {
  const [form, setForm] = useState({
    name: initial.name,
    momoNumber: initial.momoNumber ?? '',
    email: initial.email ?? '',
    phone: initial.phone,
  });
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    setError('');
    try {
      const { data } = await api.put('/api/v1/auth/profile', {
        name: form.name,
        ...(form.phone ? { phone: form.phone } : {}),
        ...(form.email ? { email: form.email } : {}),
        momoNumber: form.momoNumber,
      });
      setStoredUser(data.data);
      onSaved();
      setMsg('Profile saved');
      setTimeout(() => setMsg(''), 2500);
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <Input id="name" label="Business Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <Input id="momoNumber" label="MoMo Number" type="tel" placeholder="+233 XX XXX XXXX" value={form.momoNumber} onChange={(e) => setForm({ ...form, momoNumber: e.target.value })} />
      <Input id="email" label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <Input id="phone" label="Login Phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      <p className="text-xs text-zinc-500">
        Payments sent to your MoMo number trigger SMS alerts to your attendants&apos; tills.
      </p>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {msg && <p className="text-sm text-green-600">{msg}</p>}
      <Button onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save Changes'}</Button>
    </div>
  );
}

export default function SettingsPage() {
  const { data, mutate } = useSWR<ApiResponse<Me>>('/api/v1/auth/me', fetcher);
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwError, setPwError] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [busy, setBusy] = useState(false);

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pw.newPassword !== pw.confirm) return setPwError('New passwords do not match');
    setBusy(true);
    setPwError('');
    try {
      await api.post('/api/v1/auth/change-password', {
        currentPassword: pw.currentPassword,
        newPassword: pw.newPassword,
      });
      setPw({ currentPassword: '', newPassword: '', confirm: '' });
      setPwMsg('Password updated');
      setTimeout(() => setPwMsg(''), 2500);
    } catch (err) {
      setPwError(apiError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Card title="Profile">
        {!data?.data ? (
          <p className="text-sm text-zinc-400">Loading…</p>
        ) : (
          <ProfileForm key={data.data.id} initial={data.data} onSaved={() => mutate()} />
        )}
      </Card>

      <Card title="Change Password">
        <form onSubmit={changePassword} className="space-y-4">
          <Input id="current" label="Current Password" type="password" placeholder="••••••••" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} />
          <Input id="new" label="New Password" type="password" placeholder="at least 8 characters" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} />
          <Input id="confirm" label="Confirm New Password" type="password" placeholder="••••••••" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />
          {pwError && <p className="text-sm text-red-500">{pwError}</p>}
          {pwMsg && <p className="text-sm text-green-600">{pwMsg}</p>}
          <Button variant="secondary" type="submit" disabled={busy}>Update Password</Button>
        </form>
      </Card>
    </div>
  );
}