# Known Issues

- `rg` execution may fail with access denied in current environment. Use PowerShell `Get-ChildItem` fallback.
- If PostgreSQL credentials are invalid in local DEV, API can fail at startup. Development fallback to InMemory is enabled to keep validation flow unblocked.
- `npm.cmd run lint` in `src/frontend/cmms-web` currently fails with 4 pre-existing `react-hooks/set-state-in-effect` errors and 5 warnings in `DepartmentsEditPage.tsx`, `JobsEditPage.tsx`, `KanbanPage.tsx`, `UsersEditPage.tsx`, `UsersListPage.tsx`. These were introduced in earlier commits (not by the menu-shortening delivery 2026-04-17 20:00) and must be addressed by a dedicated hardening task before lint can be re-enabled as a blocking gate.
- `bash` not on PATH in Windows PowerShell; use `"C:\Program Files\Git\bin\bash.exe"` for preflight scripts (`scripts/check-changelog.sh`).
- Vite dev server em `devcraft_cmms_web` nao descobre arquivos novos adicionados em `src/frontend/cmms-web/public/` apos o container iniciar. Novas evidencias geradas durante uma task sao servidas como `text/html 615b` (SPA fallback) ate o container ser reiniciado. Workaround: `docker restart devcraft_cmms_web` (ja automatizado em `.cursor/skills/devcraft-task-lifecycle/scripts/task.ps1 close`). Ver LL-009.
- Invocacao de scripts PowerShell com payload JSON literal via `powershell -File` corrompe o argumento (aspas/chaves sao reparseadas pelo subprocess). Usar `& scripts/task.ps1 ... -PayloadJson '{...}'` dentro da sessao atual. Ver LL-010.
