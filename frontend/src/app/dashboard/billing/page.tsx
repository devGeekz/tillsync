'use client';

import useSWR from 'swr';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { api, apiError, fetcher } from '@/lib/api';
import { capitalize } from '@/lib/format';
import type { ApiResponse, Subscription } from '@/lib/types';

const plans = [
  { name: 'trial', price: 'Free', items: ['1 Till', '100 SMS / month'] },
  { name: 'basic', price: 'GH¢15/mo', items: ['3 Tills', 'Unlimited SMS'] },
  { name: 'pro', price: 'GH¢40/mo', items: ['10 Tills', 'Unlimited SMS'] },
];

const limit = (used: number, allowed: number) => `${used}/${allowed === -1 ? '∞' : allowed}`;
const percent = (used: number, allowed: number) => (allowed === -1 ? 100 : Math.min(100, (used / allowed) * 100));

export default function BillingPage() {
  const { data, isLoading } = useSWR<ApiResponse<Subscription>>('/api/v1/billing/subscription', fetcher);
  const sub = data?.data;

  async function choose(plan: string) {
    try {
      await api.post('/api/v1/billing/subscribe', { plan, paymentMethod: 'momo', phone: '' });
    } catch (err) {
      alert(apiError(err));
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        {isLoading || !sub ? (
          <p className="text-sm text-zinc-400">Loading…</p>
        ) : (
          <>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm text-zinc-500">Current Plan</p>
                <p className="text-xl font-bold text-zinc-900">{capitalize(sub.plan)}</p>
                <p className="mt-1 text-sm">
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">{capitalize(sub.status)}</span>
                  {sub.expiresAt && <span className="ml-2 text-zinc-500">Expires {new Date(sub.expiresAt).toLocaleDateString()}</span>}
                </p>
              </div>
              <Button onClick={() => choose('basic')} disabled={sub.plan === 'basic'}>
                {sub.plan === 'basic' ? 'Current Plan' : 'Upgrade Plan'}
              </Button>
            </div>
            <div className="mt-5 space-y-3">
              <div>
                <p className="text-xs text-zinc-500">Tills: {limit(sub.tillsUsed, sub.tillsAllowed)}</p>
                <div className="mt-1 h-2 rounded-full bg-zinc-100">
                  <div className="h-2 rounded-full bg-[#22C55E]" style={{ width: `${percent(sub.tillsUsed, sub.tillsAllowed)}%` }} />
                </div>
              </div>
              <div>
                <p className="text-xs text-zinc-500">SMS this month: {limit(sub.smsUsed, sub.smsAllowed)}</p>
                <div className="mt-1 h-2 rounded-full bg-zinc-100">
                  <div className="h-2 rounded-full bg-[#22C55E]" style={{ width: `${percent(sub.smsUsed, sub.smsAllowed)}%` }} />
                </div>
              </div>
            </div>
          </>
        )}
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((p) => (
          <Card key={p.name} className={sub?.plan === p.name ? 'border-[#22C55E]' : ''}>
            <p className="font-semibold">{capitalize(p.name)}</p>
            <p className="mt-1 text-xl font-bold text-[#22C55E]">{p.price}</p>
            <ul className="mt-3 space-y-1 text-sm text-zinc-500">
              {p.items.map((i) => <li key={i}>✓ {i}</li>)}
            </ul>
            <Button
              variant={sub?.plan === p.name ? 'secondary' : 'primary'}
              className="mt-4 w-full"
              disabled={sub?.plan === p.name}
              onClick={() => choose(p.name)}
            >
              {sub?.plan === p.name ? 'Current Plan' : 'Select'}
            </Button>
          </Card>
        ))}
      </div>

      <Card title="Invoice History">
        <p className="text-sm text-zinc-500">
          No invoices yet. Online payment isn&apos;t enabled — upgrade buttons will report once MoMo billing is connected.
        </p>
      </Card>
    </div>
  );
}