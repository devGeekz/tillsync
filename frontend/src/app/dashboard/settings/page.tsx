'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';

export default function SettingsPage() {
  const [profile, setProfile] = useState({ name: "Kwame's Shop", email: 'kwame@example.com' });
  const [saved, setSaved] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  function notify(msg: string) {
    setSaved(msg);
    setTimeout(() => setSaved(''), 2000);
  }

  return (
    <div className="max-w-2xl space-y-6">
      {saved && <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">{saved}</p>}

      <Card title="Profile">
        <div className="space-y-4">
          <Input id="name" label="Business Name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
          <Input id="email" label="Email" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
          <Input id="phone" label="Phone" value="+233244123456" readOnly className="bg-zinc-50 text-zinc-400" />
          <Button onClick={() => notify('Profile saved (demo only)')}>Save Changes</Button>
        </div>
      </Card>

      <Card title="Change Password">
        <form onSubmit={(e) => { e.preventDefault(); notify('Password updated (demo only)'); }} className="space-y-4">
          <Input id="current" label="Current Password" type="password" placeholder="••••••••" required />
          <Input id="new" label="New Password" type="password" placeholder="••••••••" required />
          <Input id="confirm" label="Confirm New Password" type="password" placeholder="••••••••" required />
          <Button variant="secondary" type="submit">Update Password</Button>
        </form>
      </Card>

      <Card title="Danger Zone" className="border-red-200">
        <p className="text-sm text-zinc-500">Permanently delete your account and all data.</p>
        <Button variant="danger" className="mt-3" onClick={() => setConfirmDelete(true)}>Delete Account</Button>
      </Card>

      <Modal open={confirmDelete} title="Delete Account?" onClose={() => setConfirmDelete(false)}>
        <p className="text-sm text-zinc-600">This action cannot be undone.</p>
        <div className="mt-4 flex gap-3">
          <Button variant="danger" className="flex-1" onClick={() => setConfirmDelete(false)}>Yes, Delete</Button>
          <Button variant="secondary" className="flex-1" onClick={() => setConfirmDelete(false)}>Cancel</Button>
        </div>
      </Modal>
    </div>
  );
}
