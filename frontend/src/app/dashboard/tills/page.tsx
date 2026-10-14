'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { api, apiError, fetcher } from '@/lib/api';
import type { ApiResponse, Attendant, Till } from '@/lib/types';

type ModalState = { mode: 'add' } | { mode: 'edit'; till: Till } | null;

function AttendantsModal({ till, onClose, onChanged }: { till: Till; onClose: () => void; onChanged: () => void }) {
  const { data: assigned, mutate: mutateAssigned } = useSWR<{ data: Attendant[] }>(`/api/v1/tills/${till.id}/attendants`, fetcher);
  const { data: all } = useSWR<ApiResponse<Attendant[]>>('/api/v1/attendants', fetcher);
  const [attendantId, setAttendantId] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const assignedIds = new Set((assigned?.data ?? []).map((a) => a.id));
  const available = (all?.data ?? []).filter((a) => !assignedIds.has(a.id));

  async function run(fn: () => Promise<unknown>) {
    setBusy(true);
    setError('');
    try {
      await fn();
      await mutateAssigned();
      onChanged();
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open title={`Attendants on #${till.tillNumber}`} onClose={onClose}>
      <div className="space-y-4">
        {assigned === undefined ? (
          <p className="text-sm text-zinc-400">Loading…</p>
        ) : assigned.data.length === 0 ? (
          <p className="text-sm text-zinc-500">Nobody assigned yet. They&apos;ll get SMS alerts when this till is paid.</p>
        ) : (
          <ul className="divide-y divide-zinc-100">
            {assigned.data.map((a) => (
              <li key={a.id} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-zinc-800">{a.name}</p>
                  <p className="text-xs text-zinc-500">{a.phone}</p>
                </div>
                <Button
                  variant="ghost"
                  className="px-3 py-1 text-red-500"
                  disabled={busy}
                  onClick={() => run(() => api.delete(`/api/v1/tills/${till.id}/attendants/${a.id}`))}
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        )}

        {available.length === 0 ? (
          <p className="text-xs text-zinc-400">
            {assignedIds.size ? 'Everyone is already assigned.' : 'Create attendants first, then assign them here.'}
          </p>
        ) : (
          <div className="flex gap-2">
            <select
              className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              value={attendantId}
              onChange={(e) => setAttendantId(e.target.value)}
            >
              <option value="">Choose an attendant…</option>
              {available.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} — {a.phone}
                </option>
              ))}
            </select>
            <Button
              disabled={busy || !attendantId}
              onClick={() =>
                run(async () => {
                  await api.post(`/api/v1/tills/${till.id}/attendants`, { attendantId });
                  setAttendantId('');
                })
              }
            >
              Assign
            </Button>
          </div>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button variant="secondary" className="w-full" onClick={onClose}>Done</Button>
      </div>
    </Modal>
  );
}

export default function TillsPage() {
  const { data, mutate } = useSWR<ApiResponse<Till[]> & { total: number }>('/api/v1/tills', fetcher);
  const [modal, setModal] = useState<ModalState>(null);
  const [assigning, setAssigning] = useState<Till | null>(null);
  const [form, setForm] = useState({ tillNumber: '', name: '', isActive: true });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const tills = data?.data ?? [];

  function openAdd() {
    setForm({ tillNumber: '', name: '', isActive: true });
    setError('');
    setModal({ mode: 'add' });
  }

  function openEdit(till: Till) {
    setForm({ tillNumber: till.tillNumber, name: till.name, isActive: till.isActive });
    setError('');
    setModal({ mode: 'edit', till });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (modal?.mode === 'add') {
      if (!form.tillNumber || !form.name) return setError('Fill in all fields');
    } else if (!form.name) {
      return setError('Fill in all fields');
    }
    setBusy(true);
    setError('');
    try {
      if (modal?.mode === 'add') {
        await api.post('/api/v1/tills', { tillNumber: form.tillNumber, name: form.name });
      } else if (modal?.mode === 'edit') {
        await api.put(`/api/v1/tills/${modal.till.id}`, { name: form.name, isActive: form.isActive });
      }
      await mutate();
      setModal(null);
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  }

  async function remove(till: Till) {
    if (!confirm(`Delete till #${till.tillNumber}?`)) return;
    try {
      await api.delete(`/api/v1/tills/${till.id}`);
      await mutate();
    } catch (err) {
      alert(apiError(err));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">{tills.length} tills</p>
        <Button onClick={openAdd}>+ Add Till</Button>
      </div>

      {data && tills.length === 0 ? (
        <Card><p className="text-center text-zinc-500">No tills yet. Add your first till.</p></Card>
      ) : !data ? (
        <Card><p className="text-center text-zinc-400">Loading…</p></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tills.map((t) => (
            <Card key={t.id}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-lg font-semibold text-zinc-900">#{t.tillNumber}</p>
                  <p className="text-sm text-zinc-500">{t.name}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs ${t.isActive ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-500'}`}>
                  {t.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="mt-3 text-sm text-zinc-500">Attendants: {t.attendantCount ?? 0}</p>
              <div className="mt-4 flex gap-2">
                <Button variant="secondary" className="flex-1" onClick={() => openEdit(t)}>
                  Edit
                </Button>
                <Button variant="secondary" className="flex-1" onClick={() => setAssigning(t)}>
                  Attendants
                </Button>
                <Button variant="danger" onClick={() => remove(t)}>
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={modal !== null}
        title={modal?.mode === 'edit' ? 'Edit Till' : 'Add Till'}
        onClose={() => setModal(null)}
      >
        <form onSubmit={save} className="space-y-4">
          {modal?.mode === 'add' && (
            <Input
              id="tillNumber"
              label="Till Number"
              placeholder="12345"
              value={form.tillNumber}
              onChange={(e) => setForm({ ...form, tillNumber: e.target.value })}
            />
          )}
          <Input
            id="name"
            label="Till Name"
            placeholder="Main Counter"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          {modal?.mode === 'edit' && (
            <label className="flex items-center gap-2 text-sm text-zinc-700">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="h-4 w-4 accent-[#22C55E]"
              />
              Active
            </label>
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

      {assigning && (
        <AttendantsModal till={assigning} onClose={() => setAssigning(null)} onChanged={() => mutate()} />
      )}
    </div>
  );
}
