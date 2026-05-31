import type { ReactNode } from 'react';

interface AppShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

/** Layout de página autenticada — cores via Tailwind `dark:` (classe no html) */
export function AppShell({ title, subtitle, children }: AppShellProps) {
  return (
    <div className="min-h-full bg-gymflow-light-bg text-gymflow-light-text transition-colors duration-200 dark:bg-gymflow-bg dark:text-[#e8e0ef]">
      <div className="p-6">
        <header className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
          {subtitle && (
            <p className="mt-1 text-sm text-gymflow-light-text-muted dark:text-gray-400">
              {subtitle}
            </p>
          )}
        </header>
        {children}
      </div>
    </div>
  );
}
