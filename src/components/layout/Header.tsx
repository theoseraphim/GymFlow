import { NavLink } from 'react-router-dom';
import { Moon, Sun, LogOut } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../hooks/useTheme';

const navClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium transition ${
    isActive
      ? 'text-gray-900 dark:text-white'
      : 'text-gymflow-light-text-muted hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
  }`;

export function Header() {
  const { isDark, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="border-b border-gymflow-light-border bg-white/90 backdrop-blur dark:border-gymflow-border dark:bg-gymflow-bg-secondary/95">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-gymflow-accent to-gymflow-accent-light">
            <span className="text-lg font-bold text-white">⚡</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">GymFlow</h1>
            <p className="text-xs text-gymflow-accent dark:text-gymflow-accent-light">
              Minha saúde em primeiro lugar
            </p>
          </div>
        </div>

        <nav className="hidden items-center gap-6 md:flex">
          <NavLink to="/board" className={navClass}>
            Board
          </NavLink>
          <NavLink to="/dashboard" className={navClass}>
            Dashboard
          </NavLink>
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10"
            title={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
            aria-label="Alternar tema claro ou escuro"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button
            type="button"
            onClick={() => void handleLogout()}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </div>

      <nav className="flex gap-4 border-t border-gymflow-light-border px-6 py-2 md:hidden dark:border-gymflow-border">
        <NavLink to="/board" className={navClass}>
          Board
        </NavLink>
        <NavLink to="/dashboard" className={navClass}>
          Dashboard
        </NavLink>
      </nav>
    </header>
  );
}
