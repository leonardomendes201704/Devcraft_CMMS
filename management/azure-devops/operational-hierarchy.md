# Hierarquia de Gestao Operacional

Este guia define como toda solicitacao do chat deve ser rastreada operacionalmente.

## Regra Principal

Nenhuma implementacao pode iniciar sem task registrada.

## Fluxo Obrigatorio por Solicitacao de Chat

1. Triagem da solicitacao
- Classificar como task nova ou continuidade.

2. Registro na hierarquia
- Se nova: criar item na hierarquia operacional antes de executar.
- Se continuidade: vincular ao item existente.

3. Execucao
- Implementar com referencia explicita ao ID da task.

4. Encerramento
- Atualizar status para concluida (quando aplicavel).
- Registrar tempo total de esforco realizado.
- Registrar evidencias de validacao.

## Hierarquia Recomendada

- Epic
- Feature
- PBI/User Story
- Task tecnica/funcional

## Campos Minimos Obrigatorios da Task

- ID
- Titulo
- Descricao
- Origem: Chat
- Tipo: feature | bug | chore | hardening | doc | test | devops
- Contexto/modulo
- Estimativa inicial
- Tempo real total
- Status
- Evidencias

## Regra de Tempo

Toda entrega deve informar o tempo total de esforco da task no fechamento.
Formato recomendado: `Xh Ymin`.

## Integracao com Artefatos Locais

Atualizar, quando aplicavel:
- `management/kanban/board.md`
- `management/metrics/delivery-metrics.md`
- `CHANGELOG.md`
- guidelines impactadas
