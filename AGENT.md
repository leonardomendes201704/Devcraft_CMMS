# AGENT

Este arquivo define o contrato operacional para contribuidores humanos e agentes no projeto Devcraft CMMS.
Fonte de verdade: `cmms_codex_diretrizes_v8.md`.

## 1. Missao do Projeto

Entregar um CMMS SaaS multi-tenant, escalavel, seguro e pronto para evolucao de produto real, com alto padrao de engenharia.

## 2. Stack Obrigatoria

### Backend
- .NET 8 / ASP.NET Core 8
- C# 12
- EF Core + PostgreSQL
- JWT + Refresh Token
- FluentValidation
- MediatR
- Mapster (ou AutoMapper)
- Serilog
- Swagger/OpenAPI
- Docker

### Frontend
- React + TypeScript + Vite
- React Router
- TanStack Query
- React Hook Form + Zod
- i18next
- Tailwind CSS + biblioteca de componentes consistente
- Playwright

### Testes e Qualidade
- xUnit + FluentAssertions + Moq/NSubstitute
- Testes de integracao de API/persistencia
- Playwright E2E/regressao
- CI/CD com GitHub Actions
- Conventional Commits + versionamento semantico

## 3. Diretrizes Inegociaveis

- Arquitetura v1: modular monolith (sem microservicos nesta fase).
- Nada de “CRUD superficial” sem regra de negocio.
- Nada de frontend sem backend real, nem backend sem frontend funcional.
- Auth, autorizacao e multi-tenant nao podem ser postergados.
- Documentacao, testes e evidencias fazem parte da entrega.

## 4. Arquitetura e Camadas

- Separar Domain, Application, Infrastructure e API.
- Controllers finos; regra de negocio em handlers/servicos.
- Evitar repositorios genericos sem necessidade.
- Design para evoluir (futuro schema/database por tenant) sem reescrita massiva.

## 5. Multi-Tenant (Obrigatorio)

- Estrategia base: single database shared + `TenantId` em entidades multi-tenant.
- Filtros globais no EF Core.
- Validacao de tenant em endpoints, handlers e persistencia.
- Proibido acesso cruzado entre tenants.
- Logs e auditoria sempre com contexto de tenant.
- Cobertura automatizada de isolamento entre tenants.

## 6. i18n (Obrigatorio)

- Idiomas iniciais: `pt-BR` e `en-US`.
- Frontend com troca de idioma em runtime.
- Mensagens de validacao/erro localizaveis.
- Datas/numeros/moedas preparados por cultura.

## 7. Externalizacao e Sem Hardcode

- Catalogos, parametros, templates, flags e configuracoes devem ser externalizados.
- Frontend deve consumir listas/catologos dinamicos da API.
- Se enum tecnico permanecer em codigo, justificar em documentacao.
- Segredos/chaves sem hardcode, com mascaramento, rastreabilidade e rotacao.

## 8. Observabilidade e Auditoria

Toda funcionalidade critica nasce com estrategia de logs + auditoria.

Tipos minimos de logs:
- Transacional (before/after)
- Auditoria
- Operacional
- Erro/excecao
- Seguranca
- Integracao
- Performance

Campos minimos por evento relevante:
- UTC timestamp
- Tenant
- Usuario
- Modulo/funcionalidade
- Entidade/registro
- Correlation/trace id
- Resultado

## 9. Seguranca

- Autenticacao robusta e autorizacao granular (RBAC).
- Validacao de entrada backend + frontend.
- Protecao contra overposting.
- Rate limit em endpoints sensiveis.
- Headers de seguranca.
- Upload com tratamento seguro.

## 10. Fluxo de Fases (Execucao)

Fases:
1. Fundacao
2. Nucleo do dominio
3. Manutencao
4. Estoque e custos
5. Dashboards/relatorios/auditoria
6. Qualidade final

Antes de cada fase:
- Atualizar backlog (epics/features/PBIs/tasks)
- Registrar estimativas
- Atualizar kanban
- Definir criterios de aceite e casos de teste

Ao concluir cada fase:
- Atualizar changelog e kanban
- Registrar tempo real
- Atualizar docs (incluindo observabilidade/auditoria)
- Anexar evidencias de teste
- Descrever entrega em linguagem de negocio
- Entregar passo a passo DEV e QA

## 10.1 Regra Obrigatoria de Solicitacoes no Chat (Task First)

Toda solicitacao recebida no chat deve passar por triagem operacional antes da execucao:

1. Identificar se a solicitacao e:
- Task nova, ou
- Continuidade de task existente
2. Se for nova, criar task na hierarquia de gestao operacional antes de iniciar a implementacao.
3. Se for continuidade, vincular explicitamente a task existente.

Regra inegociavel:
- Nada deve ser implementado sem task registrada.
- Toda entrega deve encerrar com status da task atualizado para concluida (quando aplicavel) e com tempo total de esforco realizado.
- O tempo total deve ser registrado em formato objetivo (ex.: `2h 35min`) e refletir o esforco real da execucao.

Campos minimos de rastreabilidade da task:
- ID
- Titulo
- Descricao clara do objetivo e escopo
- Tipo (feature, bug, chore, hardening, doc, etc.)
- Modulo/contexto
- Estimativa
- Tempo real total
- Status
- Evidencias/links de validacao

## 11. Definition of Done (DoD)

Uma entrega so fecha quando:
- Codigo implementado e funcional
- Build/testes pertinentes passaram (ou bloqueio justificado)
- Sem regressao conhecida
- Evidencias rastreaveis de validacao
- Documentacao sincronizada
- Guia DEV/QA atualizado
- Logs/auditoria adequados
- Se houve aprendizado novo, diretrizes atualizadas

## 12. Melhoria Continua Obrigatoria

Se um problema recorrente ocorrer (build, teste, comando, migration, pipeline, retrabalho):
1. Registrar ocorrencia
2. Identificar causa raiz
3. Documentar solucao
4. Definir prevencao
5. Atualizar guideline do contexto
6. Ajustar script/template/checklist/teste para evitar repeticao

Proibido repetir tentativa ineficaz cegamente.

## 13. Artefatos Obrigatorios de Aprendizado

Manter atualizados:
- `/guidelines/lessons-learned/lessons-learned.md`
- `/guidelines/lessons-learned/known-issues.md`
- `/guidelines/lessons-learned/command-decisions.md`
- Troubleshooting e catalogo de comandos por contexto

## 14. Padrao de Entrega Operacional

Cada entrega deve melhorar:
- O produto (funcionalidade)
- O sistema de desenvolvimento (processo, docs, automacao, previsibilidade)

## 15. Regras Locais do Ambiente

- Solucao atual: `Devcraft_CMMS.slnx`
- Em PowerShell Windows, usar `npm.cmd` quando necessario
- Em instabilidade de memoria no build/teste global, executar build/test por projeto e registrar evidencia
