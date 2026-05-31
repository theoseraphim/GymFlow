import { useDroppable } from '@dnd-kit/core';
import { ExerciseCard } from './ExerciseCard';
import type { Exercise, ExerciseStatus } from '../../types';

interface KanbanColumnProps {
  title: string;
  status: ExerciseStatus;
  exercises: Exercise[];
  onAddClick: () => void;
  onEditClick: (id: string) => void;
  onDeleteClick: (id: string) => void;
}

export function KanbanColumn({
  title,
  status,
  exercises,
  onAddClick,
  onEditClick,
  onDeleteClick,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${status}`,
    data: { type: 'column', status },
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[280px] flex-col rounded-xl border p-4 shadow-lg transition-all duration-200 border-gymflow-light-border bg-gymflow-light-bg-card dark:border-gymflow-border dark:bg-gymflow-bg-card ${
        isOver
          ? 'ring-2 ring-gymflow-accent border-gymflow-accent dark:border-gymflow-accent-light'
          : 'hover:border-gymflow-accent/40'
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-gray-900 dark:text-white">{title}</h2>
          <p className="text-xs text-gymflow-light-text-muted dark:text-gray-400">
            {exercises.length} {exercises.length === 1 ? 'item' : 'itens'}
          </p>
        </div>
        <button
          type="button"
          onClick={onAddClick}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gymflow-accent text-white transition hover:opacity-90 font-bold text-lg"
          title="Adicionar exercício"
        >
          +
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-3">
        {exercises.length === 0 ? (
          <div className="flex flex-1 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 py-8 dark:border-gymflow-border">
            <p className="text-sm text-gymflow-light-text-muted dark:text-gray-500">
              Solte aqui ou adicione
            </p>
          </div>
        ) : (
          exercises.map(exercise => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              onEdit={() => onEditClick(exercise.id)}
              onDelete={() => onDeleteClick(exercise.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
