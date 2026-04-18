# E2E — Kanban

**Spec:** `tests/kanban.spec.ts`

## Casos

1. **kanban renders and creates task** — Kanban carrega, fluxo de criacao/transicao de task (depende de dados/API).
2. **cannot close frontend/api task without required evidences** — fechamento bloqueado sem evidencias obrigatorias (regras `TasksController`).

## Evidencias

- Podem gerar PNG em `public/evidences/` quando o fluxo Playwright anexa evidencias a tasks.
