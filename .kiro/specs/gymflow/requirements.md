# Requirements Document

## Introduction

O GymFlow é um sistema web de gestão de treinos inspirado em metodologias Kanban e ágeis. O objetivo é permitir que usuários organizem seus exercícios em um board visual com colunas de progresso, acompanhem métricas de desempenho em um dashboard e gerenciem sua rotina de treinos de forma intuitiva e responsiva.

O sistema é construído com React + Vite + TailwindCSS no frontend, Supabase (Auth + PostgreSQL + Realtime) como backend e banco de dados, e é implantado como site estático no Render.

---

## Glossary

- **GymFlow**: O sistema web de gestão de treinos descrito neste documento.
- **Usuário**: Pessoa autenticada que utiliza o GymFlow para gerenciar seus treinos.
- **Exercício**: Unidade de treino com campos: título, séries, repetições, carga e status.
- **Card**: Representação visual de um Exercício no Board Kanban.
- **Board**: Interface visual no estilo Kanban contendo as colunas de progresso.
- **Coluna**: Agrupamento de Cards dentro do Board, representando um estado do Exercício.
- **Status**: Estado atual de um Exercício: `backlog`, `hoje`, `fazendo` ou `feito`.
- **Dashboard**: Painel de métricas e gráficos de desempenho do Usuário.
- **Supabase_Auth**: Serviço de autenticação fornecido pelo Supabase.
- **Supabase_DB**: Banco de dados PostgreSQL gerenciado pelo Supabase.
- **Supabase_Realtime**: Serviço de sincronização em tempo real do Supabase.
- **CRUD**: Conjunto de operações Criar, Ler, Atualizar e Deletar aplicadas a Exercícios.
- **Drag and Drop**: Interação de arrastar e soltar Cards entre Colunas do Board.
- **Tema**: Configuração visual do sistema: `dark` ou `light`.
- **Frequência Semanal**: Número de dias distintos na semana corrente com ao menos um Exercício `feito`.
- **Carga Total**: Soma de `séries × repetições × carga` de todos os Exercícios com status `feito`.
- **Migration**: Script SQL versionado que define ou altera a estrutura do banco de dados.
- **RLS**: Row Level Security — política de segurança em nível de linha no PostgreSQL/Supabase.

---

## Requirements

### Requirement 1: Autenticação de Usuários

**User Story:** Como visitante, quero criar uma conta e fazer login no GymFlow, para que eu possa acessar e gerenciar meus treinos de forma segura e personalizada.

#### Acceptance Criteria

1. THE GymFlow SHALL exibir uma página de autenticação com formulários de cadastro (signup) e login acessíveis a visitantes não autenticados.
2. WHEN um visitante submete o formulário de cadastro com e-mail e senha válidos, THE Supabase_Auth SHALL criar uma nova conta de Usuário e THE GymFlow SHALL redirecionar o Usuário para o Board.
3. WHEN um visitante submete o formulário de login com credenciais válidas, THE Supabase_Auth SHALL autenticar o Usuário e THE GymFlow SHALL redirecionar o Usuário para o Board.
4. IF um visitante submete o formulário de login com credenciais inválidas, THEN THE GymFlow SHALL exibir uma mensagem de erro descritiva sem revelar qual campo está incorreto.
5. IF um visitante submete o formulário de cadastro com um e-mail já cadastrado, THEN THE GymFlow SHALL exibir uma mensagem informando que o e-mail já está em uso.
6. IF um visitante submete qualquer formulário de autenticação com campos obrigatórios vazios, THEN THE GymFlow SHALL exibir mensagens de validação indicando os campos ausentes antes de enviar a requisição ao Supabase_Auth.
7. WHEN um Usuário autenticado aciona a opção de logout, THE Supabase_Auth SHALL encerrar a sessão e THE GymFlow SHALL redirecionar o Usuário para a página de autenticação.
8. WHILE um Usuário não está autenticado, THE GymFlow SHALL redirecionar qualquer acesso a rotas protegidas para a página de autenticação.
9. WHILE um Usuário está autenticado, THE GymFlow SHALL manter a sessão ativa entre recarregamentos de página sem exigir novo login.

