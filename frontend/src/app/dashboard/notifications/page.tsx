import { Button } from '@/components/ui/Button';

// ponytail: static demo data until backend exists
const rows = [
  { time: '2m ago', till: '12345', amount: 'GH¢150', sender: 'John Doe', channel: 'SMS', status: 'Delivered' },
  { time: '15m ago', till: '67890', amount: 'GH¢50', sender: 'Ama Asante', channel: 'SMS', status: 'Sent' },
  { time: '1h ago', till: '12345', amount: 'GH¢200', sender: 'Kofi Mensah', channel: 'SMS', status: 'Failed' },
  { time: '3h ago', till: '67890', amount: 'GH¢75', sender: 'Yaw Boateng', channel: 'SMS', status: 'Delivered' },
  { time: 'Yesterday', till: '12345', amount: 'GH¢320', sender: 'Abena Owusu', channel: 'SMS', status: 'Delivered' },
];

const statusColor: Record<string, string> = {
  Delivered: 'bg-green-100 text-green-700',
  Sent: 'bg-blue-100 text-blue-700',
  Failed: 'bg-red-100 text-red-700',
};

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <select className="rounded-lg border border-zinc-300 px-3 py-2 text-sm">
          <option>All statuses</option>
          <option>Sent</option>
          <option>Delivered</option>
          <option>Failed</option>
        </select>
        <select className="rounded-lg border border-zinc-300 px-3 py-2 text-sm">
          <option>All tills</option>
          <option>12345</option>
          <option>67890</option>
        </select>
        <input type="date" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
        <Button variant="secondary" className="ml-auto">Export CSV</Button>
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
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-zinc-100">
                <td className="p-4 text-zinc-400">{r.time}</td>
                <td className="p-4">{r.till}</td>
                <td className="p-4">{r.amount}</td>
                <td className="p-4">{r.sender}</td>
                <td className="p-4">{r.channel}</td>
                <td className="p-4"><span className={`rounded-full px-2 py-0.5 text-xs ${statusColor[r.status]}`}>{r.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center gap-1 text-sm">
        <button className="rounded border border-zinc-300 px-3 py-1">‹</button>
        <button className="rounded border border-[#22C55E] bg-[#22C55E] px-3 py-1 text-white">1</button>
        <button className="rounded border border-zinc-300 px-3 py-1">2</button>
        <button className="rounded border border-zinc-300 px-3 py-1">›</button>
      </div>
    </div>
  );
}
