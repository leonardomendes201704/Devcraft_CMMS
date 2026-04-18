# API — isolamento multi-tenant (Kanban tasks)

**Spec:** `tests/tenant-isolation.spec.ts`

## Caso

- Login master em tenant `11111111-1111-1111-1111-111111111111` e em `22222222-2222-2222-2222-222222222222`.
- Criar uma task Kanban em cada tenant.
- `GET /api/tasks` com token+header do tenant A nao inclui id da task do B, e vice-versa.
- No `finally`: `DELETE /api/tasks/{id}` em ambos (204 se API atual); cleanup nao falha o teste se rota antiga.

## Evidencias

- Nao gera PNG em `public/` por defeito.
