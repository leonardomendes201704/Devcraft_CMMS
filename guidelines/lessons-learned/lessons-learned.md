# Lessons Learned

| ID | Date | Context | Problem | Root Cause | Fix | Preventive Action | Status |
|---|---|---|---|---|---|---|---|
| LL-001 | 2026-04-17 | Tooling | `dotnet new sln` generated `.slnx` and broke scripted `dotnet sln ... .sln add` | SDK behavior changed in .NET 10 CLI | Use `Devcraft_CMMS.slnx` in all commands | Keep command catalog updated with `.slnx` references | prevented |
| LL-002 | 2026-04-17 | Tooling | `npm` PowerShell shim blocked by execution policy | Script execution policy in host | Use `npm.cmd` explicitly in PowerShell | Add this to command guidelines for Windows | prevented |
| LL-003 | 2026-04-17 | Backend/API | `POST /api/tasks` retornava 500 com DataAnnotations em requests | Uso de `record` + metadata de validacao em propriedade primaria | Migrar DTOs de request para classes com propriedades `init` | Evitar `record` para requests com DataAnnotations no ASP.NET Core | prevented |
| LL-004 | 2026-04-17 | Backend/API | `POST /api/tasks` retornava 500 no `CreatedAtAction` | Rota alvo nao existia para `{id}` | Retornar `Created(\"/api/tasks/{id}\", body)` | Validar retorno de create com smoke test HTTP real | prevented |
| LL-005 | 2026-04-17 | Testing/Playwright | Execucoes Playwright conflitaram porta 5270 | Rodar suites concorrentes que sobem mesmos web servers | Executar Playwright de forma sequencial por suite/projeto | Nao paralelizar comandos que compartilham portas locais | prevented |