---

### Requirement 2: CRUD de Exercícios

**User Story:** Como Usuário autenticado, quero criar, visualizar, editar e excluir exercícios com seus detalhes, para que eu possa montar e manter minha lista de treinos atualizada.

#### Acceptance Criteria

1. THE GymFlow SHALL permitir que o Usuário crie um Exercício informando: título (texto, obrigatório), séries (inteiro positivo, obrigatório), repetições (inteiro positivo, obrigatório), carga em kg (número decimal não negativo, obrigatório) e status inicial (padrão: `backlog`).
2. WHEN o Usuário submete o formulário de criação com todos os campos válidos, THE Supabase_DB SHALL persistir o Exercício associado ao `user_id` do Usuário autenticado e THE GymFlow SHALL exibir o novo Card no Board na coluna correspondente ao status informado.
3. IF o Usuário submete o formulário de criação com campos obrigatórios ausentes ou inválidos, THEN THE GymFlow SHALL exibir mensagens de validação por campo sem enviar dados ao Supabase_DB.
4. WHEN o Usuário aciona a edição de um Exercício existente, THE GymFlow SHALL exibir um formulário pré-preenchido com os dados atuais do Exercício.
5. WHEN o Usuário submete o formulário de edição com dados válidos, THE Supabase_DB SHALL atualizar o Exercício e THE GymFlow SHALL refletir as alterações no Card correspondente imediatamente.
6. WHEN o Usuário confirma a exclusão de um Exercício, THE Supabase_DB SHALL remover o registro e THE GymFlow SHALL remover o Card do Board sem recarregar a página.
7. IF o Usuário aciona a exclusão de um Exercício, THEN THE GymFlow SHALL exibir uma confirmação antes de executar a operação de deleção.
8. THE Supabase_DB SHALL aplicar políticas RLS garantindo que cada Usuário acesse, modifique e exclua apenas os Exercícios associados ao seu próprio `user_id`.
9. THE GymFlow SHALL serializar e desserializar Exercícios de forma que `deserializar(serializar(exercício))` produza um objeto equivalente ao original (propriedade round-trip).

---

### Requirement 3: Board Kanban

**User Story:** Como Usuário autenticado, quero visualizar meus exercícios organizados em um board Kanban com colunas de progresso, para que eu possa ter uma visão clara do estado de cada exercício no meu treino.

#### Acceptance Criteria

1. THE GymFlow SHALL exibir o Board com exatamente quatro Colunas fixas na seguinte ordem: **Backlog**, **Hoje**, **Fazendo** e **Feito**.
2. WHEN o Board é carregado, THE GymFlow SHALL buscar todos os Exercícios do Usuário autenticado no Supabase_DB e distribuir cada Card na Coluna correspondente ao seu status.
3. THE GymFlow SHALL exibir em cada Card as informações: título, séries, repetições e carga do Exercício.
4. WHILE o Board está carregado, THE GymFlow SHALL exibir o número de Cards em cada Coluna no cabeçalho da respectiva Coluna.
5. IF o Supabase_DB retornar um erro ao carregar os Exercícios, THEN THE GymFlow SHALL exibir uma mensagem de erro no Board e oferecer a opção de tentar novamente.

---

### Requirement 4: Drag and Drop entre Colunas

**User Story:** Como Usuário autenticado, quero arrastar e soltar cards de exercício entre as colunas do board, para que eu possa atualizar o status de um exercício de forma rápida e visual.

#### Acceptance Criteria

