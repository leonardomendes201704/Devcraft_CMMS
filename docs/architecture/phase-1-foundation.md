# Foundation Architecture (Phase 1)

## Scope

This document defines the implementation baseline of phase 1.

## Backend Baseline

- Layered modular monolith layout.
- API with Swagger, JWT validation setup, Serilog request logging, tenant middleware.
- Infrastructure with EF Core DbContext and PostgreSQL provider.
- Domain with tenant-aware base entity and first sample aggregate (`WorkOrder`).

## Frontend Baseline

- React + TypeScript shell using Vite.
- Routing foundation with `createBrowserRouter`.
- TanStack Query provider.
- Runtime i18n with `pt-BR` and `en-US`.
- Tailwind styling pipeline.

## Multi-Tenant Baseline

- `X-Tenant-Id` header required for tenant-scoped API endpoints.
- Resolved tenant context injected via `ICurrentTenant`.
- Global query filter in DbContext for sample entity.

## Next Technical Steps

1. Add migrations and initial seed.
2. Implement auth use-cases (login/refresh/recovery).
3. Expand tenant administration module.
4. Introduce first business workflows (assets + maintenance requests).
