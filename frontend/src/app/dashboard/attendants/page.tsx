'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';

// ponytail: static demo data until backend exists
const initial = [
  { id: '1', name: 'Kofi Mensah', phone: '+233244123456', tills: '12345', status: 'Active' },
  { id: '2', name: 'Ama Asante', phone: '+233244789012', tills: '12345, 67890', status: 'Active' },
];

export default function AttendantsPage() {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState(initial);
  const [form, setForm] = useState({ name: '', phone: '', password: '' });

  function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.phone || !form.password) return;
    setRows([...rows, { id: String(rows.length + 1), name: form.name, phone: form.phone, tills: '—', status: 'Active' }]);
    setForm({ name: '', phone: '', password: '' });
    setOpen(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">{rows.length} attendants</p>
        <Button onClick={() => setOpen(true)}>+ Add Attendant</Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-zinc-500">
              <th className="p-4">Name</th>
              <th className="p-4">Phone</th>
              <th className="p-4">Assigned Tills</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-zinc-500">No attendants yet.</td></tr>
            ) : rows.map((r) => (
              <tr key={r.id} className="border-b border-zinc-100">
                <td className="p-4 font-medium text-zinc-800">{r.name}</td>
                <td className="p-4 text-zinc-600">{r.phone}</td>
                <td className="p-4 text-zinc-600">{r.tills}</td>
                <td className="p-4"><span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">{r.status}</span></td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <Button variant="ghost" className="px-3 py-1">Edit</Button>
                    <Button variant="ghost" className="px-3 py-1 text-red-500" onClick={() => setRows(rows.filter((x) => x.id !== r.id))}>Delete</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={open} title="Add Attendant" onClose={() => setOpen(false)}>
        <form onSubmit={add} className="space-y-4">
          <Input id="name" label="Name" placeholder="Kofi Mensah" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input id="phone" label="Phone" type="tel" placeholder="+233 XX XXX XXXX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input id="password" label="Password" type="password" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1">Save</Button>
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
