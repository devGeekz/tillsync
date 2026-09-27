'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { api, apiError, fetcher } from '@/lib/api';
import type { ApiResponse, Attendant } from '@/lib/types';

type ModalState = { mode: 'add' } | { mode: 'edit'; attendant: Attendant } | null;

export default function AttendantsPage() {
  const { data, mutate } = useSWR<ApiResponse<Attendant[]> & { total: number }>('/api/v1/attendants', fetcher);
  const [modal, setModal] = useState<ModalState>(null);
  const [form, setForm] = useState({ name: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const rows = data?.data ?? [];

  function openAdd() {
    setForm({ name: '', phone: '', password: '' });
    setError('');
    setModal({ mode: 'add' });
  }

  function openEdit(attendant: Attendant) {
    setForm({ name: attendant.name, phone: attendant.phone, password: '' });
    setError('');
    setModal({ mode: 'edit', attendant });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (modal?.mode === 'add') {
        if (!form.name || !form.phone || !form.password) {
          setError('Fill in all fields');
          return;
        }
        await api.post('/api/v1/attendants', { name: form.name, phone: form.phone, password: form.password });
      } else if (modal?.mode === 'edit') {
        if (!form.name || !form.phone) {
          setError('Fill in all fields');
          return;
        }
        await api.put(`/api/v1/attendants/${modal.attendant.id}`, { name: form.name, phone: form.phone });
      }
      await mutate();
      setModal(null);
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  }

  async function remove(attendant: Attendant) {
    if (!confirm(`Delete attendant ${attendant.name}?`)) return;
    try {
      await api.delete(`/api/v1/attendants/${attendant.id}`);
      await mutate();
    } catch (err) {
      alert(apiError(err));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">{rows.length} attendants</p>
        <Button onClick={openAdd}>+ Add Attendant</Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-zinc-500">
              <th className="p-4">Name</th>
              <th className="p-4">Phone</th>
              <th className="p-4">Assigned Tills</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!data ? (
              <tr><td colSpan={4} className="p-8 text-center text-zinc-400">Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center text-zinc-500">No attendants yet.</td></tr>
            ) : rows.map((r) => (
              <tr key={r.id} className="border-b border-zinc-100">
                <td className="p-4 font-medium text-zinc-800">{r.name}</td>
                <td className="p-4 text-zinc-600">{r.phone}</td>
                <td className="p-4 text-zinc-600">
                  {r.tills?.length ? r.tills.map((t) => t.tillNumber).join(', ') : '—'}
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <Button variant="ghost" className="px-3 py-1" onClick={() => openEdit(r)}>Edit</Button>
                    <Button variant="ghost" className="px-3 py-1 text-red-500" onClick={() => remove(r)}>Delete</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={modal !== null}
        title={modal?.mode === 'edit' ? 'Edit Attendant' : 'Add Attendant'}
        onClose={() => setModal(null)}
      >
        <form onSubmit={save} className="space-y-4">
          <Input
            id="name"
            label="Name"
            placeholder="Kofi Mensah"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            id="phone"
            label="Phone"
            type="tel"
            placeholder="+233 XX XXX XXXX"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          {modal?.mode === 'add' && (
            <Input
              id="password"
              label="Password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          )}
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1" disabled={busy}>
              {busy ? 'Saving…' : 'Save'}
            </Button>
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setModal(null)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
