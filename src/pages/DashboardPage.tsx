import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { AppShell } from '../components/layout/AppShell';
import { useExercises } from '../hooks/useExercises';
import { useDashboardMetrics } from '../hooks/useDashboardMetrics';
import { useTheme } from '../hooks/useTheme';
import { getAIWorkoutInsight } from '../services/aiService';

function MetricCard({ label, value, hint, accent }: { label: string; value: string | number; hint: string; accent?: boolean; }) {
  return (
    <div className="rounded-xl border border-gymflow-light-border bg-gymflow-light-bg-card p-6 shadow-lg dark:border-gymflow-border dark:bg-gymflow-bg-card">
      <h3 className="mb-2 text-sm font-medium text-gymflow-light-text-muted dark:text-gray-400">{label}</h3>
      <p className={`text-3xl font-bold ${accent ? 'text-gymflow-accent dark:text-gymflow-accent-light' : 'text-gray-900 dark:text-white'}`}>{value}</p>
      <p className="mt-1 text-xs text-gymflow-light-text-muted dark:text-gray-500">{hint}</p>
    </div>
  );
}

export function DashboardPage() {
  const { exercises, loading, error } = useExercises();
  const { isDark } = useTheme();
  const metrics = useDashboardMetrics(exercises);

  const [insight, setInsight] = useState(""); 
  const [loadingAI, setLoadingAI] = useState(false);

  const handleGetInsight = async () => {
    if (loadingAI) return;
    
    setLoadingAI(true);
    try {
      // Pequeno delay para evitar spam de cliques
      await new Promise(res => setTimeout(res, 800));

      const completedOnes = exercises.filter(ex => ex.status === 'feito');
      const advice = await getAIWorkoutInsight(completedOnes);
      setInsight(advice);
    } catch (err: any) {
      if (err.message === "API_LIMIT") {
        setInsight("Gymenes está recuperando o fôlego (limite da API). Tente em 1 minuto!");
      } else {
        setInsight("Gymenes teve uma cãibra técnica. Tente de novo em instantes!");
      }
    } finally {
      setLoadingAI(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-gymflow-light-bg dark:bg-gymflow-bg">
        <p className="text-gymflow-light-text-muted dark:text-gray-400">Carregando dashboard...</p>
      </div>
    );
  }

  const gridStroke = isDark ? '#4a4450' : '#e5e7eb';
  const tickFill = isDark ? '#9ca3af' : '#6b7280';

  return (
    <AppShell title="Seu Desempenho" subtitle="Visualize suas métricas e progresso">
      {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-300">{error}</p>}

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard label="Exercícios Concluídos" value={metrics.totalFeito} hint="todos os tempos" />
        <MetricCard label="Carga Total Levantada" value={metrics.cargaTotal.toFixed(0)} hint="kg" accent />
        <MetricCard label="Frequência Semanal" value={metrics.frequenciaSemanal} hint="dias" />
      </div>

      <div className="mb-8 rounded-xl border border-gymflow-light-border bg-gymflow-light-bg-card p-6 shadow-lg dark:border-gymflow-border dark:bg-gymflow-bg-card">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Últimos 7 Dias</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={metrics.last7Days}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis
              dataKey="date"
              tick={{ fill: tickFill, fontSize: 12 }}
              tickFormatter={(date) => {
                const dateObj = new Date(date + 'T12:00:00');
                return dateObj.toLocaleDateString('pt-BR', { weekday: 'short' });
              }}
            />
            <YAxis tick={{ fill: tickFill, fontSize: 12 }} />
            <Tooltip contentStyle={{ backgroundColor: isDark ? '#3d3541' : '#ffffff', border: `1px solid ${isDark ? '#4a4450' : '#e5e7eb'}`, borderRadius: '0.5rem', color: isDark ? '#fff' : '#1f2937' }} />
            <Legend verticalAlign="top" height={36} />
            <Bar dataKey="count" fill={isDark ? '#B5A1BC' : '#9D8BA7'} name="Exercícios" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* CARD DO GYMENES */}
      <div className="rounded-xl border border-gymflow-accent/30 bg-gymflow-bg-card p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">🙋</span>
          <h3 className="text-lg font-bold text-white">Olá! Sou Gymenes, seu coach de IA!</h3>
        </div>

        {insight && (
          <div className="mb-6 rounded-lg bg-black/20 p-4 border-l-4 border-gymflow-accent">
            <p className="text-gymflow-accent-light italic text-sm">"{insight}"</p>
          </div>
        )}

        <button
          onClick={handleGetInsight}
          disabled={loadingAI || exercises.length === 0}
          className="w-full md:w-auto px-6 py-2 bg-gymflow-accent text-white rounded-lg font-bold hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {loadingAI ? "Gymenes está analisando..." : "Análise Técnica do Gymenes"}
        </button>
      </div>
    </AppShell>
  );
}