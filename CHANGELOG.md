# Changelog

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
