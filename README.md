# Devcraft CMMS

CMMS SaaS multi-tenant foundation built as a modular monolith.

## Stack

- Backend: .NET 8, ASP.NET Core, EF Core, PostgreSQL, JWT, MediatR, FluentValidation, Serilog
- Frontend: React + TypeScript + Vite, React Router, TanStack Query, i18next, Tailwind CSS
- Tests: xUnit (backend) + Playwright (frontend E2E)

## Repository Structure

```text
/src
  /backend
  /frontend
/tests
/docs
/guidelines
/management
/tools
/skills
```

## Quick Start (Local)

1. Start infra:

```bash
docker compose up -d db
```

2. Run API:

```bash
dotnet run --project src/backend/CMMS.Api
```

3. Run web:

```bash
cd src/frontend/cmms-web
npm install
npm run dev
```

4. Open:
- API Swagger: `http://localhost:8080/swagger`
- API Health: `http://localhost:8080/health`
- Web: `http://localhost:5173`

## Tenant Header

For tenant-protected endpoints, send header:

- `X-Tenant-Id: <guid>`

## Current Phase

- Phase 1 (Foundation): in progress

## Next Milestones

- Seed + first migrations
- Auth use cases (login/refresh)
- Tenant management module
- Asset module base
