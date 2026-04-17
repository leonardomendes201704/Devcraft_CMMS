# Command Decisions

- Preferred solution file: `Devcraft_CMMS.slnx`
- On Windows PowerShell, use `npm.cmd` instead of `npm`
- Use `dotnet restore/build/test Devcraft_CMMS.slnx` as default CI/local flow
- For API create endpoints, validate response route with real HTTP smoke test (`201` + `Location`)
- Do not run multiple Playwright commands in parallel when they share local ports (`5173`/`5270`)
- Before `git add`/`git commit`, run changelog preflight:
  - `bash scripts/check-changelog.sh --working-tree`
- Commit flow is mandatory:
  1. Update `CHANGELOG.md`
  2. Run validations (build/tests)
  3. Stage/commit/push
