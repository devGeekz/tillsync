export function Header({ title }: { title?: string }) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-6">
      <h1 className="text-lg font-semibold text-zinc-800">{title ?? 'Dashboard'}</h1>
      <div className="flex items-center gap-4">
        <button className="relative text-lg text-zinc-500 hover:text-zinc-700">
          ◔
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">3</span>
        </button>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#22C55E] text-sm font-medium text-white">K</div>
      </div>
    </header>
  );
}
