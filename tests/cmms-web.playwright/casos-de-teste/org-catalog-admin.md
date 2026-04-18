# E2E — departamentos, cargos e perfil

**Spec:** `tests/org-catalog-admin.spec.ts`  
**Evidencias PNG:** `src/frontend/cmms-web/public/evidences/regression/org-catalog/`  
**Segmento:** `org-catalog`

## Fluxo (10 passos)

1. Login.
2. Home autenticada.
3. Formulario criar departamento.
4. Departamento criado (detalhe).
5. Editar departamento — alterar descricao e gravar.
6. Formulario criar cargo.
7. Cargo criado (ligado ao departamento).
8. Editar cargo — alterar descricao e gravar.
9. Editar primeiro usuario da lista — department + job nos comboboxes.
10. Detalhes do usuario — validar texto com nome do cargo e departamento.

Ao final: task Kanban fechada com `closeTaskWithSpentHours`; minimo 10 evidencias "Step NN".
