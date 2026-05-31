import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import { LoginForm } from '../components/auth/LoginForm';
import { SignupForm } from '../components/auth/SignupForm';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';

type Tab = 'login' | 'signup';

export function AuthPage() {
  const { user, loading } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [tab, setTab] = useState<Tab>('login');

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gymflow-light-bg dark:bg-gymflow-bg">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gymflow-accent border-t-transparent" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/board" replace />;
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gymflow-light-bg px-4 dark:bg-gymflow-bg">

      {/* Botão de tema — canto superior direito */}
      <button
        type="button"
        onClick={toggleTheme}
        aria-label="Alternar tema"
        className="absolute right-4 top-4 rounded-lg p-2 text-gray-500 transition
          hover:bg-gray-200 hover:text-gray-800
          dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-gray-100"
      >
        {isDark ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <div className="w-full max-w-md">
        {/* Logo + Slogan */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            GymFlow
          </h1>
          <p className="mt-1 text-sm font-medium text-gymflow-accent dark:text-gymflow-accent-light">
            Minha saúde em primeiro lugar
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white p-8 shadow-lg border border-gymflow-light-border dark:bg-gymflow-bg-card dark:shadow-black/40 dark:border-gymflow-border">

          {/* Tabs */}
          <div className="mb-6 flex rounded-lg bg-gray-100 p-1 dark:bg-white/5">
            <button
              type="button"
              onClick={() => setTab('login')}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition
                ${tab === 'login'
                  ? 'bg-white text-gray-900 shadow dark:bg-gymflow-accent dark:text-white'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => setTab('signup')}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition
                ${tab === 'signup'
                  ? 'bg-white text-gray-900 shadow dark:bg-gymflow-accent dark:text-white'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
            >
              Criar conta
            </button>
          </div>

          {tab === 'login' ? (
            <LoginForm onSwitchToSignup={() => setTab('signup')} />
          ) : (
            <SignupForm onSwitchToLogin={() => setTab('login')} />
          )}
        </div>
      </div>
    </div>
  );
}
