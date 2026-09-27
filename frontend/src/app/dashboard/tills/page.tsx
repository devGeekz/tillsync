'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';

// ponytail: static demo data until backend exists
const initial = [
  { id: '1', tillNumber: '12345', name: 'Main Counter', isActive: true, attendantCount: 2 },
  { id: '2', tillNumber: '67890', name: 'Express Lane', isActive: true, attendantCount: 1 },
  { id: '3', tillNumber: '11111', name: 'Back Office', isActive: false, attendantCount: 0 },
];

export default function TillsPage() {
  const [open, setOpen] = useState(false);
  const [tills, setTills] = useState(initial);
  const [form, setForm] = useState({ tillNumber: '', name: '' });

  function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.tillNumber || !form.name) return;
    setTills([...tills, { id: String(tills.length + 1), ...form, isActive: true, attendantCount: 0 }]);
    setForm({ tillNumber: '', name: '' });
    setOpen(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">{tills.length} tills</p>
        <Button onClick={() => setOpen(true)}>+ Add Till</Button>
      </div>

      {tills.length === 0 ? (
        <Card><p className="text-center text-zinc-500">No tills yet. Add your first till.</p></Card>
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
              <p className="mt-3 text-sm text-zinc-500">Attendants: {t.attendantCount}</p>
              <div className="mt-4 flex gap-2">
                <Button variant="secondary" className="flex-1">Edit</Button>
                <Button
                  variant="danger"
                  className="flex-1"
                  onClick={() => setTills(tills.filter((x) => x.id !== t.id))}
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={open} title="Add Till" onClose={() => setOpen(false)}>
        <form onSubmit={add} className="space-y-4">
          <Input id="tillNumber" label="Till Number" placeholder="12345" value={form.tillNumber} onChange={(e) => setForm({ ...form, tillNumber: e.target.value })} />
          <Input id="name" label="Till Name" placeholder="Main Counter" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1">Save</Button>
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
