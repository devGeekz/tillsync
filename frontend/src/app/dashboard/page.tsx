'use client';

import Link from 'next/link';
import useSWR from 'swr';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { fetcher } from '@/lib/api';
import { timeAgo, ghs, capitalize } from '@/lib/format';
import type { ApiResponse, ApiListResponse, DashboardStats, Notification } from '@/lib/types';

const statusColor: Record<string, string> = {
  pending: 'bg-zinc-100 text-zinc-600',
  sent: 'bg-blue-100 text-blue-700',
  delivered: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
};

export default function DashboardPage() {
  const { data: statsRes } = useSWR<ApiResponse<DashboardStats>>('/api/v1/dashboard/stats', fetcher);
  const { data: recentRes } = useSWR<ApiListResponse<Notification>>('/api/v1/notifications?limit=5', fetcher);

  const s = statsRes?.data;
  const cards = [
    { label: 'Total Tills', value: s?.totalTills, icon: '▤' },
    { label: 'Active Tills', value: s?.activeTills, icon: '☑' },
    { label: 'Attendants', value: s?.totalAttendants, icon: '☰' },
    { label: 'Notifications Today', value: s?.notificationsToday, icon: '◔' },
  ];
  const recent = recentRes?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">{c.label}</p>
                <p className="mt-1 text-2xl font-bold text-zinc-900">{c.value ?? '—'}</p>
              </div>
              <span className="text-2xl text-zinc-300">{c.icon}</span>
            </div>
          </Card>
        ))}
      </div>

      <Card title="Recent Notifications">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-zinc-500">
              <th className="pb-2">Till</th>
              <th className="pb-2">Amount</th>
              <th className="pb-2">Sender</th>
              <th className="pb-2">Status</th>
              <th className="pb-2">Time</th>
            </tr>
          </thead>
          <tbody>
            {recent.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-zinc-400">
                  No notifications yet.
                </td>
              </tr>
            ) : (
              recent.map((r) => (
                <tr key={r.id} className="border-b border-zinc-100">
                  <td className="py-3">{r.tillNumber}</td>
                  <td className="py-3">{ghs(r.amount)}</td>
                  <td className="py-3">{r.senderName ?? '—'}</td>
                  <td className="py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${statusColor[r.status] ?? statusColor.pending}`}>
                      {capitalize(r.status)}
                    </span>
                  </td>
                  <td className="py-3 text-zinc-400">{timeAgo(r.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      <div className="flex gap-4">
        <Link href="/dashboard/tills"><Button>+ Add New Till</Button></Link>
        <Link href="/dashboard/attendants"><Button variant="secondary">+ Add Attendant</Button></Link>
      </div>
    </div>
  );
}
