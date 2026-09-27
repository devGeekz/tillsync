'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

// ponytail: static demo data until backend exists
const stats = [
  { label: 'Total Referrals', value: '5' },
  { label: 'Successful', value: '3' },
  { label: 'Pending', value: '2' },
  { label: 'Commission', value: 'GHS 15' },
];

const referred = [
  { name: "Ama's Store", date: 'Jan 10, 2026', status: 'Successful', commission: 'GHS 5' },
  { name: 'Kente Shop', date: 'Jan 22, 2026', status: 'Successful', commission: 'GHS 5' },
  { name: 'Accra Electronics', date: 'Feb 1, 2026', status: 'Pending', commission: '—' },
];

export default function ReferralsPage() {
  const [copied, setCopied] = useState('');
  const code = 'KWAME2026';
  const link = `https://tillsync.app/register?ref=${code}`;

  function copy(text: string, what: string) {
    navigator.clipboard.writeText(text);
    setCopied(what);
    setTimeout(() => setCopied(''), 2000);
  }

  return (
    <div className="space-y-6">
      <Card>
        <p className="text-sm font-medium text-zinc-700">Your Referral Code</p>
        <p className="mt-3 select-all rounded-lg border border-dashed border-zinc-300 bg-zinc-50 py-4 text-center font-mono text-2xl tracking-widest text-zinc-900">
          {code}
        </p>
        <p className="mt-3 select-all break-all rounded-lg bg-zinc-50 px-3 py-2 text-sm text-zinc-500">{link}</p>
        <div className="mt-4 flex gap-3">
          <Button onClick={() => copy(code, 'code')}>{copied === 'code' ? 'Copied!' : 'Copy Code'}</Button>
          <Button variant="secondary" onClick={() => copy(link, 'link')}>{copied === 'link' ? 'Copied!' : 'Copy Link'}</Button>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <p className="text-sm text-zinc-500">{s.label}</p>
            <p className="mt-1 text-2xl font-bold text-zinc-900">{s.value}</p>
          </Card>
        ))}
      </div>

      <Card title="Referred Merchants">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-zinc-500">
              <th className="pb-2">Merchant</th>
              <th className="pb-2">Date</th>
              <th className="pb-2">Status</th>
              <th className="pb-2">Commission</th>
            </tr>
          </thead>
          <tbody>
            {referred.map((r, i) => (
              <tr key={i} className="border-b border-zinc-100">
                <td className="py-3 font-medium">{r.name}</td>
                <td className="py-3 text-zinc-500">{r.date}</td>
                <td className="py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${r.status === 'Successful' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {r.status}
                  </span>
                </td>
                <td className="py-3">{r.commission}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
