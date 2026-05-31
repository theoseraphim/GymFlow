import { useMemo } from 'react';
import { buildDashboardMetrics } from '../lib/metrics';
import type { Exercise, DashboardMetrics } from '../types';

export function useDashboardMetrics(exercises: Exercise[]): DashboardMetrics {
  return useMemo(() => buildDashboardMetrics(exercises), [exercises]);
}
