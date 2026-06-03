# ⚡ GymFlow

**Sistema de gestão ágil de treinos no estilo Kanban**

Organize exercícios em colunas ágeis (Backlog → Hoje → Fazendo → Feito), arraste cards para atualizar o status, acompanhe métricas no dashboard e receba insights de IA sobre seus treinos.

> PoC - dataRain Consulting  
> Desenvolvido por **Théo Henrique Oliveira Seraphim**

---

## Stack Tecnológica

Arquitetura moderna, escalável e orientada a dados.

| Camada | Tecnologia |
|--------|------------|
| Frontend | React 19 + Vite + TypeScript |
| Estilo | Tailwind CSS v4 (Light Mode / Dark Mode) |
| Backend | Supabase (Auth, PostgreSQL, Realtime, Edge Functions) |
| IA | Amazon Bedrock via Supabase Edge Function — coach "Gymenes" |
| Deploy | [Render](https://render.com) Static Site |

---

## Funcionalidades

| Feature | Descrição |
|---------|-----------|
| **Board Kanban / Drag and Drop / CRUD** | Backlog → Hoje → Fazendo → Feito |
| **Dashboard** | Exercícios concluídos, carga total (kg), frequência semanal, gráfico 7 dias |
| **Agente IA (Gymenes)** | Análise dos treinos concluídos e dicas de coach via IA |
| **Autenticação** | Login, cadastro, logout, rotas protegidas |
| **Tema claro / escuro** | Toggle com persistência |
| **Realtime** | Sincronização filtrada por usuário via Supabase |
| **Spec-Driven Dev** | Requisitos → Design → Tasks → Código |

---

## Ferramentas de Desenvolvimento

Ferramentas e IAs integradas para acelerar o desenvolvimento e otimizar o produto final:

| Ferramenta | Uso |
|------------|-----|
| [Kiro.dev](https://kiro.dev) | Spec-Driven Development |
| VS Code | Code Editor |
| Cursor | AI-Powered Code Editor |
| Gemini | Generative AI Agent |
| [Supabase](https://supabase.com) | Database + Auth + Realtime + Edge Functions |
| [Amazon Bedrock](https://aws.amazon.com/bedrock/) | LLM (agente Gymenes) |
| [GitHub](https://github.com) | Version Control & CI/CD |
| [Render](https://render.com) | Cloud Hosting & Deployment |

---

## Pré-requisitos

- Node.js 20+
- Conta [Supabase](https://supabase.com)
- Acesso ao [Amazon Bedrock](https://aws.amazon.com/bedrock/) (chave de API para o agente IA)
- [Supabase CLI](https://supabase.com/docs/guides/cli) (para deploy da Edge Function)
- Conta [Render](https://render.com) (para deploy)

---

## Instalação local

```bash
git clone <seu-repositorio>
cd Gymflow
npm install
cp .env.example .env.local
```

Edite `.env.local` com suas chaves:

```env
VITE_SUPABASE_URL=https://<projeto>.supabase.co
VITE_SUPABASE_ANON_KEY=<sua-chave-anon>
```

> A chave da IA (Amazon Bedrock) **não** vai no `.env.local`. Ela é um secret
> no Supabase, usado apenas pela Edge Function. Veja a seção [Agente IA](#agente-ia-gymenes).

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Acesse `http://localhost:5173` → redireciona para `/board` após login.

---

## Agente IA (Gymenes)

O insight de IA é gerado por uma **Supabase Edge Function** (`ai-insight`) que chama
o Amazon Bedrock. A chave da Bedrock fica como **secret no servidor** — nunca é
exposta no frontend (importante, pois o build do Vite embute qualquer `VITE_*` no
JavaScript público do navegador).

```
Browser (GymFlow) → Edge Function ai-insight (guarda a chave) → Amazon Bedrock
```

### Deploy da função

```bash
# 1. Login e link ao projeto (uma vez)
supabase login
supabase link --project-ref <seu-project-ref>

# 2. Configure o secret com a chave do Bedrock
supabase secrets set AWS_BEARER_TOKEN_BEDROCK="<sua-chave-bedrock>"
# (opcional) região e modelo
supabase secrets set BEDROCK_REGION="us-east-1"
supabase secrets set BEDROCK_MODEL_ID="us.amazon.nova-lite-v1:0"

# 3. Publique a função
supabase functions deploy ai-insight
```

> Para testar localmente: `supabase functions serve ai-insight` (requer Docker).

---

## Migrations (Supabase)

No **SQL Editor** do Supabase (ou via CLI), execute na ordem:

1. `supabase/migrations/001_create_exercises.sql`
2. `supabase/migrations/002_rls_exercises.sql`
3. `supabase/migrations/003_realtime_and_indexes.sql`

Confirme em **Database → Replication** que a tabela `exercises` está na publicação `supabase_realtime`.

---

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção (`dist/`) |
| `npm run preview` | Preview do build |
| `npm run test` | Vitest em modo watch |
| `npm run test:run` | Testes uma vez (CI) |
| `npm run lint` | ESLint |

---

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

---

## Deploy no Render

### Static Site

1. **New → Static Site** conectado ao repositório Git
2. **Build Command:** `npm install && npm run build`
3. **Publish Directory:** `dist`
4. **Environment Variables:**
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy

> A chave da IA não vai no Render. Ela é um secret na Edge Function do Supabase.

O arquivo `public/_redirects` garante fallback SPA (`/* → /index.html`).

### Após o deploy

- Adicione a URL do Render em **Supabase → Authentication → URL Configuration** (Site URL e Redirect URLs).
- Teste login, CRUD, drag entre colunas, dashboard e insights do Gymenes.

---

## Estrutura do projeto

```
src/
├── components/   # auth, board, dashboard, layout, ui
├── context/      # ExercisesContext, ThemeContext
├── hooks/        # useAuth, useExercises, useTheme, useDashboardMetrics
├── lib/          # supabase, serializer, metrics, validation, kanban
├── pages/        # AuthPage, DashboardPage (+ KanbanBoard como board)
├── services/     # aiService (chama a Edge Function → Bedrock / Gymenes)
└── test/         # Vitest + fast-check
supabase/
├── migrations/        # SQL (tabela, RLS, realtime)
└── functions/         # Edge Functions (ai-insight → Bedrock)
.kiro/specs/gymflow/   # requirements, design, tasks
```

---

## Spec-Driven Development (Kiro)

Este projeto foi estruturado com **Kiro Specs**:

1. [Requirements](.kiro/specs/gymflow/requirements.md) — requisitos funcionais
2. [Design](.kiro/specs/gymflow/design.md) — arquitetura e propriedades de correção
3. [Tasks](.kiro/specs/gymflow/tasks.md) — plano de implementação
4. Código em `src/` — entregas incrementais com revisão

Docs: [Kiro Specs](https://kiro.dev/docs/specs)

---

## Licença

Projeto de avaliação técnica — uso conforme instruções do desafio.
