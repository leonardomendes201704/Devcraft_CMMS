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

## Baseline Done

- Repository structure scaffolded.
- Backend/Frontend baseline scaffolds created.
- Docker and CI initial setup created.

## Next

- Migration + seed baseline.
- First auth use-case set.
- Tenant administration APIs.
