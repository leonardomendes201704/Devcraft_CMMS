# Changelog

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
