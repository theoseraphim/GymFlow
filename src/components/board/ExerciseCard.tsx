import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { Exercise } from '../../types';

interface ExerciseCardProps {
  exercise: Exercise;
  isDragging?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ExerciseCard({ exercise, isDragging, onEdit, onDelete }: ExerciseCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging: isDraggingNow } = useDraggable({
    id: exercise.id,
    data: {
      type: 'exercise',
      exerciseId: exercise.id,
      status: exercise.status,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`rounded-lg border border-gymflow-light-border bg-white p-3 shadow-md transition-all cursor-grab active:cursor-grabbing dark:border-gymflow-border dark:bg-gymflow-bg-secondary ${
        isDragging || isDraggingNow ? 'shadow-xl ring-2 ring-gymflow-accent opacity-90' : 'hover:border-gymflow-accent'
      }`}
    >
      <div className="mb-2 flex items-start justify-between">
        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">{exercise.title}</h3>
        <div className="flex gap-1 flex-shrink-0">
          {onEdit && (
            <button
              type="button"
              onPointerDown={e => e.stopPropagation()}
              onClick={onEdit}
              className="inline-flex h-6 w-6 items-center justify-center rounded text-xs text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10 hover:text-gymflow-accent transition"
              title="Editar"
            >
              ✎
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onPointerDown={e => e.stopPropagation()}
              onClick={onDelete}
              className="inline-flex h-6 w-6 items-center justify-center rounded text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/20 transition"
              title="Deletar"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
        <p>
          <span className="font-medium text-gray-700 dark:text-gray-300">Séries:</span> {exercise.sets}
        </p>
        <p>
          <span className="font-medium text-gray-700 dark:text-gray-300">Reps:</span> {exercise.reps}
        </p>
        <p>
          <span className="font-medium text-gray-700 dark:text-gray-300">Carga:</span>{' '}
          <span className="text-gymflow-accent dark:text-gymflow-accent-light">
            {exercise.weight.toFixed(1)} kg
          </span>
        </p>
      </div>

      <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
        {new Date(exercise.created_at).toLocaleDateString('pt-BR')}
      </div>
    </div>
  );
}
