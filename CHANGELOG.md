# Changelog

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
