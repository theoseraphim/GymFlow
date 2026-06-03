import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import {
  buildDashboardMetrics,
  calcularCargaTotal,
  calcularFrequenciaSemanal,
} from '../lib/metrics';
import type { Exercise } from '../types';
import { arbitraryExercise } from './arbitraries';

const ref = new Date('2026-05-25T15:00:00.000Z');

function makeExercise(partial: Partial<Exercise>): Exercise {
  return {
    id: '1',
    user_id: 'u',
    title: 'Test',
    sets: 3,
    reps: 10,
    weight: 20,
    status: 'feito',
    created_at: '2026-05-25T10:00:00.000Z',
    ...partial,
  };
}

describe('metrics', () => {
  it('carga total soma apenas exercícios feitos', () => {
    const exercises = [
      makeExercise({ status: 'feito', sets: 2, reps: 10, weight: 5 }),
      makeExercise({ id: '2', status: 'backlog', sets: 10, reps: 10, weight: 100 }),
    ];
    expect(calcularCargaTotal(exercises)).toBe(100);
  });

  it('frequência semanal está entre 0 e 7', () => {
    fc.assert(
      fc.property(fc.array(arbitraryExercise(), { maxLength: 30 }), list => {
        const n = calcularFrequenciaSemanal(list, ref);
        expect(n).toBeGreaterThanOrEqual(0);
        expect(n).toBeLessThanOrEqual(7);
      }),
      { numRuns: 40 },
    );
  });

  it('property: carga total é invariante à ordem da lista', () => {
    fc.assert(
      fc.property(fc.array(arbitraryExercise(), { maxLength: 25 }), list => {
        const shuffled = [...list].sort(() => Math.random() - 0.5);
        const original = calcularCargaTotal(list);
        const reordered = calcularCargaTotal(shuffled);
        // Soma de ponto flutuante não é associativa: reordenar pode gerar uma
        // diferença mínima no último dígito significativo. A propriedade que
        // importa é que a ordem não altera a carga de forma relevante, então
        // comparamos com uma tolerância relativa em vez de igualdade exata.
        const tolerance = Math.max(Math.abs(original), Math.abs(reordered)) * 1e-9;
        expect(Math.abs(original - reordered)).toBeLessThanOrEqual(tolerance);
      }),
      { numRuns: 40 },
    );
  });

  it('property: adicionar não-feito não altera carga total', () => {
    fc.assert(
      fc.property(fc.array(arbitraryExercise(), { maxLength: 20 }), arbitraryExercise(), (list, extra) => {
        const base = calcularCargaTotal(list);
        const withExtra = calcularCargaTotal([
          ...list,
          { ...extra, status: 'backlog' },
        ]);
        expect(withExtra).toBe(base);
      }),
      { numRuns: 40 },
    );
  });

  it('buildDashboardMetrics retorna estrutura completa', () => {
    const m = buildDashboardMetrics([], ref);
    expect(m).toMatchObject({
      totalFeito: 0,
      cargaTotal: 0,
      frequenciaSemanal: 0,
      last7Days: expect.any(Array),
    });
    expect(m.last7Days).toHaveLength(7);
  });
});
