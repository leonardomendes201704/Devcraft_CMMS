# Changelog

## [0.1.32-kanban-closed-sort-updated] - 2026-04-17

### Changed
- `KanbanTaskResponse` / cliente: expoe `updatedAtUtc` (ja persistido em `AuditableTenantEntity`).
- `KanbanPage`: na coluna **Closed**, cards ordenados por **ultima atualizacao** descendente (`updatedAtUtc`), com fallback para `closedAtUtc` e depois `createdAtUtc`.

## [0.1.31-tenant-isolation-regression] - 2026-04-17

### Added
- `tests/cmms-web.playwright/tests/tenant-isolation.spec.ts`: regressao de **isolamento multi-tenant** — login bootstrap do master em dois `X-Tenant-Id` distintos, criacao de Kanban task em cada um e verificacao de que `GET /api/tasks` nao devolve o `id` da task do outro tenant quando token e header permanecem no mesmo tenant.

Kanban task: `c69e2349-8636-4b35-bdff-44d9406db65e` (`[TASK] Isolation regression tests across tenants`), start: `2026-04-17 21:54:33 -03:00`, end: `2026-04-17 21:55:10 -03:00`, spent final: `0.5h`, evidencia api (Playwright 1 passed).

## [0.1.30-auth-api-allow-deny] - 2026-04-17

### Added
- `tests/cmms-web.playwright/tests/auth-api.spec.ts`: cenarios de integracao allow/deny — usuario `technician` com JWT valido recebe **403** em `GET /api/tasks` (policy `AdminMasterOnly`); `Authorization: Bearer` com token invalido recebe **401**.

Kanban task: `7b27e5d5-407f-4472-a272-caaebea62905` (`[TASK] Integration tests for allow and deny scenarios`), start: `2026-04-17 21:36:23 -03:00`, end: `2026-04-17 21:37:00 -03:00`, spent final: `0.5h`, evidencia api (resumo Playwright 8 testes passando).

## [0.1.29-master-admin-bootstrap-retro-close] - 2026-04-17

### Changed
- Governanca Kanban: task `bfbfd387-96ba-41cd-97de-8cf1932a7bcc` fechada retroativamente; implementacao ja existente (`AuthController` bootstrap no login, `Auth:MasterAdmin*` em appsettings, `CredentialPolicy`, lockout).

Kanban task: `bfbfd387-96ba-41cd-97de-8cf1932a7bcc` (`[TASK] Master admin bootstrap seed and safeguards`), start: `2026-04-17 21:35:11 -03:00`, end: `2026-04-17 21:35:11 -03:00`, spent final: `0.25h`, evidencia api.

## [0.1.28-auth-api-baseline] - 2026-04-17

### Added
- `tests/cmms-web.playwright/tests/auth-api.spec.ts`: cenarios negativos de login — senha incorreta para master, email inexistente, e `POST /api/auth/login` sem `X-Tenant-Id` (middleware `tenant_resolution_failed`).

Kanban task: `4bad7f7f-73af-4771-9aaf-55109d8f3388` (`[TASK] Auth baseline tests and validation checks`), start: `2026-04-17 21:25:02 -03:00`, end: `2026-04-17 21:25:23 -03:00`, spent final: `0.5h`, evidencia api (resumo spec + 6 testes passando).

## [0.1.27-playwright-orphan-tasks-batch] - 2026-04-18

### Added
- Sete evidencias em `public/evidences/` para fechamento retroativo de tasks Kanban criadas por fluxos Playwright e presas em `new` (Validacao E2E Kanban + Playwright user admin / kanban step evidence).

Tasks: `24f8641a-f52d-4ee2-9070-26bd165a1242`, `5650c16e-c6aa-497a-8ed7-3349b1ecf342`, `450f0bf0-4bca-4547-ad87-f7e133449e0c`, `2f01bcff-e8dc-4351-8878-a9b357ce7338`, `5f5931d4-bb35-4ff6-9bd8-eb17bed9a7de`, `8dce3271-c007-4eb5-8f0b-2e71d6c50cf1`, `52c16936-48ce-43a8-88e3-da9ee6040a06`; spent final `0.1h` cada.

