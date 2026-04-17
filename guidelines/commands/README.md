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
