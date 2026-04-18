# Kanban Snapshot

## Current Phase

- Phase 1 - Foundation: In Progress

## Task Register

| Task ID | Request | Current Status | Priority | Notes |
|---|---|---|---|---|
| TASK-REQ-2026-04-17-01 | Implementar backend de tasks Kanban com PostgreSQL multi-tenant e auditoria | closed | high | Entregue e validado com build + smoke + E2E |
| TASK-REQ-2026-04-17-02 | Conectar frontend Kanban aos endpoints e remover persistencia local | closed | high | Entregue e validado com Playwright |
| TASK-REQ-2026-04-17-03 | Validar entrega com backend+frontend rodando e evidencias Playwright | closed | high | Evidencias em `docs/test-evidence/2026-04-17-kanban-validation` |
| TASK-REQ-2026-04-17-04 | Subir tudo para o repositorio GitHub `leonardomendes201704/Devcraft_CMMS` | closed | high | Commit `04acf43` e push em `main` |
| TASK-REQ-2026-04-17-05 | Corrigir disciplina Task First e fluxo de estados no Kanban | closed | high | Fluxo de status validado com bloqueio de fechamento antecipado |
| TASK-REQ-2026-04-17-06 | Configurar ambiente Docker com PostgreSQL e migrar dados do fallback | active | high | Kanban API task: `e7235369-c8e8-42e7-a5b6-85b765205b75` |
| TASK-REQ-2026-04-17-07 | Hardening: exigir apontamento de esforco antes de fechar task | closed | high | Kanban API task: `ccdc0477-4c33-49aa-b04a-ba4dcfefa6e9`, spent final: `1.2h` |
| TASK-REQ-2026-04-17-08 | Diretriz operacional: start local + active e entrega com close + tempo gasto, mantendo app rodando | closed | high | Kanban API task: `03c5c86f-e514-4f70-abea-ce2ecae1f7f2`, start: `2026-04-17 12:01:09 -03:00`, end: `2026-04-17 12:02:16 -03:00`, spent final: `0.1h` |
| TASK-REQ-2026-04-17-09 | Corrigir fuso horario UTC no modal do Kanban (Created/Closed) | closed | high | Kanban API task: `49291097-2fa1-4c19-a176-6bf281362fb9`, start: `2026-04-17 12:07:18 -03:00`, end: `2026-04-17 12:07:20 -03:00`, spent final: `0.4h` |
| TASK-REQ-2026-04-17-10 | Forcar lifecycle completo nas tasks de validacao Playwright | closed | high | Kanban API task: `72a76b1f-7f1f-4a8d-a80b-7ec96158497f`, start: `2026-04-17 12:12:34 -03:00`, end: `2026-04-17 12:13:14 -03:00`, spent final: `0.5h` |
| TASK-REQ-2026-04-17-11 | Exibir horario local no Kanban para eliminar ambiguidade de fuso | closed | high | Kanban API task: `8ab2ce2e-e630-430b-a12e-26a708dcc5a2`, start: `2026-04-17 12:14:31 -03:00`, end: `2026-04-17 12:15:10 -03:00`, spent final: `0.4h` |
| TASK-REQ-2026-04-17-12 | Modal Kanban: remover UTC e exibir apenas horarios locais | closed | high | Kanban API task: `28b73342-2d1d-4e88-8d4f-2b5b3b5c0907`, start: `2026-04-17 12:16:10 -03:00`, end: `2026-04-17 12:16:36 -03:00`, spent final: `0.3h` |
| TASK-REQ-2026-04-17-13 | Kanban: secao de evidencias com lightbox e anexos do Playwright | closed | high | Kanban API task: `94917211-e5d9-4654-9068-a2222ba15450`, start: `2026-04-17 12:18:01 -03:00`, end: `2026-04-17 12:22:58 -03:00`, spent final: `1.1h` |
| TASK-REQ-2026-04-17-14 | Changelog com botao de visualizacao e redundancia em banco | closed | high | Kanban API task: `f891233a-5535-4bea-8340-17127160f115`, start: `2026-04-17 12:25:11 -03:00`, end: `2026-04-17 12:29:11 -03:00`, spent final: `1.2h` |
| TASK-REQ-2026-04-17-15 | Blindagem: changelog nunca defasado em commit/push | closed | high | Kanban API task: `dc73a056-bec9-4193-9a18-c78311af5d47`, start: `2026-04-17 12:32:38 -03:00`, end: `2026-04-17 12:43:58 -03:00`, spent final: `1.3h` |
| TASK-REQ-2026-04-17-16 | Sincronizar changelog historico e ordenar visualizacao recente->antigo | closed | high | Kanban API task: `2fcbc292-5f0e-45db-812c-55b9401b400e`, start: `2026-04-17 12:47:08 -03:00`, end: `2026-04-17 12:49:05 -03:00`, spent final: `0.9h` |
| TASK-REQ-2026-04-17-17 | Encurtar labels do menu e titulos de paginas (remover prefixo "Administracao de") | closed | medium | Kanban API task: `0a6124e6-2353-46a9-99b4-1cc3f1a47c2f`, start: `2026-04-17 20:00:21 -03:00`, end: `2026-04-17 20:00:38 -03:00`, spent final: `0.3h`, evidencias Playwright (3 steps) + regression spec `shell-menu-labels.spec.ts` |
| TASK-REQ-2026-04-17-18 | Criar skill `.cursor/skills/devcraft-task-lifecycle/` para automatizar ciclo de tasks (login/new/start/resolve/close/evidence/show) e corrigir imagens de evidencia nao visiveis no modal | closed | high | Kanban API task: `fee041b7-5ad0-43e9-982a-722cfd5aeb06`, start: `2026-04-17 20:10:55 -03:00`, end: `2026-04-17 20:12:46 -03:00`, spent final: `1.4h`, evidencias: 1 image (modal "Image unavailable" antes do fix) + 1 api (POST /api/tasks response). Workaround Vite public-dir documentado em LL-009. |
| TASK-REQ-2026-04-17-19 | Adotar idioma PT-BR como padrao obrigatorio para tasks Kanban (title/description/module/snippets) | closed | medium | Kanban API task: `beb42807-1b3b-4f89-ada0-64a1e57f8053`, start: `2026-04-17 20:18:10 -03:00`, end: `2026-04-17 20:19:48 -03:00`, spent final: `0.5h`, diretrizes atualizadas em `task-lifecycle-directive.md`, `SKILL.md` e `guidelines/README.md` |
| TASK-REQ-2026-04-17-20 | Corrigir UX do card do Kanban (esconder guid, modal apenas em duplo clique, stopPropagation em spent/status) | closed | high | Kanban API task: `142be898-78e5-4095-bd42-68e7a1a5f729`, start: `2026-04-17 20:20:33 -03:00`, end: `2026-04-17 20:25:25 -03:00`, spent final: `1.1h`, 5 evidencias Playwright + regression spec `kanban-card-ux.spec.ts` |
| TASK-REQ-2026-04-17-21 | Kanban: faixa de mensagens apenas em erro; sem Saving ao editar card | closed | medium | Kanban API task: `bd127c67-26cc-438e-821e-7e164f3e1f90`, start: `2026-04-17 20:29:45 -03:00`, end: `2026-04-17 20:31:40 -03:00`, spent final: `0.5h`, spec opcional `kanban-message-banner.spec.ts` + `data-testid="kanban-notice-banner"` |
| TASK-REQ-2026-04-17-22 | Mensagens de erro legiveis (problem+json + PT-BR, sem JSON bruto no aviso) | closed | medium | Kanban API task: `9cfce373-3492-489e-9b96-f00ca79f05a4`, start: `2026-04-17 20:35:20 -03:00`, end: `2026-04-17 20:35:42 -03:00`, spent final: `0.25h`, evidencia api |
| TASK-REQ-2026-04-18-01 | Fechar tasks duplicadas Playwright do card Kanban (242446cc, db327952) com evidencia retroativa | closed | low | Kanban API: `242446cc-c243-41ec-b7f2-63f4006d9cdb` e `db327952-d10c-4f90-9622-b206ba0c8617`, end: `2026-04-17 21:04 -03:00` / `2026-04-17 21:05 -03:00`, spent `0.1h` cada; duplicam escopo da task `142be898-78e5-4095-bd42-68e7a1a5f729` |

