import { useState, type FormEvent } from 'react';
import { useAuth } from '../../hooks/useAuth';

interface LoginFormProps {
  onSwitchToSignup: () => void;
}

export function LoginForm({ onSwitchToSignup }: LoginFormProps) {
  const { signIn, loading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [serverError, setServerError] = useState('');

  function validate(): boolean {
    const newErrors: typeof errors = {};
    if (!email.trim()) newErrors.email = 'E-mail é obrigatório.';
    if (!password) newErrors.password = 'Senha é obrigatória.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;
    try {
      await signIn(email.trim(), password);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Erro inesperado.');
    }
  }

  const inputClass = (hasError?: string) =>
    `mt-1 block w-full rounded-lg border px-3 py-2 text-sm shadow-sm outline-none transition
    focus:ring-2 focus:ring-[#9D8BA7]
    dark:bg-[#2a2230] dark:text-white dark:placeholder-gray-500
    ${hasError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-[#4a4450]'}`;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div>
        <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          E-mail
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="seu.email@exemplo.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className={inputClass(errors.email)}
        />
        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Senha
        </label>
        <input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className={inputClass(errors.password)}
        />
        {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
      </div>

      {serverError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-[#9D8BA7] px-4 py-2 text-sm font-semibold text-white
          transition hover:bg-[#8B7999] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Entrando...' : 'Entrar'}
      </button>

      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
        Nao tem conta?{' '}
        <button
          type="button"
          onClick={onSwitchToSignup}
          className="font-medium text-[#9D8BA7] hover:underline dark:text-[#B5A1BC]"
        >
          Criar conta
        </button>
      </p>
    </form>
  );
}
