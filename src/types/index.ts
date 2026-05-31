// ============================================================
// GymFlow — Tipos e Interfaces TypeScript
// ============================================================

export type ExerciseStatus = 'backlog' | 'hoje' | 'fazendo' | 'feito';

export interface Exercise {
  /** UUID gerado pelo banco */
  id: string;
  /** UUID do usuário autenticado (FK para auth.users) */
  user_id: string;
  title: string;
  /** Número de séries — inteiro positivo */
  sets: number;
  /** Número de repetições por série — inteiro positivo */
  reps: number;
  /** Carga em kg — decimal não negativo */
  weight: number;
  status: ExerciseStatus;
  /** Timestamp de criação em ISO 8601 */
  created_at: string;
}

export interface ExerciseFormData {
  title: string;
  sets: number;
  reps: number;
  weight: number;
  status: ExerciseStatus;
}

export type ExerciseFormErrors = Partial<Record<keyof ExerciseFormData, string>>;

export interface DashboardMetrics {
  /** Total de exercícios com status 'feito' */
  totalFeito: number;
  /** Soma de sets × reps × weight dos exercícios 'feito', em kg */
  cargaTotal: number;
  /** Dias distintos na semana corrente com ao menos um exercício 'feito' */
  frequenciaSemanal: number;
  last7Days: DayMetric[];
}

export interface DayMetric {
  /** Formato 'YYYY-MM-DD' */
  date: string;
  count: number;
}

export type Theme = 'dark' | 'light';

export type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting';

export interface KanbanColumn {
  id: ExerciseStatus;
  label: string;
}

export const KANBAN_COLUMNS: KanbanColumn[] = [
  { id: 'backlog', label: 'Backlog' },
  { id: 'hoje',    label: 'Hoje'    },
  { id: 'fazendo', label: 'Fazendo' },
  { id: 'feito',   label: 'Feito'   },
];