## [0.1.26-playwright-kanban-e2e-task-cleanup] - 2026-04-18

### Added
- Evidencia em `public/evidences/` para fechamento retroativo da task Playwright orfa `0be09501-1afc-476d-b822-d6e18dd80586` (`Validacao E2E Kanban`), criada pelo fluxo de teste e sem lifecycle.

Kanban task: `0be09501-1afc-476d-b822-d6e18dd80586`, end: `2026-04-17 21:18 -03:00`, spent final: `0.1h`, 1 evidencia imagem.

## [0.1.25-kanban-card-ux-retro-close] - 2026-04-18

### Added
- Evidencias em `public/evidences/` para fechamento retroativo de duas tasks Kanban duplicadas do fluxo Playwright (`kanban-card-ux.spec.ts`), alinhadas a entrega principal `142be898-78e5-4095-bd42-68e7a1a5f729`.

Kanban tasks: `242446cc-c243-41ec-b7f2-63f4006d9cdb` e `db327952-d10c-4f90-9622-b206ba0c8617` (`[BUG] Card Kanban UX`), end: `2026-04-17 21:04 -03:00` / `2026-04-17 21:05 -03:00`, spent final: `0.1h` cada, 1 evidencia imagem cada (retroativo regressao card Kanban).

## [0.1.24-api-error-user-facing] - 2026-04-17

### Changed
- `shared/api/http.ts`: leitura do corpo de erro como texto e parse JSON quando o payload comeca com `{`, cobrindo `application/problem+json` (antes o cliente mostrava o JSON inteiro porque so tratava `application/json`).
- `shared/api/mapApiMessageToPtBr.ts`: mapa de mensagens conhecidas do backend (tasks, departments, jobs, usuarios) para PT-BR; regex para transicoes de status bloqueadas.
- `features/users/utils.ts`: `extractErrorMessage` passa mensagens pelo mapa PT-BR.
- `KanbanPage`: mensagem de falha ao carregar lista em portugues; removido `extractErrorMessage` duplicado (usa `users/utils`).

Kanban task: `9cfce373-3492-489e-9b96-f00ca79f05a4` (`[CHG] Mensagens de erro legiveis no aviso (PT-BR, sem corpo bruto)`), start: `2026-04-17 20:35:20 -03:00`, end: `2026-04-17 20:35:42 -03:00`, spent final: `0.25h`, evidencia api (payload do tratamento de erro).

## [0.1.23-kanban-notice-banner] - 2026-04-17

### Changed
- KanbanPage: faixa abaixo do header (`data-testid="kanban-notice-banner"`) so aparece quando ha erro de carregamento da lista ou `saveError`, no estilo da lista de usuarios (sem area vazia fixa).
- KanbanPage: removidos textos `Loading tasks from API...` e `Saving changes...` na faixa; edicoes no card e criacao de task ficam silenciosas em caso de sucesso.

### Added
- Playwright opcional `tests/cmms-web.playwright/tests/kanban-message-banner.spec.ts`: valida ausencia da faixa em estado normal e apos blur no spent; defina `KANBAN_UX_TASK_ID` para anexar evidencia a uma task existente.

Kanban task: `bd127c67-26cc-438e-821e-7e164f3e1f90` (`[UX] Faixa de mensagens do Kanban apenas em erro; sem Saving ao editar card`), start: `2026-04-17 20:29:45 -03:00`, end: `2026-04-17 20:31:40 -03:00`, spent final: `0.5h`, 1 evidencia Playwright.

## [0.1.22-kanban-card-ux] - 2026-04-17

### Changed
- KanbanPage: removido o guid (`task.id`) exibido no topo do card; identificacao agora aparece apenas dentro do modal de detalhes.
- KanbanPage: abertura do modal de detalhes migrada de `onClick` para `onDoubleClick` no card. Suporte de teclado preservado via `tabIndex`/`onKeyDown` (Enter ou Space).
- KanbanPage: cliques em `input type=number` (spent hours) e `select` (status) no card agora fazem `stopPropagation` de `click`/`doubleClick`/`mousedown`, impedindo que abram o modal indevidamente. Atributos `draggable=false` nesses controles para nao interferir no drag do card.
- KanbanPage: trocado `role="button"` por `role="article"` no card com `data-testid="kanban-card"` e `data-task-id`, evitando colisao com locators `getByRole('button', ...)` do Playwright.

