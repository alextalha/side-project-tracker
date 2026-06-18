# Side Project Tracker

Um rastreador simples de _side projects_: você cadastra a ideia de um projeto e vai
adicionando tarefas a ele. Tudo em **Next.js puro**, com a **API dentro do próprio Next**,
**sem banco de dados** — os dados ficam **em memória** no servidor.

Interface em **português (pt-BR)** com [shadcn/ui](https://ui.shadcn.com), **dark mode** como
padrão.

## Funcionalidades

- **Projetos**: criar, listar, **editar** (nome/descrição) e excluir.
- **Tarefas** (por projeto): criar, listar, **editar** o título, marcar/desmarcar como
  concluída e excluir.
- Contador de tarefas por projeto e progresso (`X de Y tarefas concluídas`).
- Dark mode padrão, com toggle (sol/lua) — a preferência fica salva no navegador.
- CRUD completo via rotas de API internas do Next.

## Stack

| Camada      | Tecnologia                                  |
| ----------- | ------------------------------------------- |
| Framework   | Next.js 16 (App Router) + React 19          |
| UI          | shadcn/ui (base-ui) + Tailwind CSS 4        |
| Ícones      | lucide-react                                |
| Testes      | Vitest                                      |
| Gerenciador | pnpm (com `minimum-release-age` de 7 dias)  |

## Pré-requisitos

- Node.js 20+
- [pnpm](https://pnpm.io) 10+

## Como rodar

```bash
pnpm install
pnpm dev
```

Abra **http://localhost:3000**.

> Se você abrir pela rede (ex.: `http://192.168.0.2:3000`), o IP precisa estar liberado em
> `allowedDevOrigins` no `next.config.ts` para o hot-reload (HMR) funcionar.

## Scripts

| Script           | O que faz                                  |
| ---------------- | ------------------------------------------ |
| `pnpm dev`       | Sobe o servidor de desenvolvimento         |
| `pnpm build`     | Build de produção                          |
| `pnpm start`     | Sobe o build de produção                   |
| `pnpm lint`      | Roda o ESLint                              |
| `pnpm test`      | Roda os testes (Vitest)                    |
| `pnpm test:watch`| Roda os testes em modo watch               |

## Estrutura

```
app/
├─ api/projetos/
│  ├─ route.ts                         # GET (listar) · POST (criar)
│  └─ [id]/
│     ├─ route.ts                      # PATCH (editar) · DELETE
│     └─ tarefas/
│        ├─ route.ts                   # GET (listar) · POST (criar)
│        └─ [taskId]/route.ts          # PATCH (toggle/editar) · DELETE
├─ page.tsx                            # Lista de projetos
└─ projetos/[id]/page.tsx              # Detalhe do projeto + tarefas
components/                            # Componentes (UI shadcn + customizados)
lib/store.ts                          # Store in-memory (CRUD)
```

## API

Base: `/api/projetos`

| Método & rota                                  | Descrição                          | Corpo                       |
| ---------------------------------------------- | ---------------------------------- | --------------------------- |
| `GET    /api/projetos`                         | Lista projetos (com `taskCount`)   | —                           |
| `POST   /api/projetos`                         | Cria projeto                       | `{ name, description? }`    |
| `PATCH  /api/projetos/:id`                     | Edita projeto                      | `{ name, description? }`    |
| `DELETE /api/projetos/:id`                     | Exclui projeto (e suas tarefas)    | —                           |
| `GET    /api/projetos/:id/tarefas`             | Lista tarefas do projeto           | —                           |
| `POST   /api/projetos/:id/tarefas`             | Cria tarefa                        | `{ title }`                 |
| `PATCH  /api/projetos/:id/tarefas/:taskId`     | Sem corpo: alterna `done`. Com `{ title }`: edita o título | `{ title }?` |
| `DELETE /api/projetos/:id/tarefas/:taskId`     | Exclui tarefa                      | —                           |

Validações retornam `400` (campo obrigatório vazio) e `404` (projeto/tarefa inexistente).

### Modelo de dados

```ts
interface Project { id: string; name: string; description: string; createdAt: string }
interface Task    { id: string; projectId: string; title: string; done: boolean; createdAt: string }
```

## Persistência

Os dados vivem **em memória no servidor** (`Map` ancorado em `globalThis`, para serem
compartilhados entre as rotas de API e os Server Components). Eles **persistem durante a
sessão do servidor e sobrevivem ao hot-reload**, mas **são perdidos quando o servidor é
totalmente reiniciado** — é um tracker propositalmente _in-memory_, sem banco de dados.

## Testes

```bash
pnpm test            # roda a suíte
pnpm test:watch      # modo watch
pnpm test:coverage   # com relatório de cobertura (+ thresholds)
```

Os testes unitários (Vitest) cobrem as rotas de API e a lógica do store: CRUD de projetos e
tarefas, validações (`400`/`404`), `toggle` vs. edição de título, cascade no delete, corpo
JSON inválido/ausente e isolamento entre projetos. Veja a pasta `tests/`.

A cada push/PR, o workflow em `.github/workflows/ci.yml` roda `pnpm install` + `pnpm test:coverage`.
