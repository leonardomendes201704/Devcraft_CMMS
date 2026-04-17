---
name: devcraft-task-lifecycle
description: Automates the mandatory Devcraft CMMS Kanban task lifecycle (new -> active -> resolved -> closed) using the /api/tasks endpoints, attaches image/api evidence, and produces the changelog + kanban board entries required by the project guidelines. Use whenever the agent is about to implement, change, fix or validate ANYTHING in this repository (backend, frontend, docs, infra, tests) - the Task-First directive (guidelines/workflows/task-lifecycle-directive.md) requires a task to exist before code is touched and to be closed with spentHours > 0 after delivery.
---

# Devcraft CMMS Task Lifecycle

## When to use

Apply this skill at the **start** of any work request in the `Devcraft_CMMS` repo and follow it to the end. It is mandatory per `guidelines/workflows/task-lifecycle-directive.md`. Even trivial changes (typos, i18n, small refactors) need a task.

Trigger phrases (non-exhaustive): "preciso que você", "altere", "crie", "corrija", "ajuste", "implemente", "regulariza", "retroativo", "adicione", "remova", any instruction that results in a commit.

If you are just answering a question / reading code, do NOT create a task.

## Quick workflow

Copy this checklist and track progress as you go:

```
- [ ] 1. Login (one-time per session): scripts/task.ps1 login
- [ ] 2. Create task: scripts/task.ps1 new -Title "..." -Description "..." -Type story|feature|test|hotfix|chore|bug -Module "..." -Estimate 0.5
- [ ] 3. Record local start (Get-Date -Format "dd/MM/yyyy, HH:mm:ss") and move to active: scripts/task.ps1 start -Id <guid>
- [ ] 4. Implement the change
- [ ] 5. If task involves UI/frontend -> run/update a Playwright spec under tests/cmms-web.playwright (see "Playwright path" below) to capture evidence
- [ ] 6. If task involves API/backend -> attach api evidence (payload JSON): scripts/task.ps1 evidence -Id <guid> -Title "..." -Kind api -PayloadJson '...'
- [ ] 7. Move to resolved: scripts/task.ps1 resolve -Id <guid>
- [ ] 8. Record local end and close with spentHours: scripts/task.ps1 close -Id <guid> -SpentHours 0.5
- [ ] 9. Update CHANGELOG.md with the entry (use changelog snippet from task show)
- [ ] 10. Append Task Register + Transition Log block to management/kanban/board.md (use board-snippet)
- [ ] 11. Run changelog guard: "C:\Program Files\Git\bin\bash.exe" scripts/check-changelog.sh --working-tree
```

## Script entry point

All subcommands live in `scripts/task.ps1`. Invoke with the PowerShell call operator (`&`) from the repo root - **do NOT use `powershell -File`**, which mangles arguments that contain JSON (braces, quotes) and triggers false "PayloadJson must contain valid JSON" errors on api evidence.

```
& .cursor/skills/devcraft-task-lifecycle/scripts/task.ps1 <subcommand> [args]
```

Subcommands:

| Subcommand | Purpose |
|------------|---------|
| `login` | Authenticate as admin master and cache `{baseUrl, tenantId, token}` into `%TEMP%\devcraft-task.json`. |
| `new` | Create a Kanban task. Prints the task id. |
| `start` | Move task to `active`. |
| `resolve` | Move task to `resolved`. |
| `close` | Set `spentHours` and complete task (status -> `closed`). Restarts `devcraft_cmms_web` if any image evidence was attached. |
| `evidence` | Attach image or api evidence. For images, copies the source PNG into `src/frontend/cmms-web/public/evidences/` using the required naming convention. |
| `show` | Print JSON of a task. Also emits `changelog-snippet` and `board-snippet` with ready-to-paste markdown for `CHANGELOG.md` and `management/kanban/board.md`. |

Run `scripts/task.ps1 help` for full argument list.

## Evidence rules (enforced by the API)

`TasksController.ValidateRequiredEvidence` rejects the close call when the task title/description/module contain keywords and evidence is missing:

- **Frontend keywords** (`frontend, front-end, web, ui, ux, react, page, modal, kanban, playwright, e2e`) require at least one `image` evidence.
- **API/backend keywords** (`api, backend, endpoint, controller, payload, json, postman, auth, swagger, integration`) require at least one `api` evidence with non-empty `payloadJson`.

If the keyword happens to appear only incidentally (e.g. the word "web" in an unrelated refactor title), either (a) rewrite the title to avoid it or (b) still attach a relevant evidence - do not try to bypass the API.

## Evidence naming convention

Image evidence files MUST be copied into `src/frontend/cmms-web/public/evidences/` with the pattern:

```
task-<taskId>-pw-step-<NN>-<kebab-slug>-<unixMs>.png
```

The script enforces this. Only the **relative URL** `/evidences/<filename>.png` must be sent in `imageUrl`; the frontend resolves it from the public root.

## Known issue: Vite does not re-scan public/ after startup

New files added to `public/evidences/` while `devcraft_cmms_web` is already running are served as the SPA `index.html` (status 200, `text/html`) instead of the PNG bytes. The modal then shows "Image unavailable".

Mitigation (built into `scripts/task.ps1 close`): after closing a task that attached at least one image evidence, the script runs `docker restart devcraft_cmms_web`. This takes ~6s. Old evidences continue to work while the new ones become visible after the restart + a browser reload.

See `guidelines/lessons-learned/known-issues.md` and LL-009 for the full trail.

## Playwright path (UI tasks)

For anything that touches the frontend UI, prefer the Playwright flow - it both validates the change and generates valid evidence in one go. Use the helpers in `tests/cmms-web.playwright/lib/evidence.ts`:

- `createAuthContext(request)` - auth with admin master.
- `createFrontendEvidenceTask(request, auth, title, description)` - creates the Kanban task.
- `captureAndAttachStepEvidence(request, page, testInfo, task, step, label)` - screenshots and posts the evidence to `/api/tasks/:id/evidences` with the right naming.
- `closeTaskWithSpentHours(request, task, hours)` - resolve + close.

Existing examples: `tests/cmms-web.playwright/tests/shell-menu-labels.spec.ts`, `users-admin.spec.ts`, `departments-admin.spec.ts`.

Run a single spec (Windows PowerShell):

```
npx.cmd playwright test tests/<file>.spec.ts --reporter=line
```

After the spec passes, the web container still needs the restart trick described above for the new PNGs to be visible in the Kanban UI - the Playwright helpers themselves do not restart Vite.

## Payload reference

See [reference.md](reference.md) for the full JSON schema of each `/api/tasks` endpoint used by the script.

## Documentation obligations after close

Every closed task must produce:

1. **`CHANGELOG.md`** - new bullet under the current date with task id, title, spent hours, touched files/tests.
2. **`management/kanban/board.md`** - Task Register row + Transition Log block with local start/end timestamps and evidence references.
3. **Changelog guard** (`scripts/check-changelog.sh`) passing (run via the full Git Bash path on Windows, see `guidelines/commands/README.md`).
4. **Lessons learned / known issues** when a new recurring pitfall is observed.

Use `scripts/task.ps1 show -Id <guid>` to get the ready-to-paste snippets for items 1 and 2.
