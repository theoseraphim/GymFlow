import { describe, expect, it } from 'vitest';
import {
  resolveDropStatus,
  resolveStatusFromDragEvent,
  statusFromDroppableData,
} from '../lib/kanban';
import type { Exercise } from '../types';

const exercises: Exercise[] = [
  {
    id: 'a',
    user_id: 'u',
    title: 'A',
    sets: 3,
    reps: 10,
    weight: 10,
    status: 'hoje',
    created_at: '2026-05-25T10:00:00Z',
  },
  {
    id: 'b',
    user_id: 'u',
    title: 'B',
    sets: 3,
    reps: 10,
    weight: 10,
    status: 'feito',
    created_at: '2026-05-25T11:00:00Z',
  },
];

describe('kanban', () => {
  it('statusFromDroppableData lê status da coluna', () => {
    expect(statusFromDroppableData({ type: 'column', status: 'fazendo' })).toBe('fazendo');
  });

  it('resolveDropStatus pela coluna e pelo card', () => {
    expect(resolveDropStatus('column-fazendo', exercises)).toBe('fazendo');
    expect(resolveDropStatus('b', exercises)).toBe('feito');
  });

  it('resolveStatusFromDragEvent prioriza data da coluna', () => {
    const event = {
      over: {
        id: 'column-feito',
        data: { current: { type: 'column', status: 'feito' as const } },
      },
    } as unknown as Parameters<typeof resolveStatusFromDragEvent>[0];

    expect(resolveStatusFromDragEvent(event, exercises)).toBe('feito');
  });
});
