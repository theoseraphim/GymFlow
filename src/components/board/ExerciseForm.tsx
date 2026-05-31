import { useState, type FormEvent } from 'react';
import { validateExerciseForm } from '../../lib/validation';
import { Button } from '../ui/Button';
import type { Exercise, ExerciseFormData, ExerciseFormErrors, ExerciseStatus } from '../../types';

interface ExerciseFormProps {
  /** Se fornecido, o formulário opera em modo edição */
  exercise?: Exercise;
  /** Status inicial para criação (ex: coluna onde o botão foi clicado) */
  defaultStatus?: ExerciseStatus;
  onSubmit: (data: ExerciseFormData) => Promise<void>;
  onCancel: () => void;
}

const STATUS_OPTIONS: { value: ExerciseStatus; label: string }[] = [
  { value: 'backlog', label: 'Backlog' },
  { value: 'hoje',    label: 'Hoje'    },
  { value: 'fazendo', label: 'Fazendo' },
  { value: 'feito',   label: 'Feito'   },
];

export function ExerciseForm({ exercise, defaultStatus = 'backlog', onSubmit, onCancel }: ExerciseFormProps) {
  const [title, setTitle]   = useState(exercise?.title   ?? '');
  const [sets, setSets]     = useState(exercise?.sets    ?? 3);
  const [reps, setReps]     = useState(exercise?.reps    ?? 10);
  const [weight, setWeight] = useState(exercise?.weight  ?? 0);
  const [status, setStatus] = useState<ExerciseStatus>(exercise?.status ?? defaultStatus);
  const [errors, setErrors] = useState<ExerciseFormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const inputClass = (field: keyof ExerciseFormErrors) =>
    `mt-1 block w-full rounded-lg border px-3 py-2 text-sm outline-none transition
    focus:ring-2 focus:ring-[#9D8BA7]
    dark:bg-[#2a2230] dark:text-white dark:placeholder-gray-500
    ${errors[field] ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-[#4a4450]'}`;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const formData: ExerciseFormData = {
      title: title.trim(),
      sets: Number(sets),
      reps: Number(reps),
      weight: Number(weight),
      status,
    };

    const validationErrors = validateExerciseForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {/* Título */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Nome do exercício
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Ex: Supino reto"
          className={inputClass('title')}
        />
        {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
      </div>

      {/* Séries / Repetições / Carga */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label htmlFor="sets" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Series
          </label>
          <input
            id="sets"
            type="number"
            min={1}
            value={sets}
            onChange={e => setSets(Number(e.target.value))}
            className={inputClass('sets')}
          />
          {errors.sets && <p className="mt-1 text-xs text-red-500">{errors.sets}</p>}
        </div>
        <div>
          <label htmlFor="reps" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Reps
          </label>
          <input
            id="reps"
            type="number"
            min={1}
            value={reps}
            onChange={e => setReps(Number(e.target.value))}
            className={inputClass('reps')}
          />
          {errors.reps && <p className="mt-1 text-xs text-red-500">{errors.reps}</p>}
        </div>
        <div>
          <label htmlFor="weight" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Carga (kg)
          </label>
          <input
            id="weight"
            type="number"
            min={0}
            step={0.5}
            value={weight}
            onChange={e => setWeight(Number(e.target.value))}
            className={inputClass('weight')}
          />
          {errors.weight && <p className="mt-1 text-xs text-red-500">{errors.weight}</p>}
        </div>
      </div>

      {/* Status */}
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Status
        </label>
        <select
          id="status"
          value={status}
          onChange={e => setStatus(e.target.value as ExerciseStatus)}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
            outline-none transition focus:ring-2 focus:ring-[#9D8BA7]
            dark:border-[#4a4450] dark:bg-[#2a2230] dark:text-white"
        >
          {STATUS_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Ações */}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" loading={submitting}>
          {exercise ? 'Salvar' : 'Criar exercicio'}
        </Button>
      </div>
    </form>
  );
}
