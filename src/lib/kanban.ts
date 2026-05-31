import type { DragEndEvent, DragOverEvent } from '@dnd-kit/core';
import type { Exercise, ExerciseStatus } from '../types';

const COLUMN_PREFIX = 'column-';

const VALID_STATUSES: ExerciseStatus[] = ['backlog', 'hoje', 'fazendo', 'feito'];

function isExerciseStatus(value: unknown): value is ExerciseStatus {
  return typeof value === 'string' && VALID_STATUSES.includes(value as ExerciseStatus);
}

/** Lê status anexado ao droppable (coluna) */
export function statusFromDroppableData(data: unknown): ExerciseStatus | null {
  if (data && typeof data === 'object' && 'status' in data) {
    const status = (data as { status: unknown }).status;
    if (isExerciseStatus(status)) return status;
  }
  return null;
}

export function resolveDropStatus(
  overId: string,
  exercises: Exercise[],
): ExerciseStatus | null {
  if (overId.startsWith(COLUMN_PREFIX)) {
    return overId.slice(COLUMN_PREFIX.length) as ExerciseStatus;
  }

  const target = exercises.find(e => e.id === overId);
  return target?.status ?? null;
}

export function resolveStatusFromDragEvent(
  event: DragEndEvent | DragOverEvent,
  exercises: Exercise[],
): ExerciseStatus | null {
  const over = event.over;
  if (!over) return null;

  const fromData = statusFromDroppableData(over.data.current);
  if (fromData) return fromData;

  return resolveDropStatus(String(over.id), exercises);
}
