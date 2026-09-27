'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: '▦' },
  { href: '/dashboard/tills', label: 'Tills', icon: '▤' },
  { href: '/dashboard/attendants', label: 'Attendants', icon: '☰' },
  { href: '/dashboard/notifications', label: 'Notifications', icon: '◔' },
  { href: '/dashboard/billing', label: 'Billing', icon: '$' },
  { href: '/dashboard/referrals', label: 'Referrals', icon: '✦' },
  { href: '/dashboard/settings', label: 'Settings', icon: '⚙' },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-zinc-200 bg-white md:flex">
      <div className="border-b border-zinc-200 px-6 py-5 text-lg font-bold text-[#22C55E]">TillSync</div>
      <nav className="flex-1 space-y-1 p-3">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${
              pathname === l.href ? 'bg-[#22C55E]/10 font-medium text-[#22C55E]' : 'text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            <span className="w-4 text-center">{l.icon}</span>
            {l.label}
          </Link>
        ))}
      </nav>
      <div className="border-t border-zinc-200 p-3">
        <Link href="/login" className="block rounded-lg px-3 py-2.5 text-sm text-zinc-600 hover:bg-zinc-100">
          ↩ Logout
        </Link>
      </div>
    </aside>
  );
}
