'use client';

import { getStoredUser } from '@/lib/auth';

export function Header({ title }: { title?: string }) {
  const user = getStoredUser();
  const initial = user?.name?.charAt(0)?.toUpperCase() ?? 'T';

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-6">
      <h1 className="text-lg font-semibold text-zinc-800">{title ?? 'Dashboard'}</h1>
      <div className="flex items-center gap-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#22C55E] text-sm font-medium text-white">
          {initial}
        </div>
      </div>
    </header>
  );
}
