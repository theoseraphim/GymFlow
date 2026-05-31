import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { deserialize, serialize, toFormData } from '../lib/exerciseSerializer';
import { arbitraryExerciseFormData } from './arbitraries';

describe('exerciseSerializer', () => {
  it('serialize trima o título', () => {
    const row = serialize(
      { title: '  Supino  ', sets: 3, reps: 10, weight: 40, status: 'backlog' },
      'user-1',
    );
    expect(row.title).toBe('Supino');
    expect(row.user_id).toBe('user-1');
  });

  it('deserialize converte números vindos como string', () => {
    const exercise = deserialize({
      id: '1',
      user_id: 'u',
      title: 'Agachamento',
      sets: '4',
      reps: '8',
      weight: '60.5',
      status: 'feito',
      created_at: '2026-05-25T12:00:00Z',
    });
    expect(exercise.sets).toBe(4);
    expect(exercise.weight).toBe(60.5);
  });

  it('toFormData preserva campos do exercício', () => {
    const exercise = deserialize({
      id: '1',
      user_id: 'u',
      title: 'Remada',
      sets: 3,
      reps: 12,
      weight: 30,
      status: 'hoje',
      created_at: '2026-05-25T12:00:00Z',
    });
    expect(toFormData(exercise)).toEqual({
      title: 'Remada',
      sets: 3,
      reps: 12,
      weight: 30,
      status: 'hoje',
    });
  });

  it('property: round-trip form → serialize → deserialize', () => {
    fc.assert(
      fc.property(arbitraryExerciseFormData(), form => {
        const userId = '00000000-0000-4000-8000-000000000001';
        const payload = serialize(form, userId);
        const record = {
          id: '00000000-0000-4000-8000-000000000099',
          created_at: '2026-05-25T10:00:00.000Z',
          ...payload,
        };
        const exercise = deserialize(record);
        expect(exercise.title).toBe(form.title.trim());
        expect(exercise.sets).toBe(form.sets);
        expect(exercise.reps).toBe(form.reps);
        expect(exercise.weight).toBe(form.weight);
        expect(exercise.status).toBe(form.status);
      }),
      { numRuns: 50 },
    );
  });
});
