import { supabase } from '../lib/supabase';

interface ExerciseLike {
  title?: string;
}

/**
 * Pede uma dica do "Gymenes" à Edge Function `ai-insight`.
 *
 * A chave da Amazon Bedrock NÃO fica no frontend — ela é um secret
 * no Supabase e só a Edge Function tem acesso. O browser apenas envia
 * a lista de exercícios concluídos e recebe a dica pronta.
 */
export async function getAIWorkoutInsight(exercises: ExerciseLike[]): Promise<string> {
  if (!exercises || exercises.length === 0) {
    return "Adicione treinos ao 'Feito' para o Gymenes analisar! 💪";
  }

  const { data, error } = await supabase.functions.invoke('ai-insight', {
    body: { exercises },
  });

  if (error) {
    // A FunctionsHttpError expõe o status; tratamos limite de uso separadamente.
    const status = (error as { context?: { status?: number } }).context?.status;
    if (status === 429) {
      throw new Error('API_LIMIT');
    }
    console.error('Erro no serviço de IA:', error);
    throw new Error('API_ERROR');
  }

  if (data?.error === 'API_LIMIT') {
    throw new Error('API_LIMIT');
  }

  return data?.insight ?? 'Gymenes está meditando...';
}
