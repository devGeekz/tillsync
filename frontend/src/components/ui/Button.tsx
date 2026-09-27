import { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

const variants: Record<Variant, string> = {
  primary: 'bg-[#22C55E] text-white hover:bg-[#1eab4e]',
  secondary: 'border border-zinc-300 text-zinc-700 hover:bg-zinc-100',
  danger: 'bg-red-500 text-white hover:bg-red-600',
  ghost: 'text-zinc-600 hover:bg-zinc-100',
};

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`rounded-lg px-5 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
