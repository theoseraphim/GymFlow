import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { validateExerciseForm } from '../lib/validation';
import { arbitraryInvalidExerciseFormData } from './arbitraries';

describe('validateExerciseForm', () => {
  it('aceita formulário válido', () => {
    const errors = validateExerciseForm({
      title: 'Supino',
      sets: 4,
      reps: 8,
      weight: 60,
      status: 'backlog',
    });
    expect(Object.keys(errors)).toHaveLength(0);
  });

  it('property: entradas inválidas geram ao menos um erro', () => {
    fc.assert(
      fc.property(arbitraryInvalidExerciseFormData(), invalid => {
        const errors = validateExerciseForm(invalid);
        expect(Object.keys(errors).length).toBeGreaterThan(0);
      }),
      { numRuns: 50 },
    );
  });
});