## Transition Log

| Task ID | Transition | Timestamp UTC | Evidence |
|---|---|---|---|
| TASK-REQ-2026-04-17-04 | new -> active | 2026-04-17T14:34:00Z | Solicitacao de push recebida no chat |
| TASK-REQ-2026-04-17-04 | active -> resolved | 2026-04-17T14:36:00Z | Commit criado localmente |
| TASK-REQ-2026-04-17-04 | resolved -> closed | 2026-04-17T14:38:00Z | Push concluido no remoto |
| TASK-REQ-2026-04-17-05 | new -> active | 2026-04-17T14:39:00Z | Solicitacao de ajuste de governanca recebida |
| TASK-REQ-2026-04-17-05 | active -> resolved | 2026-04-17T14:50:00Z | Regras de transicao implementadas no backend/frontend |
| TASK-REQ-2026-04-17-05 | resolved -> closed | 2026-04-17T14:51:00Z | Smoke test comprovou bloqueio de close precoce e fechamento correto |
| TASK-REQ-2026-04-17-06 | new | 2026-04-17T14:50:00Z | Solicitacao recebida para dockerizar ambiente com PostgreSQL e migracao |
| TASK-REQ-2026-04-17-07 | new | 2026-04-17T14:50:00Z | Gap identificado de governanca de effort antes de close |
| TASK-REQ-2026-04-17-07 | new -> active | 2026-04-17T14:57:00Z | Implementacao da regra effort obrigatorio iniciada |
| TASK-REQ-2026-04-17-07 | active -> resolved | 2026-04-17T15:00:00Z | Backend + frontend + CLI atualizados e validados |
| TASK-REQ-2026-04-17-07 | resolved -> closed | 2026-04-17T15:02:00Z | Task API `ccdc...` fechada com spentHours=1.2 |
| TASK-REQ-2026-04-17-06 | new -> active | 2026-04-17T15:03:00Z | Planejamento de docker/postgres mantido em andamento |
| TASK-REQ-2026-04-17-08 | new -> active | 2026-04-17 12:01:09 -03:00 (LOCAL) | Solicitacao recebida e task iniciada com timestamp local conforme diretriz |
| TASK-REQ-2026-04-17-08 | active -> resolved | 2026-04-17 12:02:16 -03:00 (LOCAL) | Diretriz formalizada no repositorio e checklist aplicado |
| TASK-REQ-2026-04-17-08 | resolved -> closed | 2026-04-17 12:02:16 -03:00 (LOCAL) | Task fechada com `spentHours` calculado (`0.1h`) |
| TASK-REQ-2026-04-17-09 | new -> active | 2026-04-17 12:07:18 -03:00 (LOCAL) | Solicitacao de ajuste de timezone recebida e task iniciada |
| TASK-REQ-2026-04-17-09 | active -> resolved | 2026-04-17 12:07:20 -03:00 (LOCAL) | Backend/frontend ajustados para serializacao e parsing UTC corretos |
| TASK-REQ-2026-04-17-09 | resolved -> closed | 2026-04-17 12:07:20 -03:00 (LOCAL) | Task Kanban fechada com `spentHours` final `0.4h` |
| TASK-REQ-2026-04-17-10 | new -> active | 2026-04-17 12:12:34 -03:00 (LOCAL) | Solicitacao recebida para evitar tasks Playwright presas em NEW |
| TASK-REQ-2026-04-17-10 | active -> resolved | 2026-04-17 12:13:14 -03:00 (LOCAL) | Teste Playwright alterado para transicionar e fechar task automaticamente |
| TASK-REQ-2026-04-17-10 | resolved -> closed | 2026-04-17 12:13:14 -03:00 (LOCAL) | Task Kanban fechada com `spentHours` final `0.5h` |
| TASK-REQ-2026-04-17-11 | new -> active | 2026-04-17 12:14:31 -03:00 (LOCAL) | Solicitacao recebida para remover percepcao de fuso +3 nos cards |
| TASK-REQ-2026-04-17-11 | active -> resolved | 2026-04-17 12:15:10 -03:00 (LOCAL) | Modal ajustado para exibir Local (America/Sao_Paulo) e UTC |
| TASK-REQ-2026-04-17-11 | resolved -> closed | 2026-04-17 12:15:10 -03:00 (LOCAL) | Task Kanban fechada com `spentHours` final `0.4h` |
| TASK-REQ-2026-04-17-12 | new -> active | 2026-04-17 12:16:10 -03:00 (LOCAL) | Solicitacao recebida para manter somente horario local no modal |
| TASK-REQ-2026-04-17-12 | active -> resolved | 2026-04-17 12:16:36 -03:00 (LOCAL) | Campos UTC removidos do modal e mantido parsing de horario local |
| TASK-REQ-2026-04-17-12 | resolved -> closed | 2026-04-17 12:16:36 -03:00 (LOCAL) | Task Kanban fechada com `spentHours` final `0.3h` |
| TASK-REQ-2026-04-17-13 | new -> active | 2026-04-17 12:18:01 -03:00 (LOCAL) | Solicitacao recebida para incluir secao de evidencias com lightbox no modal |
| TASK-REQ-2026-04-17-13 | active -> resolved | 2026-04-17 12:22:58 -03:00 (LOCAL) | Backend e frontend atualizados com evidencias e Playwright anexando screenshot |
| TASK-REQ-2026-04-17-13 | resolved -> closed | 2026-04-17 12:22:58 -03:00 (LOCAL) | Task fechada com evidencias validas (imagem servida em `/evidences/...`) |
| TASK-REQ-2026-04-17-14 | new -> active | 2026-04-17 12:25:11 -03:00 (LOCAL) | Solicitacao recebida para criar botao de changelog e redundancia em DB |
| TASK-REQ-2026-04-17-14 | active -> resolved | 2026-04-17 12:29:11 -03:00 (LOCAL) | API e frontend com changelog em banco e modal de visualizacao |
| TASK-REQ-2026-04-17-14 | resolved -> closed | 2026-04-17 12:29:11 -03:00 (LOCAL) | Validado com Playwright e endpoint `/api/changelog` alimentado via `CHANGELOG.md` |
| TASK-REQ-2026-04-17-15 | new -> active | 2026-04-17 12:32:38 -03:00 (LOCAL) | Solicitacao recebida para impedir changelog defasado em commit/push |
| TASK-REQ-2026-04-17-15 | active -> resolved | 2026-04-17 12:43:58 -03:00 (LOCAL) | CI com `changelog-guard` e hook local de bloqueio adicionados |
| TASK-REQ-2026-04-17-15 | resolved -> closed | 2026-04-17 12:43:58 -03:00 (LOCAL) | Validado com build + testes + Playwright e changelog atualizado na mesma entrega |
| TASK-REQ-2026-04-17-16 | new -> active | 2026-04-17 12:47:08 -03:00 (LOCAL) | Solicitacao recebida para sincronizar changelog com historico de commits e ordenar exibicao |
| TASK-REQ-2026-04-17-16 | active -> resolved | 2026-04-17 12:49:05 -03:00 (LOCAL) | CHANGELOG atualizado com commits historicos e ordenacao frontend aplicada |
| TASK-REQ-2026-04-17-16 | resolved -> closed | 2026-04-17 12:49:05 -03:00 (LOCAL) | Validado com build backend/frontend e Playwright |
| TASK-REQ-2026-04-17-17 | new -> active | 2026-04-17 20:00:21 -03:00 (LOCAL) | Solicitacao retroativa para regularizar entrega de menu shortening com task first + evidencias |
| TASK-REQ-2026-04-17-17 | active -> resolved | 2026-04-17 20:00:37 -03:00 (LOCAL) | Playwright spec `shell-menu-labels.spec.ts` executado com 3 step evidences anexadas |
| TASK-REQ-2026-04-17-17 | resolved -> closed | 2026-04-17 20:00:38 -03:00 (LOCAL) | Kanban task closed com `spentHours=0.3`, lead time validado e changelog preflight ok |
| TASK-REQ-2026-04-17-18 | new -> active | 2026-04-17 20:10:55 -03:00 (LOCAL) | Solicitacao do usuario para criar skill de gerenciamento de tasks e corrigir "Image unavailable" em evidencias novas |
| TASK-REQ-2026-04-17-18 | active -> resolved | 2026-04-17 20:12:19 -03:00 (LOCAL) | Skill `.cursor/skills/devcraft-task-lifecycle/` criada (SKILL.md + reference.md + scripts/task.ps1) e validada com ciclo completo; workaround Vite public-dir automatizado no `close` |
| TASK-REQ-2026-04-17-18 | resolved -> closed | 2026-04-17 20:12:46 -03:00 (LOCAL) | Kanban task closed com `spentHours=1.4`, evidencias (1 image + 1 api) servidas corretamente apos auto-restart do web container; LL-009 e LL-010 registrados |
| TASK-REQ-2026-04-17-19 | new -> active | 2026-04-17 20:18:10 -03:00 (LOCAL) | Solicitacao do usuario para tornar PT-BR obrigatorio em toda task registrada |
| TASK-REQ-2026-04-17-19 | active -> resolved | 2026-04-17 20:19:00 -03:00 (LOCAL) | Diretrizes atualizadas (task-lifecycle-directive.md + SKILL.md + guidelines/README.md) com Language Policy |
| TASK-REQ-2026-04-17-19 | resolved -> closed | 2026-04-17 20:19:48 -03:00 (LOCAL) | Kanban task fechada com `spentHours=0.5` apos evidencia de contexto anexada |
| TASK-REQ-2026-04-17-20 | new -> active | 2026-04-17 20:20:33 -03:00 (LOCAL) | Solicitacao do usuario para esconder guid no card e abrir modal apenas em duplo clique (nao nos inputs) |
| TASK-REQ-2026-04-17-20 | active -> resolved | 2026-04-17 20:25:00 -03:00 (LOCAL) | KanbanPage refatorado + Playwright spec `kanban-card-ux.spec.ts` executado com sucesso (1 passed) |
| TASK-REQ-2026-04-17-20 | resolved -> closed | 2026-04-17 20:25:25 -03:00 (LOCAL) | Kanban task fechada com `spentHours=1.1`, 5 evidencias Playwright + auto-restart do web container |
| TASK-REQ-2026-04-17-21 | new -> active | 2026-04-17 20:29:45 -03:00 (LOCAL) | Solicitacao do usuario para ocultar faixa vazia no Kanban e remover feedback Saving nas edicoes do card |
| TASK-REQ-2026-04-17-21 | active -> resolved | 2026-04-17 20:31:00 -03:00 (LOCAL) | KanbanPage ajustado + Playwright `kanban-message-banner.spec.ts` com `KANBAN_UX_TASK_ID` e evidencia Step 01 |
| TASK-REQ-2026-04-17-21 | resolved -> closed | 2026-04-17 20:31:40 -03:00 (LOCAL) | Kanban task fechada com `spentHours=0.5`, auto-restart do web container para PNG novo |
| TASK-REQ-2026-04-17-22 | new -> active | 2026-04-17 20:35:20 -03:00 (LOCAL) | Mensagens tecnicas (JSON) no aviso; corrigir parse problem+json e copia PT-BR |
| TASK-REQ-2026-04-17-22 | active -> resolved | 2026-04-17 20:35:35 -03:00 (LOCAL) | http.ts + mapApiMessageToPtBr + utils; evidencia api anexada |
| TASK-REQ-2026-04-17-22 | resolved -> closed | 2026-04-17 20:35:42 -03:00 (LOCAL) | Kanban task fechada com `spentHours=0.25` |
| TASK-REQ-2026-04-18-01 | new -> active | 2026-04-17 21:03 -03:00 (LOCAL) | Regularizar duplicatas Playwright do card Kanban presas em NEW |
| TASK-REQ-2026-04-18-01 | active -> resolved | 2026-04-17 21:04 -03:00 (LOCAL) | Evidencias imagem retroativas anexadas via task.ps1 |
| TASK-REQ-2026-04-18-01 | resolved -> closed | 2026-04-17 21:05 -03:00 (LOCAL) | Tasks `242446cc...` e `db327952...` fechadas com `spentHours=0.1` cada; PNGs em `public/evidences/` |

## Baseline Done

- Repository structure scaffolded.
- Backend/Frontend baseline scaffolds created.
- Docker and CI initial setup created.

## Next

- Migration + seed baseline.
- First auth use-case set.
- Tenant administration APIs.
