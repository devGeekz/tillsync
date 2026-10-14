'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { clearStoredUser, getStoredUser } from '@/lib/auth';

// managerOnly pages 403 for attendants — hiding the link is convenience, the API is the guard
const links = [
  { href: '/dashboard', label: 'Dashboard', icon: '▦', managerOnly: false },
  { href: '/dashboard/tills', label: 'Tills', icon: '▤', managerOnly: false },
  { href: '/dashboard/attendants', label: 'Attendants', icon: '☰', managerOnly: true },
  { href: '/dashboard/notifications', label: 'Notifications', icon: '◔', managerOnly: false },
  { href: '/dashboard/billing', label: 'Billing', icon: '$', managerOnly: true },
  { href: '/dashboard/referrals', label: 'Referrals', icon: '✦', managerOnly: true },
  { href: '/dashboard/settings', label: 'Settings', icon: '⚙', managerOnly: false },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = getStoredUser();
  const visible = links.filter((l) => !l.managerOnly || user?.role !== 'attendant');

  async function logout() {
    await api.post('/api/auth/logout').catch(() => {});
    clearStoredUser();
    router.push('/login');
    router.refresh();
  }

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-zinc-200 bg-white md:flex">
      <div className="border-b border-zinc-200 px-6 py-5 text-lg font-bold text-[#22C55E]">TillSync</div>
      <nav className="flex-1 space-y-1 p-3">
        {visible.map((l) => (
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
        <button onClick={logout} className="block w-full rounded-lg px-3 py-2.5 text-left text-sm text-zinc-600 hover:bg-zinc-100">
          ↩ Logout
        </button>
      </div>
    </aside>
  );
}