### Added
- Novo Playwright regression spec: `tests/cmms-web.playwright/tests/kanban-card-ux.spec.ts` validando (1) guid oculto no card, (2) clique simples + cliques em spent/status nao abrem o modal, (3) duplo clique abre o modal. Ancora o locator via `data-testid="kanban-card"`.

### Fixed
- `tests/cmms-web.playwright/tests/kanban.spec.ts`: trocado `.click()` por `.dblclick()` no passo que abre o modal de detalhes da task recem-criada, alinhando com o novo comportamento.

Kanban task: `142be898-78e5-4095-bd42-68e7a1a5f729` (`[BUG] Cards do Kanban abrem modal ao clicar em inputs de status/spent`), start: `2026-04-17 20:20:33 -03:00`, end: `2026-04-17 20:25:25 -03:00`, spent final: `1.1h`, 5 evidencias Playwright anexadas.

## [0.1.21-language-policy-pt-br] - 2026-04-17

### Added
- Adicionada secao "Language Policy" em `guidelines/workflows/task-lifecycle-directive.md` tornando PT-BR obrigatorio para titulo, descricao, modulo e evidencias de toda task Kanban, assim como para as linhas correspondentes em `management/kanban/board.md` e bullets em `CHANGELOG.md`. Identificadores de codigo e termos tecnicos sem traducao natural permanecem em ingles.
- Adicionada secao "Language policy" em `.cursor/skills/devcraft-task-lifecycle/SKILL.md` com exemplos bons/ruins para reforcar PT-BR em toda invocacao da skill.
- Adicionada secao "Language Policy" em `guidelines/README.md` unificando a regra para guidelines, tasks, comentarios e commits.

Kanban task: `beb42807-1b3b-4f89-ada0-64a1e57f8053` (`[TASK] Adotar idioma PT-BR como padrao obrigatorio para tasks`).

## [0.1.20-task-lifecycle-skill] - 2026-04-17

### Added
- Added project-scoped Cursor skill `.cursor/skills/devcraft-task-lifecycle/` to automate the mandatory Kanban task lifecycle (new -> active -> resolved -> closed). PowerShell entry point `scripts/task.ps1` with subcommands `login`, `new`, `start`, `resolve`, `close`, `evidence`, `show`. Enforces evidence naming convention, posts image + api evidences via `/api/tasks/:id/evidences`, and auto-restarts `devcraft_cmms_web` on close when image evidences were added (workaround for Vite public-dir scan issue). Reference payload schemas in `reference.md`.
- Kanban task: `fee041b7-5ad0-43e9-982a-722cfd5aeb06`, start: `2026-04-17 20:10:55 -03:00`, end: `2026-04-17 20:12:46 -03:00`, spent final: `1.4h`. Evidences: image (`task-fee041b7-...-pw-step-01-...png`) and api (POST /api/tasks response).

### Changed
- Updated `guidelines/commands/README.md` to require task automation via `& .cursor/skills/devcraft-task-lifecycle/scripts/task.ps1` (never `powershell -File`).
- Updated `guidelines/lessons-learned/known-issues.md` with the Vite public-dir scan issue and the `powershell -File` JSON mangling issue.
- Documented `LL-009` (Vite public-dir discovery) and `LL-010` (PowerShell `-File` JSON argument mangling) in `guidelines/lessons-learned/lessons-learned.md`.

## [0.1.19-users-list-ui-kit-componentization] - 2026-04-17

### Added
- Added reusable list UI kit under `shared/ui/list`:
  - `ListSection`
  - `ListToolbar`
  - `DataGrid`
  - `ListPagination`
  - `SortIcon`
- Added generic list state hook `useListState<TSortKey, TFilters>` under `shared/hooks` for search/filter/sort/pagination state.

