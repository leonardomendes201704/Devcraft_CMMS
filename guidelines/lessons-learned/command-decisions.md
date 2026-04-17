# Command Decisions

- Preferred solution file: `Devcraft_CMMS.slnx`
- On Windows PowerShell, use `npm.cmd` instead of `npm`
- Use `dotnet restore/build/test Devcraft_CMMS.slnx` as default CI/local flow
- For API create endpoints, validate response route with real HTTP smoke test (`201` + `Location`)
- Do not run multiple Playwright commands in parallel when they share local ports (`5173`/`5270`)
