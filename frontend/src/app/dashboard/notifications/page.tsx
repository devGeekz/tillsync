'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Button } from '@/components/ui/Button';
import { fetcher } from '@/lib/api';
import { timeAgo, ghs, capitalize } from '@/lib/format';
import type { ApiResponse, ApiListResponse, Notification, Till } from '@/lib/types';

const statusColor: Record<string, string> = {
  pending: 'bg-zinc-100 text-zinc-600',
  sent: 'bg-blue-100 text-blue-700',
  delivered: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
};

const PAGE_SIZE = 20;

export default function NotificationsPage() {
  const [status, setStatus] = useState('');
  const [tillId, setTillId] = useState('');
  const [date, setDate] = useState('');
  const [page, setPage] = useState(1);

  const qs = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
  if (status) qs.set('status', status);
  if (tillId) qs.set('tillId', tillId);
  if (date) {
    qs.set('startDate', date);
    qs.set('endDate', `${date}T23:59:59.999`);
  }

  const { data, isLoading } = useSWR<ApiListResponse<Notification>>(`/api/v1/notifications?${qs}`, fetcher);
  const { data: tillsRes } = useSWR<ApiResponse<Till[]> & { total: number }>('/api/v1/tills', fetcher);

  const rows = data?.data ?? [];
  const total = data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function resetPage(setter: (v: string) => void) {
    return (v: string) => {
      setter(v);
      setPage(1);
    };
  }

  function exportCsv() {
    const head = 'Time,Till,Amount,Sender,Channel,Status';
    const body = rows
      .map((r) => [r.createdAt, r.tillNumber, r.amount, r.senderName ?? '', r.channel, r.status].join(','))
      .join('\n');
    const url = URL.createObjectURL(new Blob([`${head}\n${body}`], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'notifications.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <select
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          value={status}
          onChange={(e) => resetPage(setStatus)(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="sent">Sent</option>
          <option value="delivered">Delivered</option>
          <option value="failed">Failed</option>
        </select>
        <select
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          value={tillId}
          onChange={(e) => resetPage(setTillId)(e.target.value)}
        >
          <option value="">All tills</option>
          {(tillsRes?.data ?? []).map((t) => (
            <option key={t.id} value={t.id}>
              {t.tillNumber}
            </option>
          ))}
        </select>
        <input
          type="date"
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          value={date}
          onChange={(e) => resetPage(setDate)(e.target.value)}
        />
        <Button variant="secondary" className="ml-auto" onClick={exportCsv} disabled={rows.length === 0}>
          Export CSV
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-zinc-500">
              <th className="p-4">Time</th>
              <th className="p-4">Till</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Sender</th>
              <th className="p-4">Channel</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="p-8 text-center text-zinc-400">Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-zinc-500">No notifications yet.</td></tr>
            ) : rows.map((r) => (
              <tr key={r.id} className="border-b border-zinc-100">
                <td className="p-4 text-zinc-400">{timeAgo(r.createdAt)}</td>
                <td className="p-4">{r.tillNumber}</td>
                <td className="p-4">{ghs(r.amount)}</td>
                <td className="p-4">{r.senderName ?? '—'}</td>
                <td className="p-4">{r.channel.toUpperCase()}</td>
                <td className="p-4">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${statusColor[r.status] ?? statusColor.pending}`}>
                    {capitalize(r.status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-center gap-3 text-sm">
        <button
          className="rounded border border-zinc-300 px-3 py-1 disabled:opacity-40"
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
        >
          ‹
        </button>
        <span className="text-zinc-600">Page {page} of {pages}</span>
        <button
          className="rounded border border-zinc-300 px-3 py-1 disabled:opacity-40"
          disabled={page >= pages}
          onClick={() => setPage(page + 1)}
        >
          ›
        </button>
      </div>
    </div>
  );
}
