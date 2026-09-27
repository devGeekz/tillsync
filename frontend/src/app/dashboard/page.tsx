import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

// ponytail: static demo data until backend exists
const stats = [
  { label: 'Total Tills', value: '3', icon: '▤' },
  { label: 'Active Attendants', value: '5', icon: '☰' },
  { label: 'Notifications Today', value: '12', icon: '◔' },
  { label: 'SMS This Month', value: '342', icon: '✉' },
];

const recent = [
  { till: '12345', amount: 'GH¢150', sender: 'John Doe', status: 'Sent', time: '2m ago' },
  { till: '67890', amount: 'GH¢50', sender: 'Ama Asante', status: 'Delivered', time: '15m ago' },
  { till: '12345', amount: 'GH¢200', sender: 'Kofi Mensah', status: 'Failed', time: '1h ago' },
];

const statusColor: Record<string, string> = {
  Sent: 'bg-green-100 text-green-700',
  Delivered: 'bg-blue-100 text-blue-700',
  Failed: 'bg-red-100 text-red-700',
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">{s.label}</p>
                <p className="mt-1 text-2xl font-bold text-zinc-900">{s.value}</p>
              </div>
              <span className="text-2xl text-zinc-300">{s.icon}</span>
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
            {recent.map((r, i) => (
              <tr key={i} className="border-b border-zinc-100">
                <td className="py-3">{r.till}</td>
                <td className="py-3">{r.amount}</td>
                <td className="py-3">{r.sender}</td>
                <td className="py-3"><span className={`rounded-full px-2 py-0.5 text-xs ${statusColor[r.status]}`}>{r.status}</span></td>
                <td className="py-3 text-zinc-400">{r.time}</td>
              </tr>
            ))}
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