1. WHEN o Usuário inicia o arraste de um Card, THE GymFlow SHALL destacar visualmente as Colunas que aceitam o Card como destino válido.
2. WHEN o Usuário solta um Card em uma Coluna diferente da origem, THE GymFlow SHALL atualizar o status do Exercício correspondente para o status da Coluna de destino no Supabase_DB e mover o Card visualmente para a nova Coluna.
3. WHEN o Usuário solta um Card na mesma Coluna de origem, THE GymFlow SHALL manter o Card em sua posição sem realizar nenhuma operação no Supabase_DB.
4. IF o Supabase_DB retornar um erro ao atualizar o status após um Drag and Drop, THEN THE GymFlow SHALL reverter o Card para a Coluna de origem e exibir uma mensagem de erro ao Usuário.
5. WHERE o Supabase_Realtime estiver habilitado, WHEN o status de um Exercício for atualizado por qualquer cliente do mesmo Usuário, THE GymFlow SHALL mover o Card para a Coluna correta em todos os clientes conectados sem recarregar a página.
6. THE GymFlow SHALL suportar Drag and Drop em dispositivos com tela sensível ao toque (mobile e tablet).

---

### Requirement 5: Dashboard de Métricas

**User Story:** Como Usuário autenticado, quero visualizar um dashboard com métricas do meu desempenho, para que eu possa acompanhar meu progresso e manter a motivação nos treinos.

#### Acceptance Criteria

1. THE GymFlow SHALL exibir no Dashboard o total de Exercícios com status `feito` do Usuário autenticado.
2. THE GymFlow SHALL calcular e exibir no Dashboard a Carga Total levantada, definida como a soma de `séries × repetições × carga` de todos os Exercícios com status `feito`, expressa em kg.
3. THE GymFlow SHALL calcular e exibir no Dashboard a Frequência Semanal, definida como o número de dias distintos na semana corrente (segunda a domingo) em que ao menos um Exercício foi movido para o status `feito`.
4. THE GymFlow SHALL exibir no Dashboard ao menos um gráfico visual representando a evolução dos Exercícios concluídos ao longo dos últimos 7 dias.
5. WHEN os dados de Exercícios do Usuário são atualizados, THE GymFlow SHALL recalcular e atualizar as métricas do Dashboard sem recarregar a página.
6. IF o Usuário não possui nenhum Exercício com status `feito`, THEN THE GymFlow SHALL exibir valores zerados nas métricas e uma mensagem encorajadora no lugar dos gráficos.

---

### Requirement 6: Sincronização em Tempo Real

**User Story:** Como Usuário autenticado, quero que as alterações nos meus exercícios sejam refletidas em tempo real em todos os dispositivos abertos, para que eu possa usar o GymFlow simultaneamente em diferentes telas sem inconsistências.

#### Acceptance Criteria

1. WHERE o Supabase_Realtime estiver habilitado, WHEN um Exercício for criado pelo Usuário em qualquer cliente, THE GymFlow SHALL adicionar o Card correspondente no Board de todos os clientes conectados em menos de 3 segundos.
2. WHERE o Supabase_Realtime estiver habilitado, WHEN um Exercício for atualizado pelo Usuário em qualquer cliente, THE GymFlow SHALL refletir as alterações no Card em todos os clientes conectados em menos de 3 segundos.
3. WHERE o Supabase_Realtime estiver habilitado, WHEN um Exercício for excluído pelo Usuário em qualquer cliente, THE GymFlow SHALL remover o Card do Board em todos os clientes conectados em menos de 3 segundos.
4. IF a conexão com o Supabase_Realtime for interrompida, THEN THE GymFlow SHALL exibir um indicador visual de status de conexão e tentar reconectar automaticamente.
5. THE Supabase_DB SHALL aplicar políticas RLS garantindo que as assinaturas Realtime de um Usuário recebam apenas eventos referentes aos seus próprios Exercícios.

---

### Requirement 7: Responsividade e Tema Visual

**User Story:** Como Usuário, quero que o GymFlow funcione bem em qualquer dispositivo e que eu possa escolher entre tema claro e escuro, para que eu tenha uma experiência confortável independentemente do ambiente.

#### Acceptance Criteria

