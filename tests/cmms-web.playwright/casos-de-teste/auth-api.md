# API — autenticacao e politicas

**Spec:** `tests/auth-api.spec.ts`

## Casos (resumo)

| # | Caso | Expectativa principal |
|---|------|------------------------|
| 1 | Login master | JWT com `tokenType`, `user.role`, claims `tenant_id`, `role` |
| 2 | Senha errada | 401 |
| 3 | Email inexistente | 401 |
| 4 | Login sem `X-Tenant-Id` | 400, `tenant_resolution_failed` |
| 5 | Anonimo em rota protegida | 401; com token master | 200 |
| 6 | JWT `technician` em `GET /api/tasks` | **403** |
| 7 | Bearer invalido em `GET /api/tasks` | **401** |
| 8 | Master CRUD usuario no tenant | criar, obter, atualizar |

## Evidencias

- Nao gera PNG no `public/` por defeito; pode anexar evidencia API a tasks Kanban em fluxos manuais.
