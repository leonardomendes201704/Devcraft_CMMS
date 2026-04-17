# Backend Guidelines

- Keep handlers and domain logic outside controllers.
- Enforce tenant context before reading/writing tenant-owned entities.
- Include structured logs with tenant and correlation details.
- Keep EF model explicit (keys, indexes, constraints).
