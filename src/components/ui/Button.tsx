import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-[#9D8BA7] text-white hover:bg-[#8B7999] disabled:opacity-60',
  secondary:
    'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 dark:bg-white/5 dark:text-gray-200 dark:border-white/10 dark:hover:bg-white/10',
  danger:
    'bg-red-600 text-white hover:bg-red-700 disabled:opacity-60',
  ghost:
    'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium
        transition focus:outline-none focus:ring-2 focus:ring-[#9D8BA7] focus:ring-offset-2
        disabled:cursor-not-allowed
        ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {loading && (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}
