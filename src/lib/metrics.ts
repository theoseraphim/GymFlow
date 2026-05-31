import type { Exercise, DashboardMetrics, DayMetric } from '../types';

const toDateKey = (date: string | Date) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-CA'); // Gera o formato YYYY-MM-DD local
};

export function calcularCargaTotal(exercises: Exercise[]): number {
  return exercises
    .filter(e => e.status === 'feito')
    .reduce((sum, e) => sum + e.sets * e.reps * e.weight, 0);
}

export function calcularFrequenciaSemanal(
  exercises: Exercise[],
  referenceDate: Date = new Date(),
): number {
  const feitos = exercises.filter(e => e.status === 'feito');
  const today = new Date(referenceDate);
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  weekStart.setHours(0, 0, 0, 0);
  today.setHours(23, 59, 59, 999);

  const weekDays = new Set<string>();
  feitos.forEach(e => {
    const exerciseDate = new Date(e.created_at);
    if (exerciseDate >= weekStart && exerciseDate <= today) {
      weekDays.add(toDateKey(e.created_at));
    }
  });

  return weekDays.size;
}

export function calcularLast7Days(
  exercises: Exercise[],
  referenceDate: Date = new Date(),
): DayMetric[] {
  const feitos = exercises.filter(e => e.status === 'feito');
  const today = new Date(referenceDate);
  const result: DayMetric[] = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = toDateKey(date);
    const count = feitos.filter(e => toDateKey(e.created_at) === dateStr).length;
    result.push({ date: dateStr, count });
  }

  return result;
}

export function buildDashboardMetrics(
  exercises: Exercise[],
  referenceDate: Date = new Date(),
): DashboardMetrics {
  const feitos = exercises.filter(e => e.status === 'feito');

  return {
    totalFeito: feitos.length,
    cargaTotal: calcularCargaTotal(exercises),
    frequenciaSemanal: calcularFrequenciaSemanal(exercises, referenceDate),
    last7Days: calcularLast7Days(exercises, referenceDate),
  };
}
