import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { supabase } from '../lib/supabase';
import { deserialize, serialize } from '../lib/exerciseSerializer';
import type { Exercise, ExerciseFormData, ExerciseStatus } from '../types';

type ExerciseInsert = Omit<Exercise, 'id' | 'created_at'>;
type ExerciseUpdate = Partial<Omit<Exercise, 'id' | 'user_id' | 'created_at'>>;

interface ExercisesContextValue {
  exercises: Exercise[];
  loading: boolean;
  error: string | null;
  createExercise: (data: ExerciseFormData) => Promise<void>;
  updateExercise: (id: string, data: Partial<ExerciseFormData>) => Promise<void>;
  deleteExercise: (id: string) => Promise<void>;
  moveExercise: (id: string, newStatus: ExerciseStatus) => Promise<void>;
  refetch: () => Promise<void>;
  clearError: () => void;
}

const ExercisesContext = createContext<ExercisesContextValue | null>(null);

export function ExercisesProvider({ children }: { children: ReactNode }) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const fetchExercises = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('exercises')
      .select('*')
      .order('created_at', { ascending: true });

    if (fetchError) {
      setError('Não foi possível carregar os exercícios. Tente novamente.');
      console.error('[exercises] fetch:', fetchError.message);
      setExercises([]);
    } else {
      setExercises((data ?? []).map(r => deserialize(r as Record<string, unknown>)));
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchExercises();

    let channel: ReturnType<typeof supabase.channel> | null = null;

    const setupRealtime = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      channel = supabase
        .channel(`exercises:${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'exercises',
            filter: `user_id=eq.${user.id}`,
          },
          payload => {
            if (payload.eventType === 'INSERT') {
              const row = deserialize(payload.new as Record<string, unknown>);
              setExercises(prev => (prev.some(e => e.id === row.id) ? prev : [...prev, row]));
            } else if (payload.eventType === 'UPDATE') {
              const row = deserialize(payload.new as Record<string, unknown>);
              setExercises(prev => prev.map(e => (e.id === row.id ? row : e)));
            } else if (payload.eventType === 'DELETE') {
              const id = (payload.old as Record<string, unknown>).id as string;
              setExercises(prev => prev.filter(e => e.id !== id));
            }
          },
        )
        .subscribe();
    };

    void setupRealtime();

    return () => {
      void channel?.unsubscribe();
    };
  }, [fetchExercises]);

  const createExercise = useCallback(async (data: ExerciseFormData) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado.');

    const payload: ExerciseInsert = serialize(data, user.id);
    const tempId = `temp-${Date.now()}`;
    const optimistic: Exercise = {
      ...payload,
      id: tempId,
      created_at: new Date().toISOString(),
    };

    setExercises(prev => [...prev, optimistic]);

    const { data: created, error: insertError } = await supabase
      .from('exercises')
      .insert(payload)
      .select()
      .single();

    if (insertError) {
      setExercises(prev => prev.filter(e => e.id !== tempId));
      setError('Não foi possível criar o exercício.');
      throw new Error(insertError.message);
    }

    setExercises(prev =>
      prev.map(e => (e.id === tempId ? deserialize(created as Record<string, unknown>) : e)),
    );
  }, []);

  const updateExercise = useCallback(async (id: string, data: Partial<ExerciseFormData>) => {
    if (id.startsWith('temp-')) return;

    const updatePayload: ExerciseUpdate = {
      ...(data.title !== undefined && { title: data.title.trim() }),
      ...(data.sets !== undefined && { sets: data.sets }),
      ...(data.reps !== undefined && { reps: data.reps }),
      ...(data.weight !== undefined && { weight: data.weight }),
      ...(data.status !== undefined && { status: data.status }),
    };

    if (Object.keys(updatePayload).length === 0) return;

    let snapshot: Exercise | undefined;
    setExercises(prev => {
      snapshot = prev.find(e => e.id === id);
      if (!snapshot) return prev;
      return prev.map(e => (e.id === id ? { ...e, ...updatePayload } : e));
    });

    if (!snapshot) return;

    const { data: updated, error: updateError } = await supabase
      .from('exercises')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (updateError || !updated) {
      setExercises(prev => prev.map(e => (e.id === id ? snapshot! : e)));
      setError('Não foi possível salvar as alterações.');
      console.error('[exercises] update:', updateError?.message);
      throw new Error(updateError?.message ?? 'Update sem retorno');
    }

    const confirmed = deserialize(updated as Record<string, unknown>);
    setExercises(prev => prev.map(e => (e.id === id ? confirmed : e)));
  }, []);

  const moveExercise = useCallback(
    async (id: string, newStatus: ExerciseStatus) => {
      if (id.startsWith('temp-')) return;
      await updateExercise(id, { status: newStatus });
    },
    [updateExercise],
  );

  const deleteExercise = useCallback(async (id: string) => {
    let snapshot: Exercise | undefined;
    setExercises(prev => {
      snapshot = prev.find(e => e.id === id);
      if (!snapshot) return prev;
      return prev.filter(e => e.id !== id);
    });

    if (!snapshot) return;

    const { error: deleteError } = await supabase.from('exercises').delete().eq('id', id);

    if (deleteError) {
      setExercises(prev => [...prev, snapshot!]);
      setError('Não foi possível excluir o exercício.');
      throw new Error(deleteError.message);
    }
  }, []);

  const value = useMemo(
    () => ({
      exercises,
      loading,
      error,
      createExercise,
      updateExercise,
      deleteExercise,
      moveExercise,
      refetch: fetchExercises,
      clearError,
    }),
    [
      exercises,
      loading,
      error,
      createExercise,
      updateExercise,
      deleteExercise,
      moveExercise,
      fetchExercises,
      clearError,
    ],
  );

  return <ExercisesContext.Provider value={value}>{children}</ExercisesContext.Provider>;
}

export function useExercises(): ExercisesContextValue {
  const ctx = useContext(ExercisesContext);
  if (!ctx) {
    throw new Error('useExercises deve ser usado dentro de ExercisesProvider');
  }
  return ctx;
}