### Changed
- Shortened shell sidebar menu labels and page headers (removed “Administracao de …” / “… administration” prefixes in i18n + `UsersListPage`, `DepartmentsListPage`, `JobsListPage` titles). Kanban task: `0a6124e6-2353-46a9-99b4-1cc3f1a47c2f`, start: `2026-04-17 20:00:21 -03:00`, end: `2026-04-17 20:00:38 -03:00`, spent final: `0.3h`. Playwright regression spec: `tests/cmms-web.playwright/tests/shell-menu-labels.spec.ts`.
- Refactored Users Administration list page to consume shared list kit components.
- Replaced page-local sort icon implementations with shared `SortIcon`.
- Reduced `UsersListPage` coupling by keeping only domain-specific filter/sort/render rules.

## [0.1.18-users-profile-entity-audit-hardening] - 2026-04-17

### Added
- Added rich user profile domain and persistence model:
  - `AuthUserProfile` entity with enterprise fields (full name, phones, job title, department, employee code, locale/timezone, emergency contact, dates, metadata JSON).
  - `AuthUserAuditLog` entity for user management audit trail (`user_created`, `user_updated`, `password_reset`).
- Added `AuthUser` security fields:
  - `LastLoginAtUtc`
  - `AccessFailedCount`
  - `LockoutEndUtc`
- Added API support for enriched profile payload/response in users endpoints (`list/get/create/update`).

### Changed
- Hardened auth login flow with lockout policy and failed-attempt tracking (5 failures -> 15-minute lockout).
- Updated users UI flow (List/Create/Edit/View) to handle full profile model end-to-end.
- Expanded users list search to include profile attributes (name/job/department/employee code/phone).
- Updated users summary view with profile and last-login details.
- Fixed auth schema bootstrap SQL formatting for EF raw SQL (`MetadataJson` default brace escaping), preventing startup failure in test webserver bootstrap.
- Updated Playwright suites to match enriched user contract:
  - `users-admin.spec.ts` now fills required full name.
  - `auth-api.spec.ts` now sends required `profile` payload for user creation.

## [0.1.17-governance-changelog-preflight] - 2026-04-17

### Added
- Added changelog preflight mode in governance checker:
  - `scripts/check-changelog.sh --working-tree`
  - validates impactful files against `CHANGELOG.md` before commit attempt.

### Changed
- Updated governance and lessons artifacts to enforce changelog-first sequence:
  - `AGENT.md`
  - `guidelines/lessons-learned/lessons-learned.md`
  - `guidelines/lessons-learned/command-decisions.md`

## [0.1.16-users-edit-remove-view-button] - 2026-04-17

### Changed
- Removed `View user` button from the user edit page actions.
- Kept only `Back to list` action to simplify the edit screen.

## [0.1.15-users-list-search-filter-pagination] - 2026-04-17

### Added
- Added contextual search in users list (`email` and `id`).
- Added list filters for role and active status.
- Added client-side pagination controls with page size selector and previous/next navigation.

### Changed
- Updated users Playwright assertion to validate role persistence in edit form after removing inline summary block.

## [0.1.14-users-crud-split-routes] - 2026-04-17

### Added
- Added dedicated User Administration routes/pages:
  - `/app/admin/users` (List)
  - `/app/admin/users/create` (Create)
  - `/app/admin/users/:userId` (View)
  - `/app/admin/users/:userId/edit` (Edit)
- Added reusable users UI components:
  - `UsersPageHeader`
  - `UserForm`
  - `UserSummaryCard`
- Added backend endpoint `GET /api/auth/users/{id}` to support dedicated View/Edit screens.

### Changed
- Replaced previous inline all-in-one users screen with route-based CRUD flow.
- Updated frontend users API client with `getAuthUserById`.
- Updated Playwright user-admin E2E to validate split-screen flow with 8 evidence steps.

## [0.1.13-app-shell-foundation] - 2026-04-17

### Added
- Added authenticated application shell with shared layout primitives:
  - responsive sidebar menu
  - sticky topbar
  - shared content container
  - footer
- Added guarded app route space under `/app/*` with dedicated pages:
  - `/app/home`
  - `/app/kanban`
  - `/app/admin/users`
  - `/app/denied`
