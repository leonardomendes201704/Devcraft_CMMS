# Task Lifecycle Directive (Mandatory)

## Goal

Padronizar a execucao de tasks para evitar entregas sem rastreabilidade de tempo/status e garantir validacao com aplicacao rodando.

## Language Policy (Mandatory)

Toda task registrada no Kanban (titulo, descricao, modulo, snippets de changelog e board) DEVE ser escrita em **Portugues do Brasil (PT-BR)**, sempre. Isso vale para:

- `POST /api/tasks` (campos `title`, `description`, `module`).
- Linhas em `management/kanban/board.md` (Task Register, Transition Log).
- Entradas em `CHANGELOG.md` que referenciam a task.
- Evidencias (`title` dos evidences aceita "Passo 01 - ...", "Etapa 02 - ...", etc.).

Termos tecnicos que nao tem traducao natural (ex.: "endpoint", "pipeline", "lint", "JWT", "Playwright") permanecem no original. Nomes de arquivos, rotas, classes, variaveis e identificadores de codigo NAO sao traduzidos.

Prefixos permitidos no titulo: `[TASK]`, `[BUG]`, `[TC]`, `[CHG]`, `[FEAT]`, `[US]`, `[EPIC]`.

## Mandatory Flow (Local Machine Time)

1. Antes de iniciar qualquer implementacao, criar task no Kanban.
2. No inicio da execucao, registrar data/hora local de inicio e mover para `active`.
3. Durante a execucao, manter atualizacao de status no fluxo oficial.
4. Na entrega, registrar data/hora local final.
5. Calcular tempo gasto da task com base em `end - start` e preencher `spentHours`.
6. Fechar a task somente apos `resolved` e com `spentHours > 0`.
7. Entregar com backend e frontend em execucao para validacao do solicitante.

## Status Policy

- Fluxo permitido: `new -> active -> resolved -> closed`
- Reabertura tecnica: `resolved -> active`
- Bloqueios:
  - nao fechar task com `spentHours <= 0`
  - nao pular status

## Delivery Checklist

- [ ] task criada
- [ ] start local registrado
- [ ] task em `active`
- [ ] implementacao concluida
- [ ] task em `resolved`
- [ ] `spentHours` preenchido
- [ ] task em `closed`
- [ ] horario final registrado
- [ ] tempo gasto calculado
- [ ] backend e frontend rodando

## Evidence

Registrar no `management/kanban/board.md`:
- id da task
- status atual
- horario local de inicio/fim
- tempo gasto final
- evidencias de validacao

## Changelog Guard (Mandatory)

1. Todo commit com alteracao impactante deve incluir atualizacao no `CHANGELOG.md`.
2. Push/PR sem changelog atualizado deve falhar no CI (`changelog-guard`).
3. Desenvolvedor deve manter hook local ativo (`.githooks/pre-commit`) para bloquear commit defasado.
