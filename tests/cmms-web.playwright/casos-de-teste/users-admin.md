# E2E — administracao de usuarios

**Spec:** `tests/users-admin.spec.ts`  
**Evidencias PNG (Kanban):** `src/frontend/cmms-web/public/evidences/regression/users-admin/`  
**Segmento Playwright:** `users-admin`

## Fluxo

1. Abrir `/login`.
2. Preencher credenciais master e entrar — shell home.
3. Abrir lista de usuarios (`/app/admin/users`) — heading nivel 1 "Users".
4. Abrir criacao de usuario.
5. Criar usuario de teste (email unico), papel `admin` — detalhes.
6. Editar usuario — alterar papel para `technician`.
7. Reset de senha com novo valor.

Cada passo relevante gera screenshot copiado para `public/evidences/regression/users-admin/` e anexado a task Kanban criada no inicio do teste.
