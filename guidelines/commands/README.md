# Command Catalog

## Preferred

- `dotnet restore Devcraft_CMMS.slnx`
- `dotnet build src/backend/CMMS.Api/CMMS.Api.csproj`
- `dotnet test tests/CMMS.UnitTests/CMMS.UnitTests.csproj`
- `dotnet test tests/CMMS.IntegrationTests/CMMS.IntegrationTests.csproj --no-restore -m:1`
- `dotnet test tests/CMMS.ArchitectureTests/CMMS.ArchitectureTests.csproj`
- `npm.cmd run lint` (from `src/frontend/cmms-web`)
- `npm.cmd run build` (from `src/frontend/cmms-web`)

## Notes

- In this environment, full-solution test/build can intermittently fail with OutOfMemory in SDK 10 tooling.
- Prefer project-level build/test execution until the SDK issue is stabilized.
- On Windows PowerShell, run `bash` scripts via full path: `"C:\Program Files\Git\bin\bash.exe" scripts/check-changelog.sh --working-tree`. The default `bash` resolves to a WSL shim that fails without a configured distro (see LL-008).
- Task lifecycle (new -> active -> resolved -> closed) must go through `.cursor/skills/devcraft-task-lifecycle/`. Invoke with `& .cursor/skills/devcraft-task-lifecycle/scripts/task.ps1 <subcommand>` (never `powershell -File` - see LL-010). Full usage in the skill's `SKILL.md`.
