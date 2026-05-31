import { useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

interface UseAuthReturn extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

function mapAuthError(message: string): string {
  if (message.includes('Invalid login credentials')) {
    return 'E-mail ou senha incorretos.';
  }
  if (message.includes('Email already registered') || message.includes('User already registered')) {
    return 'Este e-mail já está cadastrado. Tente fazer login.';
  }
  if (message.includes('Password should be at least')) {
    return 'A senha deve ter pelo menos 6 caracteres.';
  }
  if (message.includes('Unable to validate email address')) {
    return 'Endereço de e-mail inválido.';
  }
  return 'Erro de conexão. Verifique sua internet e tente novamente.';
}

export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Carrega sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState(prev => ({
        ...prev,
        session,
        user: session?.user ?? null,
        loading: false,
      }));
    });

    // Escuta mudanças de sessão (login, logout, refresh de token)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setState(prev => ({
          ...prev,
          session,
          user: session?.user ?? null,
          loading: false,
        }));
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('[useAuth] signIn error:', error.message, error);
      const msg = mapAuthError(error.message);
      setState(prev => ({ ...prev, loading: false, error: msg }));
      throw new Error(msg);
    }
    setState(prev => ({ ...prev, loading: false }));
  };

  const signUp = async (email: string, password: string): Promise<void> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      console.error('[useAuth] signUp error:', error.message, error);
      const msg = mapAuthError(error.message);
      setState(prev => ({ ...prev, loading: false, error: msg }));
      throw new Error(msg);
    }
    setState(prev => ({ ...prev, loading: false }));
  };

  const signOut = async (): Promise<void> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    await supabase.auth.signOut();
    setState({ user: null, session: null, loading: false, error: null });
  };

  const clearError = () => setState(prev => ({ ...prev, error: null }));

  return { ...state, signIn, signUp, signOut, clearError };
}
