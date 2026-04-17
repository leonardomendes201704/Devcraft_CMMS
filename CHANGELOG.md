# Changelog

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
