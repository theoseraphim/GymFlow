import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { CollisionDetection, DragEndEvent } from '@dnd-kit/core';
import { ExerciseForm } from './ExerciseForm';
import { KanbanColumn } from './KanbanColumn';
import { ExerciseCard } from './ExerciseCard';
import { Modal } from '../ui/Modal';
import { AppShell } from '../layout/AppShell';
import { useExercises } from '../../hooks/useExercises';
import { resolveStatusFromDragEvent } from '../../lib/kanban';
import type { ExerciseStatus, ExerciseFormData } from '../../types';

const COLUMNS: { value: ExerciseStatus; label: string }[] = [
  { value: 'backlog', label: 'Backlog' },
  { value: 'hoje', label: 'Hoje' },
  { value: 'fazendo', label: 'Fazendo' },
  { value: 'feito', label: 'Feito' },
];

const collisionDetection: CollisionDetection = args => {
  const pointerHits = pointerWithin(args);
  if (pointerHits.length > 0) return pointerHits;
  return rectIntersection(args);
};

export function KanbanBoard() {
  const {
    exercises,
    createExercise,
    updateExercise,
    deleteExercise,
    moveExercise,
    loading,
    error,
    clearError,
  } = useExercises();

  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creatingIn, setCreatingIn] = useState<ExerciseStatus | null>(null);
  const [moveError, setMoveError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    setDraggedId(null);
    const { active } = event;
    const exerciseId = String(active.id);

    if (exerciseId.startsWith('temp-')) return;

    const newStatus = resolveStatusFromDragEvent(event, exercises);
    if (!newStatus) return;

    const exercise = exercises.find(e => e.id === exerciseId);
    if (!exercise || exercise.status === newStatus) return;

    setMoveError(null);
    clearError();

    try {
      await moveExercise(exerciseId, newStatus);
    } catch {
      setMoveError('Não foi possível salvar a nova coluna. Tente novamente.');
    }
  };

  const handleCreateExercise = async (data: ExerciseFormData) => {
    await createExercise({ ...data, status: creatingIn ?? 'backlog' });
    setCreatingIn(null);
  };

  const handleUpdateExercise = async (id: string, data: Partial<ExerciseFormData>) => {
    await updateExercise(id, data);
    setEditingId(null);
  };

  const editingExercise = editingId ? exercises.find(e => e.id === editingId) : null;
  const draggedExercise = draggedId ? exercises.find(e => e.id === draggedId) : null;

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-gymflow-light-bg dark:bg-gymflow-bg">
        <p className="text-gymflow-light-text-muted dark:text-gray-400">Carregando exercícios...</p>
      </div>
    );
  }

  return (
    <AppShell
      title="Seu Treino"
      subtitle="Organize seus exercícios e acompanhe seu progresso"
    >
      {(error || moveError) && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-300">
          {moveError ?? error}
        </p>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        onDragStart={e => setDraggedId(String(e.active.id))}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setDraggedId(null)}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {COLUMNS.map(column => (
            <KanbanColumn
              key={column.value}
              title={column.label}
              status={column.value}
              exercises={exercises.filter(e => e.status === column.value)}
              onAddClick={() => setCreatingIn(column.value)}
              onEditClick={setEditingId}
              onDeleteClick={id => void deleteExercise(id)}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={null}>
          {draggedExercise ? <ExerciseCard exercise={draggedExercise} isDragging /> : null}
        </DragOverlay>
      </DndContext>

      <Modal open={creatingIn !== null} onClose={() => setCreatingIn(null)} title="Novo Exercício">
        {creatingIn !== null && (
          <ExerciseForm
            defaultStatus={creatingIn}
            onSubmit={handleCreateExercise}
            onCancel={() => setCreatingIn(null)}
          />
        )}
      </Modal>

      <Modal open={editingId !== null} onClose={() => setEditingId(null)} title="Editar Exercício">
        {editingExercise && (
          <ExerciseForm
            exercise={editingExercise}
            onSubmit={data => handleUpdateExercise(editingId!, data)}
            onCancel={() => setEditingId(null)}
          />
        )}
      </Modal>
    </AppShell>
  );
}