- Added role-based route gate for User Administration (`admin_master`).
- Added dedicated access-denied page for unauthorized module navigation.

### Changed
- Login now redirects to `/app/home` instead of direct Kanban landing.
- Moved main shell/navigation labels to i18n resources (`pt-BR`, `en-US`) to reduce hardcoded UI text.
- Updated Kanban and Users Admin views to operate inside the shared shell container.
- Updated Playwright E2E flows to validate shell-based navigation (`home -> modules`) while preserving step evidence conventions.

## [0.1.12-lightbox-portrait-centering] - 2026-04-17

### Changed
- Fixed lightbox alignment for tall portrait evidences by centering the figure container and image block.
- Portrait screenshots now stay visually centered in the overlay while preserving previous/next navigation controls.

## [0.1.11-evidence-order-lightbox-navigation] - 2026-04-17

### Changed
- Kanban task modal now displays evidence cards in ascending step order (`Step 01`, `Step 02`, ...).
- Added lightbox navigation controls for image evidences:
  - previous/next buttons
  - keyboard support (`ArrowLeft`, `ArrowRight`, `Escape`)
- Added image sequence indicator in lightbox caption (`current/total`).

## [0.1.10-jwt-contract-and-api-smoke] - 2026-04-17

### Added
- Added explicit JWT settings model (`JwtSettings`) with configurable token lifetime and clock skew.
- Added Playwright API smoke test suite for auth/token contract and policy enforcement:
  - login JWT contract (claims, issuer/audience, TTL)
  - protected endpoint access control (401 anonymous, success for admin_master)

### Changed
- Hardened JWT setup in API startup with minimum key-length validation (32+ chars).
- Centralized token validation configuration (issuer/audience/signing key/clock skew/claim mapping).
- Expanded login token claims to include `jti` and `nameidentifier`, while preserving role and tenant claims.
- Applied fallback authorization policy (`AdminMasterOnly`) to API endpoints and explicitly allowed anonymous health endpoint.

## [0.1.9-auth-policy-hardening] - 2026-04-17

### Added
- Added auth domain baseline entities and policy primitives:
  - `AuthUser` domain entity (`auth_users` table with tenant isolation and unique tenant+email)
  - `AuthRoles` constants and allowed role set
  - `AuthorizationPolicies` constants
  - `CredentialPolicy` password validation rules
- Added startup schema bootstrap for `auth_users` in database environments.

### Changed
- Enforced `AdminMasterOnly` authorization policy on protected controllers (`tasks`, `bootstrap`, `changelog`).
- Updated login controller to emit role claims using centralized auth role constants.
- Added master admin password policy validation guard during login.

## [0.1.8-playwright-step-evidence] - 2026-04-17

### Added
- Added shared Playwright evidence helper to capture and attach step-by-step screenshots to Kanban tasks.
- Added standardized step evidence naming for title and file path:
  - `Step NN - <step name>`
  - `task-<taskId>-pw-step-<NN>-<slug>-<timestamp>.png`

### Changed
- Refactored frontend E2E specs to use 6-8 evidence steps per flow instead of single-screenshot evidence.
- Frontend E2E tests now close their own evidence tasks after status lifecycle updates and effort assignment.
- Kept API-only validation test on JSON evidence flow without screenshot requirements.

## [0.1.7-modal-scroll] - 2026-04-17

### Changed
- Added vertical scrolling support to the Kanban task details modal when content exceeds viewport height.
- Updated modal overlay layout to anchor from top with internal scroll, preventing clipped content on smaller screens or long evidence sections.

## [0.1.6-evidence-legacy-fallback] - 2026-04-17

### Changed
- Fixed Kanban evidence rendering for legacy records where evidence `kind` is missing or inconsistent.
- Frontend now infers API evidence when `payloadJson` is present, even if `kind` is not `api`.
- Prevented broken image rendering for evidence entries with empty/invalid image URLs by showing an explicit unavailable fallback state.

## [0.1.5-evidence-gate] - 2026-04-17

