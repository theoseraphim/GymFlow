import type { Exercise, ExerciseFormData } from '../types';

/**
 * Converte ExerciseFormData + userId para o formato de INSERT do Supabase.
 * O título é trimado para remover espaços acidentais.
 */
export function serialize(
  data: ExerciseFormData,
  userId: string,
): Omit<Exercise, 'id' | 'created_at'> {
  return {
    user_id: userId,
    title: data.title.trim(),
    sets: data.sets,
    reps: data.reps,
    weight: data.weight,
    status: data.status,
  };
}

/**
 * Converte um registro bruto do Supabase para o tipo Exercise.
 * Garante que sets, reps e weight sejam números (não strings).
 */
export function deserialize(record: Record<string, unknown>): Exercise {
  return {
    id: record.id as string,
    user_id: record.user_id as string,
    title: record.title as string,
    sets: Number(record.sets),
    reps: Number(record.reps),
    weight: Number(record.weight),
    status: record.status as Exercise['status'],
    created_at: record.created_at as string,
  };
}

/**
 * Converte um Exercise existente para ExerciseFormData (para pré-preencher formulários).
 */
export function toFormData(exercise: Exercise): ExerciseFormData {
  return {
    title: exercise.title,
    sets: exercise.sets,
    reps: exercise.reps,
    weight: exercise.weight,
    status: exercise.status,
  };
}
