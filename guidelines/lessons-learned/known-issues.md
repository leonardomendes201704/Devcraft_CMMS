# Known Issues

- `rg` execution may fail with access denied in current environment. Use PowerShell `Get-ChildItem` fallback.
- If PostgreSQL credentials are invalid in local DEV, API can fail at startup. Development fallback to InMemory is enabled to keep validation flow unblocked.