1. THE GymFlow SHALL renderizar todos os componentes de forma responsiva, adaptando o layout para dispositivos com largura de tela a partir de 320px (mobile), 768px (tablet) e 1024px (desktop).
2. WHEN o GymFlow é carregado pela primeira vez, THE GymFlow SHALL aplicar o Tema correspondente à preferência do sistema operacional do Usuário (`prefers-color-scheme`).
3. WHEN o Usuário alterna o Tema pelo seletor de tema, THE GymFlow SHALL aplicar o novo Tema imediatamente em toda a interface sem recarregar a página.
4. WHEN o Usuário alterna o Tema, THE GymFlow SHALL persistir a preferência de Tema no `localStorage`.
5. WHEN o GymFlow é recarregado, THE GymFlow SHALL restaurar o Tema salvo no `localStorage`, tendo prioridade sobre a preferência do sistema operacional.
6. THE GymFlow SHALL garantir contraste mínimo de 4,5:1 entre texto e fundo em ambos os temas, conforme WCAG 2.1 nível AA.

---

### Requirement 8: Persistência e Migrations do Banco de Dados

**User Story:** Como desenvolvedor, quero que o esquema do banco de dados seja versionado por migrations SQL, para que o ambiente de desenvolvimento e produção possam ser reproduzidos de forma confiável.

#### Acceptance Criteria

1. THE GymFlow SHALL fornecer ao menos uma Migration SQL que crie a tabela `exercises` com as colunas: `id` (UUID, PK), `user_id` (UUID, FK auth.users), `title` (TEXT NOT NULL), `sets` (INTEGER CHECK > 0), `reps` (INTEGER CHECK > 0), `weight` (NUMERIC(8,2) CHECK >= 0), `status` (TEXT CHECK IN ('backlog','hoje','fazendo','feito') DEFAULT 'backlog'), `created_at` (TIMESTAMPTZ DEFAULT now()).
2. THE GymFlow SHALL fornecer uma Migration SQL que habilite RLS na tabela `exercises` e crie políticas que restrinjam SELECT, INSERT, UPDATE e DELETE ao `user_id` igual ao `auth.uid()`.
3. THE GymFlow SHALL fornecer uma Migration SQL que habilite a publicação Realtime para a tabela `exercises`.
4. THE GymFlow SHALL fornecer uma Migration SQL que crie índices em `user_id` e `status` na tabela `exercises`.
5. WHEN as Migrations são aplicadas em sequência em um banco de dados PostgreSQL limpo, THE Supabase_DB SHALL resultar em um esquema funcional e consistente.

---

### Requirement 9: Testes Automatizados

**User Story:** Como desenvolvedor, quero que as funcionalidades críticas do sistema sejam cobertas por testes automatizados, para que eu possa refatorar e evoluir o código com confiança.

#### Acceptance Criteria

1. THE GymFlow SHALL possuir testes unitários para todas as funções de CRUD de Exercícios, cobrindo os caminhos de sucesso e de erro.
2. THE GymFlow SHALL possuir testes de propriedade que verifiquem que a serialização e desserialização de Exercícios é uma operação round-trip.
3. THE GymFlow SHALL possuir testes de propriedade que verifiquem que a função de cálculo de Carga Total é invariante à ordem dos Exercícios.
4. THE GymFlow SHALL possuir testes de componente para o Board Kanban verificando que os Cards são renderizados na Coluna correta.
5. THE GymFlow SHALL possuir testes de componente para os formulários de criação e edição verificando que as mensagens de validação são exibidas corretamente.
6. IF qualquer teste automatizado falhar no pipeline de CI, THEN o GymFlow SHALL bloquear o merge da branch correspondente.

---

### Requirement 10: Documentação do Projeto

**User Story:** Como desenvolvedor ou avaliador, quero um README completo e bem estruturado, para que eu possa entender, configurar e executar o projeto sem precisar de assistência adicional.

#### Acceptance Criteria

1. THE GymFlow SHALL fornecer um arquivo `README.md` na raiz do repositório contendo: descrição do projeto, stack tecnológica, pré-requisitos, instruções de instalação, execução das Migrations, execução dos testes e instruções de deploy.
2. THE GymFlow SHALL fornecer um arquivo `.env.example` na raiz do repositório listando todas as variáveis de ambiente necessárias com descrições.
3. THE GymFlow SHALL documentar a estrutura de pastas do projeto no README.
4. WHEN um desenvolvedor segue as instruções do README em um ambiente limpo, THE GymFlow SHALL iniciar e funcionar corretamente sem etapas adicionais não documentadas.
