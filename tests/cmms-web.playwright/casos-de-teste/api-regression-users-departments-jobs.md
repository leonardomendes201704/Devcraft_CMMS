# API — usuarios, departamentos, cargos

**Spec:** `tests/api-regression-users-departments-jobs.spec.ts`  
**Base URL:** `http://localhost:8117`  
**Auth:** Bearer admin_master + `X-Tenant-Id` (via `createAuthContext`).

## Casos

### Departamentos
- Lista `GET /api/auth/departments` retorna 200.
- Cria departamento com codigo unico `POST` → 201.
- `GET /api/auth/departments/{id}` retorna o mesmo codigo.
- `PATCH` atualiza descricao → 200.
- Segundo `POST` com o mesmo codigo → **409** (`department_code_exists`).

### Cargos (jobs)
- Cria departamento pai, depois cargo com `departmentId` valido → 201.
- `GET /api/auth/jobs?departmentId=` inclui o cargo criado.
- `GET /api/auth/jobs/{id}` → 200.
- `PATCH` atualiza descricao → 200.
- Segundo `POST` com o mesmo `code` → **409** (`job_code_exists`).

### Usuarios
- `GET /api/auth/users` → 200.
- `POST` cria usuario com `profile` completo → 201.
- `GET /api/auth/users/{id}` → 200.
- `PATCH` altera `role` para `technician` → 200.

## Evidencias geradas

- JSON por execucao em `../evidence-output/api/` (nome `*-crud-<timestamp>.json`), gitignored.
