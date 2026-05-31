# Implementation Plan

## Overview

Este plano cobre o desenvolvimento completo do GymFlow em 11 fases sequenciais. Stack: React 18 + Vite + TypeScript + TailwindCSS, Supabase (Auth + PostgreSQL + Realtime), Vitest + fast-check para testes, deploy no Render.

---

## Tasks

- [x] 1. Configuração do Projeto
  - [x] 1.1 Inicializar projeto Vite com template React + TypeScript e instalar dependências
    - Executar `npm create vite@latest . -- --template react-ts`
    - Produção: `@supabase/supabase-js`, `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`, `recharts`, `react-router-dom`
    - Dev: `tailwindcss`, `postcss`, `autoprefixer`, `vitest`, `@vitest/ui`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `fast-check`, `jsdom`, `msw`
    - _Requisito 8, Requisito 9_

  - [x] 1.2 Configurar TailwindCSS com suporte a modo escuro via classe `dark`
    - `tailwind.config.ts` com `darkMode: 'class'`
    - Diretivas `@tailwind` em `src/index.css`
    - _Requisito 7_

  - [x] 1.3 Configurar Vitest com ambiente jsdom
    - Bloco `test` em `vite.config.ts` com `environment: 'jsdom'`
    - `src/test/setup.ts` importando `@testing-library/jest-dom`
    - _Requisito 9_

  - [x] 1.4 Criar estrutura de pastas e tipos TypeScript
    - Diretórios: `src/components/{ui,auth,board,dashboard,layout}`, `src/hooks`, `src/lib`, `src/pages`, `src/types`, `src/test`
    - `src/types/index.ts` com interfaces `Exercise`, `ExerciseFormData`, `DashboardMetrics`, `DayMetric`, `ExerciseStatus`, `Theme`, `ConnectionStatus`
    - _Requisito 2, Requisito 5_

  - [x] 1.5 Criar cliente Supabase e `.env.example`
    - `src/lib/supabase.ts` com `createClient` tipado
    - `.env.example` com `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
    - _Requisito 8, Requisito 10_

- [x] 2. Banco de Dados e Migrations
  - [x] 2.1 Migration: criar tabela `exercises`
    - `supabase/migrations/001_create_exercises.sql`
    - Colunas: id, user_id, title, sets, reps, weight, status, created_at com todas as constraints
    - _Requisito 8.1_

  - [x] 2.2 Migration: habilitar RLS e políticas de acesso
    - `supabase/migrations/002_rls_exercises.sql`
    - Políticas SELECT, INSERT, UPDATE, DELETE restritas a `auth.uid() = user_id`
    - _Requisito 8.2_

  - [x] 2.3 Migration: Realtime e índices
    - `supabase/migrations/003_realtime_and_indexes.sql`
    - `ALTER PUBLICATION supabase_realtime ADD TABLE exercises`
    - Índices: `idx_exercises_user_id`, `idx_exercises_status`, `idx_exercises_user_status`
    - _Requisito 8.3, Requisito 8.4_

- [x] 3. Autenticação
  - [ ] 3.1 Hook `useAuth`
    - `src/hooks/useAuth.ts` com `user`, `session`, `loading`, `signIn`, `signUp`, `signOut`
    - `supabase.auth.onAuthStateChange` para persistência de sessão
    - _Requisito 1.3, 1.7, 1.9_

  - [ ] 3.2 Componente `ProtectedRoute`
    - Redireciona para `/auth` se não autenticado
    - Renderiza `<Outlet />` quando autenticado
    - _Requisito 1.8_

  - [ ] 3.3 Componentes `LoginForm` e `SignupForm`
    - Validação local de campos obrigatórios
    - Mapeamento de erros do Supabase para mensagens amigáveis
    - _Requisito 1.1, 1.4, 1.5, 1.6_

  - [ ] 3.4 Página `AuthPage` e roteamento em `App.tsx`
    - Alternância entre Login e Signup
    - Rotas `/auth`, `/board`, `/dashboard` com `ProtectedRoute`
    - _Requisito 1.1, 1.8_

- [x] 4. CRUD de Exercícios e Serialização
  - [ ] 4.1 `exerciseSerializer.ts`
    - `serialize(data, userId)` e `deserialize(record)`
    - _Requisito 2.9_

  - [ ]* 4.2 Teste de propriedade: round-trip de serialização
    - **Propriedade 1: Round-trip de serialização de exercícios**
    - **Valida: Requisito 2.9, Requisito 9.2**

  - [ ] 4.3 Hook `useExercises`
    - `exercises`, `loading`, `error`, `createExercise`, `updateExercise`, `deleteExercise`, `moveExercise`, `refetch`
    - Atualizações otimistas com rollback
    - _Requisito 2.2, 2.5, 2.6_

  - [ ] 4.4 Primitivos de UI: `Button`, `Input`, `Modal`, `Spinner`, `Badge`
    - _Requisito 7.6_

  - [ ] 4.5 Componente `ExerciseForm`
    - Validação por campo, modo criação e edição
    - _Requisito 2.1, 2.3, 2.4_

  - [ ]* 4.6 Testes de componente para `ExerciseForm`
    - **Valida: Requisito 9.5**

- [x] 5. Board Kanban e Drag and Drop
  - [ ] 5.1 Componente `ExerciseCard` com `useDraggable`
    - Exibe título, séries, reps, carga; botões editar e excluir
    - _Requisito 3.3, 4.1_

  - [ ]* 5.2 Teste de propriedade: card exibe todas as informações
    - **Propriedade 7: Card exibe todas as informações do exercício**
    - **Valida: Requisito 3.3**

  - [ ] 5.3 Componente `Column` com `useDroppable`
    - Contagem de cards no cabeçalho, highlight durante drag
    - _Requisito 3.1, 3.4_

  - [ ] 5.4 Componente `Board` com `DndContext` e `DragOverlay`
    - `PointerSensor` e `TouchSensor`, lógica de `onDragEnd` com rollback
    - _Requisito 4.2, 4.3, 4.6_

  - [ ]* 5.5 Teste de propriedade: distribuição de cards por coluna
    - **Propriedade 6: Distribuição e contagem de cards por coluna são corretas**
    - **Valida: Requisito 3.2, 3.4, 9.4**

  - [ ]* 5.6 Teste de propriedade: rollback após erro de drag-and-drop
    - **Propriedade 8: Rollback após erro de drag-and-drop**
    - **Valida: Requisito 4.4**

  - [ ] 5.7 Página `BoardPage`
    - Integra Board, modal de criação, estados de loading e erro
    - _Requisito 3.2, 3.5_

- [x] 6. Dashboard e Métricas
  - [ ] 6.1 `metrics.ts` com funções puras
    - `calcularCargaTotal`, `calcularFrequenciaSemanal`, `calcularLast7Days`
    - _Requisito 5.2, 5.3, 5.4_

  - [ ]* 6.2 Testes de propriedade para métricas
    - **Propriedade 2: Carga Total invariante à ordem — Valida: Requisito 5.2, 9.3**
    - **Propriedade 3: Carga Total ignora não-feitos — Valida: Requisito 5.2**
    - **Propriedade 4: Frequência Semanal em [0,7] — Valida: Requisito 5.3**

  - [ ]* 6.3 Testes unitários para funções de métricas
    - **Valida: Requisito 9.1**

  - [ ] 6.4 Hook `useDashboard`
    - Deriva métricas de `useExercises` via `metrics.ts`
    - _Requisito 5.1, 5.5_

  - [ ] 6.5 Componentes `MetricCard`, `WeeklyChart`, `EmptyState`
    - Recharts `BarChart` para `last7Days`
    - _Requisito 5.4, 5.6_

  - [ ] 6.6 Página `DashboardPage`
    - _Requisito 5.1, 5.2, 5.3, 5.4, 5.6_

- [x] 7. Sincronização em Tempo Real
  - [ ] 7.1 Hook `useRealtime`
    - Assina canal filtrado por `user_id`, processa INSERT/UPDATE/DELETE
    - _Requisito 6.1, 6.2, 6.3, 6.5_

  - [ ] 7.2 Indicador de conexão e reconexão automática
    - `connectionStatus`, refetch ao reconectar
    - _Requisito 6.4_

  - [ ] 7.3 Integrar `useRealtime` ao `useExercises`
    - _Requisito 6.1, 6.2, 6.3_

- [x] 8. Tema e Layout
  - [ ] 8.1 Hook `useTheme`
    - localStorage + `prefers-color-scheme`, classe `dark` no `<html>`
    - _Requisito 7.2, 7.3, 7.4, 7.5_

  - [ ] 8.2 Componentes `ThemeToggle` e `Navbar`
    - Navegação, logout, indicador de conexão
    - _Requisito 7.3_

  - [ ] 8.3 Componente `AppLayout` responsivo
    - Breakpoints 320px / 768px / 1024px, contraste WCAG AA
    - _Requisito 7.1, 7.6_

- [x] 9. Testes Automatizados (MVP — property tests e CI; formulários auth opcionais)
  - [ ] 9.1 Arquivo `src/test/arbitraries.ts`
    - `arbitraryExercise()`, `arbitraryInvalidExerciseFormData()`, `toFormData()`
    - _Requisito 9_

  - [ ]* 9.2 Teste de propriedade: validação rejeita entradas inválidas
    - **Propriedade 5: Validação rejeita entradas inválidas**
    - **Valida: Requisito 1.6, 2.3**

  - [ ]* 9.3 Testes de componente para `LoginForm` e `SignupForm`
    - **Valida: Requisito 9.1**

  - [ ] 9.4 Workflow de CI com GitHub Actions
    - `.github/workflows/test.yml` executando `npm ci` e `npm run test`
    - _Requisito 9.6_

- [x] 10. Checkpoint — todos os testes passando
  - Executar `npm run test -- --run` e corrigir falhas

- [x] 11. Documentação e Deploy
  - [x] 11.1 `README.md` completo
    - Descrição, stack, instalação, migrations, testes, deploy
    - _Requisito 10.1, 10.3_

  - [ ] 11.2 Deploy no Render (config pronta — executar no painel Render)
    - Build command: `npm run build`, publish directory: `dist`
    - Variáveis de ambiente no painel do Render
    - _Requisito 10.1_

---

## Notes

- Tarefas marcadas com `*` são opcionais para MVP mas recomendadas para avaliação
- As migrations (Fase 2) devem ser aplicadas no Supabase antes de iniciar as fases 3+
- O arquivo `arbitraries.ts` (9.1) deve existir antes de qualquer teste de propriedade

---

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3", "1.4"] },
    { "id": 2, "tasks": ["1.5", "2.1"] },
    { "id": 3, "tasks": ["2.2", "2.3"] },
    { "id": 4, "tasks": ["3.1", "4.1", "4.4"] },
    { "id": 5, "tasks": ["3.2", "3.3", "4.3"] },
    { "id": 6, "tasks": ["3.4", "4.5", "4.6", "6.1"] },
    { "id": 7, "tasks": ["5.1", "6.2", "6.3"] },
    { "id": 8, "tasks": ["5.2", "5.3", "6.4"] },
    { "id": 9, "tasks": ["5.4", "6.5"] },
    { "id": 10, "tasks": ["5.5", "5.6", "6.6"] },
    { "id": 11, "tasks": ["5.7", "7.1"] },
    { "id": 12, "tasks": ["7.2"] },
    { "id": 13, "tasks": ["7.3", "8.1"] },
    { "id": 14, "tasks": ["8.2"] },
    { "id": 15, "tasks": ["8.3"] },
    { "id": 16, "tasks": ["9.1"] },
    { "id": 17, "tasks": ["9.2", "9.3"] },
    { "id": 18, "tasks": ["9.4", "10"] },
    { "id": 19, "tasks": ["11.1", "11.2"] }
  ]
}
```
