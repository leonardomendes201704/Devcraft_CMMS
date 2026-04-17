# Devcraft CMMS Task API Reference

All endpoints live under `/api/tasks` on the backend (default `http://localhost:8117` via docker, `http://localhost:5270` via `dotnet run`). Every call requires:

- `Authorization: Bearer <jwt>` (policy `AdminMasterOnly`)
- `X-Tenant-Id: <guid>` (default dev tenant: `11111111-1111-1111-1111-111111111111`)
- `Content-Type: application/json` for body requests

## POST /api/auth/login

Request:
```json
{ "email": "admin@cmms.local", "password": "Naotemsenha0(" }
```

Headers: `X-Tenant-Id`.

Response: `{ "accessToken": "...", "tokenType": "Bearer", "expiresInSeconds": 3600, "user": { ... } }`.

## GET /api/tasks

Returns the list of Kanban tasks ordered by `CreatedAtUtc DESC`.

## POST /api/tasks

Request:
```json
{
  "title": "[TASK] ...",
  "description": "Why + what + acceptance.",
  "type": "story|feature|test|hotfix|chore|bug",
  "module": "Frontend|Backend|Infra|Docs|Tests|...",
  "assignee": "Dev|QA Automation|...",
  "estimateHours": 0.5
}
```

Response: full task payload with generated `id` (guid) and `status = "new"`.

## PATCH /api/tasks/{id}/status

Request: `{ "status": "active" }`, or `"resolved"`, or `"new"`.

Rules:
- Transitions: `new -> active`, `active -> resolved`, `resolved -> active` (reopen), `resolved -> closed` (but only via /complete).
- 400 if transition is not allowed.
- 400 if task is already closed.

## PATCH /api/tasks/{id}/effort

Request: `{ "spentHours": 0.5 }`. Updates `spentHours` in isolation. 400 if task is closed.

## POST /api/tasks/{id}/complete

Request: `{ "spentHours": 0.5 }` (optional - if omitted, uses current task.spentHours).

Rules:
- Only when `status = resolved`.
- `spentHours > 0` required.
- Required evidence present per keyword rules (see SKILL.md).

Sets `status = closed`, `closedAtUtc = now`, `totalSpentHoursOnClose`, `totalLeadTimeHoursOnClose`.

## POST /api/tasks/{id}/evidences

Request (image):
```json
{
  "title": "Step 01 - open login page",
  "kind": "image",
  "imageUrl": "/evidences/task-<taskId>-pw-step-01-open-login-page-1776466837687.png",
  "capturedAtUtc": "2026-04-17T23:00:37.687Z",
  "source": "playwright"
}
```

Request (api):
```json
{
  "title": "Step 02 - POST /api/users response",
  "kind": "api",
  "payloadJson": "{\"status\":201,\"body\":{\"id\":\"...\"}}",
  "capturedAtUtc": "2026-04-17T23:00:38.028Z",
  "source": "integration-test"
}
```

Rules:
- `title` required.
- `kind` must be `image` or `api`.
- `image`: `imageUrl` required.
- `api`: `payloadJson` required AND must be valid JSON.

Note on `imageUrl`: the backend does NOT copy or host the file. The image must already be reachable under the Vite dev server (i.e. placed inside `src/frontend/cmms-web/public/evidences/`) - the script handles the file copy.

## Evidence validation on close

`TasksController.ValidateRequiredEvidence`:

- `normalized = lower(title + description + module)`.
- If any frontend keyword is present, at least one evidence with `kind = image` and non-empty `imageUrl` is required.
- If any api keyword is present, at least one evidence with `kind = api` and non-empty `payloadJson` is required.
- Missing evidence returns HTTP 400 with the specific field listed.

Keyword lists are hard-coded in `src/backend/CMMS.Api/Controllers/TasksController.cs`:

```
FrontendFlowKeywords = [ "frontend", "front-end", "web", "ui", "ux", "react", "page", "modal", "kanban", "playwright", "e2e" ]
ApiFlowKeywords      = [ "api", "backend", "endpoint", "controller", "payload", "json", "postman", "auth", "swagger", "integration" ]
```
