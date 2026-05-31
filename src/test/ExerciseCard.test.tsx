import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ExerciseCard } from '../components/board/ExerciseCard';
import type { Exercise } from '../types';

const exercise: Exercise = {
  id: '1',
  user_id: 'u',
  title: 'Leg Press',
  sets: 4,
  reps: 12,
  weight: 120.5,
  status: 'fazendo',
  created_at: '2026-05-25T10:00:00.000Z',
};

describe('ExerciseCard', () => {
  it('exibe título, séries, reps e carga', () => {
    render(<ExerciseCard exercise={exercise} />);
    expect(screen.getByRole('heading', { name: 'Leg Press' })).toBeInTheDocument();
    expect(screen.getByText('Séries:')).toBeInTheDocument();
    expect(screen.getByText('Reps:')).toBeInTheDocument();
    expect(screen.getByText('120.5 kg')).toBeInTheDocument();
  });
});
