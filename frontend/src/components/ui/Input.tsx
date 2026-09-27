import { InputHTMLAttributes, forwardRef } from 'react';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { label?: string }>(
  ({ label, id, className = '', ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-zinc-700">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={`rounded-lg border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20 ${className}`}
        {...props}
      />
    </div>
  )
);
Input.displayName = 'Input';
