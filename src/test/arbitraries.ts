import fc from 'fast-check';
import type { Exercise, ExerciseFormData, ExerciseStatus } from '../types';

const statuses: ExerciseStatus[] = ['backlog', 'hoje', 'fazendo', 'feito'];

export const arbitraryExerciseStatus = (): fc.Arbitrary<ExerciseStatus> =>
  fc.constantFrom(...statuses);

export const arbitraryExerciseFormData = (): fc.Arbitrary<ExerciseFormData> =>
  fc.record({
    title: fc.string({ minLength: 1, maxLength: 80 }).filter(s => s.trim().length > 0),
    sets: fc.integer({ min: 1, max: 50 }),
    reps: fc.integer({ min: 1, max: 100 }),
    weight: fc.float({ min: 0, max: 500, noNaN: true }),
    status: arbitraryExerciseStatus(),
  });

export const arbitraryExercise = (): fc.Arbitrary<Exercise> =>
  fc.record({
    id: fc.uuid(),
    user_id: fc.uuid(),
    title: fc.string({ minLength: 1, maxLength: 80 }),
    sets: fc.integer({ min: 1, max: 50 }),
    reps: fc.integer({ min: 1, max: 100 }),
    weight: fc.float({ min: 0, max: 500, noNaN: true }),
    status: arbitraryExerciseStatus(),
    created_at: fc
      .integer({ min: Date.parse('2024-01-01'), max: Date.now() })
      .map(ms => new Date(ms).toISOString()),
  });

export const arbitraryInvalidExerciseFormData = (): fc.Arbitrary<Partial<ExerciseFormData>> =>
  fc.oneof(
    fc.record({ title: fc.constant('') }),
    fc.record({ sets: fc.constantFrom(0, -1) }),
    fc.record({ reps: fc.constantFrom(0, -1) }),
    fc.record({ weight: fc.constantFrom(-1, -0.01) }),
  );
