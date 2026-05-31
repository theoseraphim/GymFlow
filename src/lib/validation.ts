import type { ExerciseFormData, ExerciseFormErrors } from '../types';

export function validateExerciseForm(data: Partial<ExerciseFormData>): ExerciseFormErrors {
  const errors: ExerciseFormErrors = {};

  if (!data.title || data.title.trim() === '') {
    errors.title = 'O nome do exercício é obrigatório.';
  }
  if (data.sets === undefined || data.sets === null || data.sets <= 0) {
    errors.sets = 'Séries deve ser maior que zero.';
  }
  if (data.reps === undefined || data.reps === null || data.reps <= 0) {
    errors.reps = 'Repetições deve ser maior que zero.';
  }
  if (data.weight === undefined || data.weight === null || data.weight < 0) {
    errors.weight = 'Carga não pode ser negativa.';
  }

  return errors;
}
