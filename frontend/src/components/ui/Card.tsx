export function Card({ title, children, className = '' }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-zinc-200 bg-white p-6 shadow-sm ${className}`}>
      {title && <h3 className="mb-4 text-base font-semibold text-zinc-800">{title}</h3>}
      {children}
    </div>
  );
}
