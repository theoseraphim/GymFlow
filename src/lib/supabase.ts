import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY são obrigatórias. ' +
    'Verifique o arquivo .env.local.',
  );
}

// Cliente sem generic Database — a segurança de tipos é garantida pelos
// hooks e serializers que usam as interfaces de src/types/index.ts.
// Isso evita conflitos de inferência do @supabase/supabase-js com tipos customizados.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
