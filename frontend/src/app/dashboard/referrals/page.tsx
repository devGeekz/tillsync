'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { fetcher } from '@/lib/api';
import type { ApiResponse, ReferralCode, ReferralStats } from '@/lib/types';

interface ReferralStatsWithList extends ReferralStats {
  referrals: { name: string; joinedAt: string; status: string; commission: number }[];
}

export default function ReferralsPage() {
  const [copied, setCopied] = useState('');
  const { data: codeRes } = useSWR<ApiResponse<ReferralCode>>('/api/v1/referrals/code', fetcher);
  const { data: statsRes } = useSWR<ApiResponse<ReferralStatsWithList>>('/api/v1/referrals/stats', fetcher);

  const code = codeRes?.data?.code ?? '········';
  const link = codeRes?.data?.link ?? '';
  const stats = statsRes?.data;
  const referred = stats?.referrals ?? [];

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
          <Button onClick={() => copy(code, 'code')} disabled={!codeRes}>{copied === 'code' ? 'Copied!' : 'Copy Code'}</Button>
          <Button variant="secondary" onClick={() => copy(link, 'link')} disabled={!codeRes}>{copied === 'link' ? 'Copied!' : 'Copy Link'}</Button>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Referrals', value: stats?.totalReferrals },
          { label: 'Successful', value: stats?.successfulReferrals },
          { label: 'Pending', value: stats?.pendingReferrals },
          { label: 'Commission', value: stats ? `GH¢${stats.totalCommission}` : undefined },
        ].map((s) => (
          <Card key={s.label}>
            <p className="text-sm text-zinc-500">{s.label}</p>
            <p className="mt-1 text-2xl font-bold text-zinc-900">{s.value ?? '—'}</p>
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
            {referred.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-zinc-400">
                  Nobody has used your code yet.
                </td>
              </tr>
            ) : (
              referred.map((r) => (
                <tr key={r.name} className="border-b border-zinc-100">
                  <td className="py-3 font-medium">{r.name}</td>
                  <td className="py-3 text-zinc-500">{new Date(r.joinedAt).toLocaleDateString()}</td>
                  <td className="py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${r.status === 'successful' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {r.status === 'successful' ? 'Successful' : 'Pending'}
                    </span>
                  </td>
                  <td className="py-3">{r.commission ? `GH¢${r.commission}` : '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}