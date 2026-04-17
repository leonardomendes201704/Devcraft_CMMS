# KanbanTaskManager

Ferramenta CLI para gerenciar tasks do Kanban direto no banco (sem API).

## Comandos

```bash
dotnet run --project tools/KanbanTaskManager -- list --tenant <guid>
dotnet run --project tools/KanbanTaskManager -- create --tenant <guid> --title "..." --description "..." --type chore --module Governance --estimate 1.5
dotnet run --project tools/KanbanTaskManager -- set-effort --tenant <guid> --task <task-guid> --spent 2.0
dotnet run --project tools/KanbanTaskManager -- set-status --tenant <guid> --task <task-guid> --status active
dotnet run --project tools/KanbanTaskManager -- close --tenant <guid> --task <task-guid> [--spent 2.5]
```

## Provider

- `--provider auto` (padrao): tenta PostgreSQL e cai para SQLite fallback se indisponivel.
- `--provider postgres`
- `--provider sqlite`

## Observacoes

- Mantem trilha de auditoria (`kanban_task_audit_logs`) para mudanca de status/esforco/fechamento.
- Aplica regra de fluxo para status (`new -> active -> resolved`, `resolved -> active`).
- Fechamento exige status `resolved`.
