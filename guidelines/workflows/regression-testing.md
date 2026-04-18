# Regressao: testes Playwright e evidencias

## Premissa

Toda entrega que altera **usuarios**, **departamentos**, **cargos** ou fluxos administrativos relacionados deve manter **verde** os specs de regressao em `tests/cmms-web.playwright/tests/`. Quebrar esses testes no `main` e equivalente a regressao nao aceita.

## Suites por camada

| Area | Arquivo | Cobertura |
|------|---------|-----------|
| API | `api-regression-users-departments-jobs.spec.ts` | `GET/POST/PATCH` em `/api/auth/departments`, `/api/auth/jobs`, `/api/auth/users`; conflitos 409 em codigo duplicado |
| E2E usuarios | `users-admin.spec.ts` | Login, lista, criar usuario, editar papel, reset de senha; evidencias em `public/evidences/regression/users-admin/` |
| E2E catalogo | `org-catalog-admin.spec.ts` | Departamentos e cargos (criar, editar), associacao ao perfil do usuario; evidencias em `public/evidences/regression/org-catalog/` |

Testes complementares (`auth-api.spec.ts`, `tenant-isolation.spec.ts`, etc.) continuam obrigatorios conforme escopo.

## Estrutura de evidencias

1. **Screenshots no Kanban (E2E)**  
   - Helper: `tests/cmms-web.playwright/tests/support/evidence.ts` (`captureAndAttachStepEvidence`).  
   - Com `segment: 'nome-da-suite'`, os PNGs vao para `src/frontend/cmms-web/public/evidences/regression/<nome-da-suite>/` e a URL na task e `/evidences/regression/<nome-da-suite>/<arquivo>.png`.  
   - Apos adicionar PNGs novos com o stack Docker/Vite rodando, pode ser necessario reiniciar o container `devcraft_cmms_web` (LL-009).

2. **Artefatos de API (JSON)**  
   - Gerados em `tests/cmms-web.playwright/evidence-output/api/` via `writeApiRegressionArtifact`.  
   - Pasta **gitignored** (artefatos locais/CI); serve para inspecao manual e depuracao, nao para o modal do Kanban.

## Casos em Markdown

Descricao dos casos e pastas de evidencias: `tests/cmms-web.playwright/casos-de-teste/README.md` (um `.md` por spec).

## Como rodar

Na raiz do frontend de testes:

```bash
cd tests/cmms-web.playwright
npx playwright test api-regression-users-departments-jobs.spec.ts users-admin.spec.ts org-catalog-admin.spec.ts
```

Requer API em `http://localhost:8117` e web em `http://localhost:5487` (ver `playwright.config.ts`).

## Diretriz para novas features

Ao implementar mudancas em rotas `/api/auth/*` ou telas admin correspondentes:

1. Atualizar ou criar assercoes nos specs acima **no mesmo PR**, sempre que possivel.  
2. Preferir **um segmento de evidencia** por suite (`users-admin`, `org-catalog`, etc.) para manter pastas legiveis.  
3. Nao remover testes sem substituicao equivalente ou acordo explicito de risco.
