import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Header } from '../layout/Header';
import { ExercisesProvider } from '../../hooks/useExercises';

export function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gymflow-light-bg dark:bg-gymflow-bg">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gymflow-accent border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <ExercisesProvider>
      <div className="flex min-h-screen flex-col bg-gymflow-light-bg transition-colors duration-200 dark:bg-gymflow-bg">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </ExercisesProvider>
  );
}
