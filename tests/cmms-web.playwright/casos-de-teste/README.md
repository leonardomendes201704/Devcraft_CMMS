# Casos de teste Playwright — indice

Suite principal: `tests/cmms-web.playwright/tests/*.spec.ts`.

## Onde ficam as evidencias

| Tipo | Caminho no repositorio | Observacao |
|------|------------------------|------------|
| PNG para o modal Kanban (E2E com task + steps) | `src/frontend/cmms-web/public/evidences/regression/<segmento>/` | Segmentos: `users-admin`, `org-catalog`, etc. URL publica: `/evidences/regression/<segmento>/<arquivo>.png` |
| PNG na raiz (specs antigos / Kanban) | `src/frontend/cmms-web/public/evidences/` | Padrao `task-<guid>-pw-step-...png` |
| Artefatos JSON (regressao API) | `tests/cmms-web.playwright/evidence-output/api/` | Gerados ao rodar `api-regression-users-departments-jobs.spec.ts`; pasta gitignored (ver `.gitignore`) |
| Screenshots de falha / steps Playwright | `tests/cmms-web.playwright/test-results/` | Regenerado a cada execucao |

Apos adicionar PNGs novos em `public/evidences/` com o container `devcraft_cmms_web` rodando, pode ser necessario **reiniciar o container** para o Vite servir o ficheiro (LL-009).

## Documentacao por spec

| Ficheiro | Documentacao |
|----------|----------------|
| `api-regression-users-departments-jobs.spec.ts` | [api-regression-users-departments-jobs.md](api-regression-users-departments-jobs.md) |
| `auth-api.spec.ts` | [auth-api.md](auth-api.md) |
| `home.spec.ts` | [home.md](home.md) |
| `kanban.spec.ts` | [kanban.md](kanban.md) |
| `kanban-card-ux.spec.ts` | [kanban-card-ux.md](kanban-card-ux.md) |
| `kanban-message-banner.spec.ts` | [kanban-message-banner.md](kanban-message-banner.md) |
| `org-catalog-admin.spec.ts` | [org-catalog-admin.md](org-catalog-admin.md) |
| `shell-menu-labels.spec.ts` | [shell-menu-labels.md](shell-menu-labels.md) |
| `tenant-isolation.spec.ts` | [tenant-isolation.md](tenant-isolation.md) |
| `users-admin.spec.ts` | [users-admin.md](users-admin.md) |

## Comando para validar localmente

```bash
cd tests/cmms-web.playwright
npx playwright test
```

Com relatorio HTML:

```bash
npx playwright test --reporter=html
npx playwright show-report
```
