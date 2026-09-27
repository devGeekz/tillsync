'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { api, apiError, fetcher } from '@/lib/api';
import type { ApiResponse, Till } from '@/lib/types';

type ModalState = { mode: 'add' } | { mode: 'edit'; till: Till } | null;

export default function TillsPage() {
  const { data, mutate } = useSWR<ApiResponse<Till[]> & { total: number }>('/api/v1/tills', fetcher);
  const [modal, setModal] = useState<ModalState>(null);
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
                <Button variant="danger" className="flex-1" onClick={() => remove(t)}>
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
    </div>
  );
}
