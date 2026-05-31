# GymFlow

Sistema de gestão de treinos no estilo Kanban: organize exercícios em colunas ágeis (Backlog → Hoje → Fazendo → Feito), arraste cards para atualizar o status e acompanhe métricas no dashboard.

## Stack

| Camada | Tecnologia |
|--------|------------|
| Frontend | React 19 + Vite + TypeScript |
| Estilo | Tailwind CSS v4 (dark mode por classe) |
| Backend | Supabase (Auth, PostgreSQL, Realtime) |
| Deploy | [Render](https://render.com) Static Site |

## Spec-Driven Development (Kiro)

Este projeto foi estruturado com **Kiro Specs**:

1. [Requirements](.kiro/specs/gymflow/requirements.md) — requisitos funcionais  
2. [Design](.kiro/specs/gymflow/design.md) — arquitetura e propriedades de correção  
3. [Tasks](.kiro/specs/gymflow/tasks.md) — plano de implementação  
4. Código em `src/` — entregas incrementais com revisão  

Docs: [Kiro Specs](https://kiro.dev/docs/specs)

## Funcionalidades

- Autenticação (login, cadastro, logout, rotas protegidas)
- CRUD de exercícios com validação e updates otimistas
- Board Kanban com drag and drop (persiste `status` no Supabase)
- Dashboard: concluídos, carga total (kg), frequência semanal, gráfico 7 dias
- Tema claro / escuro
- Sincronização Realtime filtrada por usuário

## Pré-requisitos

- Node.js 20+
- Conta [Supabase](https://supabase.com)
- Conta [Render](https://render.com) (para deploy)

## Instalação local

```bash
git clone <seu-repositorio>
cd Gymflow
npm install
cp .env.example .env.local
```

Edite `.env.local`:

```env
VITE_SUPABASE_URL=https://<projeto>.supabase.co
VITE_SUPABASE_ANON_KEY=<sua-chave-anon>
```

```bash
npm run dev
```

Abra `http://localhost:5173` → redireciona para `/board` após login.

## Migrations (Supabase)

No **SQL Editor** do Supabase (ou via CLI), execute na ordem:

1. `supabase/migrations/001_create_exercises.sql`
2. `supabase/migrations/002_rls_exercises.sql`
3. `supabase/migrations/003_realtime_and_indexes.sql`

Confirme em **Database → Replication** que a tabela `exercises` está na publicação `supabase_realtime`.

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção (`dist/`) |
| `npm run preview` | Preview do build |
| `npm run test` | Vitest em modo watch |
| `npm run test:run` | Testes uma vez (CI) |
| `npm run lint` | ESLint |

## Testes

Cobertura principal:

- `src/lib/exerciseSerializer.ts` — round-trip (incl. property tests com fast-check)
- `src/lib/metrics.ts` — carga total, frequência, últimos 7 dias
- `src/lib/validation.ts` — formulário inválido
- `src/lib/kanban.ts` — resolução de coluna no DnD
- `ExerciseCard` — informações visíveis no card

```bash
npm run test:run
```

CI: `.github/workflows/test.yml` (testes + build).

## Deploy no Render

### Static Site (manual)

1. **New → Static Site** conectado ao repositório Git  
2. **Build Command:** `npm install && npm run build`  
3. **Publish Directory:** `dist`  
4. **Environment Variables:**
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`  
5. Deploy

O arquivo `public/_redirects` garante fallback SPA (`/* → /index.html`). Alternativa: usar `render.yaml` (Blueprint) com rewrite de rotas.

### Após o deploy

- Adicione a URL do Render em **Supabase → Authentication → URL Configuration** (Site URL e Redirect URLs) se usar OAuth no futuro.
- Teste login, CRUD, drag entre colunas e dashboard.

## Estrutura do projeto

```
src/
├── components/   # auth, board, layout, ui
├── hooks/        # useAuth, useExercises, useTheme, useDashboardMetrics
├── lib/          # supabase, serializer, metrics, validation, kanban
├── pages/        # AuthPage, DashboardPage (+ KanbanBoard como board)
└── test/         # Vitest + fast-check
supabase/migrations/
.kiro/specs/gymflow/   # requirements, design, tasks
```

## Licença

Projeto de avaliação técnica — uso conforme instruções do desafio.
# GymFlow
# GymFlow
