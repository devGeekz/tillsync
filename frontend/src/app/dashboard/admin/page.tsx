'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { api, apiError, fetcher } from '@/lib/api';
import type { Merchant } from '@/lib/types';

export default function AdminPage() {
  const { data, mutate } = useSWR<{ data: Merchant[]; total: number }>('/api/v1/merchants', fetcher);
  const [editing, setEditing] = useState<Merchant | null>(null);
  const [form, setForm] = useState({ name: '', email: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const rows = data?.data ?? [];

  function openEdit(m: Merchant) {
    setForm({ name: m.name, email: m.email ?? '' });
    setError('');
    setEditing(m);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!editing || !form.name) return;
    setBusy(true);
    setError('');
    try {
      await api.put(`/api/v1/merchants/${editing.id}`, { name: form.name, email: form.email });
      await mutate();
      setEditing(null);
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  }

  async function remove(m: Merchant) {
    if (!confirm(`Delete ${m.name} and everything under it?`)) return;
    try {
      await api.delete(`/api/v1/merchants/${m.id}`);
      await mutate();
    } catch (err) {
      alert(apiError(err));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">{rows.length} merchants</p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-zinc-500">
              <th className="p-4">Merchant</th>
              <th className="p-4">Phone</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!data ? (
              <tr><td colSpan={4} className="p-8 text-center text-zinc-400">Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center text-zinc-500">No merchants yet.</td></tr>
            ) : rows.map((m) => (
              <tr key={m.id} className="border-b border-zinc-100">
                <td className="p-4 font-medium text-zinc-800">{m.name}</td>
                <td className="p-4 text-zinc-600">{m.phone ?? '—'}</td>
                <td className="p-4">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${m.subscriptionStatus === 'active' ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-600'}`}>
                    {m.subscriptionStatus}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <Button variant="ghost" className="px-3 py-1" onClick={() => openEdit(m)}>Edit</Button>
                    <Button variant="ghost" className="px-3 py-1 text-red-500" onClick={() => remove(m)}>Delete</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={editing !== null} title="Edit Merchant" onClose={() => setEditing(null)}>
        <form onSubmit={save} className="space-y-4">
          <Input id="name" label="Business Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input id="email" label="Owner Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1" disabled={busy}>{busy ? 'Saving…' : 'Save'}</Button>
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setEditing(null)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