### Added
- Added support for task evidence kind `api` with JSON payload storage and response mapping in Kanban task API.
- Added Playwright scenario validating that frontend/API tasks cannot be closed without required evidences.
- Added fallback placeholder evidence asset for UI/API smoke and test flows.

### Changed
- Enforced close gate on `/api/tasks/{id}/complete`:
  - frontend-related flows now require at least one image evidence;
  - API-related flows now require at least one JSON payload/response evidence.
- Improved evidence modal rendering to support both image and API evidences with JSON preview/details.
- Improved frontend API error parsing so validation messages from backend are shown clearly in Kanban.
- Hardened evidence image URL resolution and graceful fallback when an image cannot be loaded.

## [0.1.4-auth-login] - 2026-04-17

### Added
- Added backend login endpoint `POST /api/auth/login` with JWT token issuance for the master admin account.
- Added frontend login page and auth session helpers to persist access token and route authenticated users to Kanban.
- Added auth API client and bearer token propagation in shared HTTP layer.

### Changed
- Protected task, changelog, and bootstrap API controllers with authorization.
- Added logout action and auth-aware route guards in frontend router.
- Updated Playwright tests to validate authenticated flow and login UI.
- Registered bootstrap master admin credentials in API appsettings for local startup:
  - `admin@cmms.local`
  - `Naotemsenha0(`

## [0.1.3-docker-ports] - 2026-04-17

### Changed
- Reconfigured Docker and local development ports to non-default values to avoid conflicts with other running applications.
- API host port changed to `8117` and web port changed to `5487` in local and production compose files.
- Frontend Vite defaults and Playwright runtime configuration now target the new API/Web ports.
- Updated docs and API HTTP sample to reflect the new port map.

## [0.1.2-sync] - 2026-04-17

### Changed
- Synchronized `CHANGELOG.md` with the full commit history already present in the repository.
- Frontend changelog modal now enforces explicit sorting from newest to oldest.

### Synced Commits
- `fb92a84` - `chore(governance): bloquear commit/push sem changelog atualizado`
- `6548cc5` - `feat(changelog): exibir changelog no modal com redundancia em DB`
- `8687ebb` - `feat(kanban): adicionar evidencias no modal com lightbox`
- `ac33414` - `ui(kanban): mostrar apenas horarios locais no modal`
- `e7b4079` - `fix(kanban): exibir horario local e UTC no modal`
- `90efc81` - `test(kanban): encerrar tasks Playwright com lifecycle completo`
- `76988fc` - `fix(kanban): corrigir timezone UTC no modal e API`
- `30f6db6` - `docs: enforce local-time task lifecycle directive and tracking`
- `8d51931` - `feat: enforce spent-hours before closing tasks across api ui and cli`
- `417a410` - `feat: add direct db kanban task manager cli and effort corrections`
- `1f4e2b5` - `fix: persist dev fallback storage and restore kanban tasks`
- `f14b463` - `fix: enforce kanban workflow transitions and task-first board tracking`
- `04acf43` - `chore: bootstrap cmms foundation with kanban tasks backend and e2e evidence`

## [0.1.1-governance] - 2026-04-17

### Added
- CI guard `changelog-guard` to block push/PR when impactful changes are committed without `CHANGELOG.md` updates.
- Repository policy script `scripts/check-changelog.sh` for CI and local staged validation.
- Local pre-commit hook (`.githooks/pre-commit`) plus setup helper (`scripts/install-git-hooks.ps1`) to stop defasado commits before push.

### Changed
- Governance documentation now explicitly requires changelog parity with commit/push lifecycle.

## [0.1.0-foundation] - 2026-04-17

### Added
- Base repository structure for source, tests, docs, guidelines, management, tools, and skills.
- Backend modular layers (`CMMS.Api`, `CMMS.Application`, `CMMS.Domain`, `CMMS.Infrastructure`, `CMMS.Shared`).
- Frontend shell with React + TypeScript + Vite + Router + TanStack Query + i18n + Tailwind.
- Docker setup for local dev (`db`, `api`, `web`) and production compose baseline.
- Initial CI workflow for backend and frontend.
- Initial lessons learned and guideline artifacts.
- `AGENT.md` with contributor/agent operating rules.
