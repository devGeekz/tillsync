import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

// ponytail: static demo data until backend exists
const current = {
  plan: 'Basic',
  status: 'Active',
  expires: 'Feb 15, 2026',
  tillsUsed: 2,
  tillsAllowed: 3,
  smsUsed: 150,
  smsAllowed: 9999,
};

const plans = [
  { name: 'Trial', price: 'Free', items: ['1 Till', '100 SMS'], current: false },
  { name: 'Basic', price: 'GHS 15/mo', items: ['3 Tills', 'Unlimited SMS'], current: true },
  { name: 'Pro', price: 'GHS 30/mo', items: ['10 Tills', 'Unlimited SMS'], current: false },
];

const invoices = [
  { date: 'Jan 15, 2026', plan: 'Basic', amount: 'GHS 15', status: 'Paid' },
  { date: 'Dec 15, 2025', plan: 'Basic', amount: 'GHS 15', status: 'Paid' },
];

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-zinc-500">Current Plan</p>
            <p className="text-xl font-bold text-zinc-900">{current.plan}</p>
            <p className="mt-1 text-sm">
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">{current.status}</span>
              <span className="ml-2 text-zinc-500">Expires {current.expires}</span>
            </p>
          </div>
          <Button>Upgrade Plan</Button>
        </div>
        <div className="mt-5 space-y-3">
          <div>
            <p className="text-xs text-zinc-500">Tills: {current.tillsUsed}/{current.tillsAllowed}</p>
            <div className="mt-1 h-2 rounded-full bg-zinc-100">
              <div className="h-2 rounded-full bg-[#22C55E]" style={{ width: `${(current.tillsUsed / current.tillsAllowed) * 100}%` }} />
            </div>
          </div>
          <div>
            <p className="text-xs text-zinc-500">SMS: {current.smsUsed}/{current.smsAllowed === 9999 ? 'Unlimited' : current.smsAllowed}</p>
            <div className="mt-1 h-2 rounded-full bg-zinc-100">
              <div className="h-2 rounded-full bg-[#22C55E]" style={{ width: '15%' }} />
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((p) => (
          <Card key={p.name} className={p.current ? 'border-[#22C55E]' : ''}>
            <p className="font-semibold">{p.name}</p>
            <p className="mt-1 text-xl font-bold text-[#22C55E]">{p.price}</p>
            <ul className="mt-3 space-y-1 text-sm text-zinc-500">
              {p.items.map((i) => <li key={i}>✓ {i}</li>)}
            </ul>
            <Button variant={p.current ? 'secondary' : 'primary'} className="mt-4 w-full" disabled={p.current}>
              {p.current ? 'Current Plan' : 'Select'}
            </Button>
          </Card>
        ))}
      </div>

      <Card title="Invoice History">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-zinc-500">
              <th className="pb-2">Date</th>
              <th className="pb-2">Plan</th>
              <th className="pb-2">Amount</th>
              <th className="pb-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv, i) => (
              <tr key={i} className="border-b border-zinc-100">
                <td className="py-3">{inv.date}</td>
                <td className="py-3">{inv.plan}</td>
                <td className="py-3">{inv.amount}</td>
                <td className="py-3"><span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">{inv.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
