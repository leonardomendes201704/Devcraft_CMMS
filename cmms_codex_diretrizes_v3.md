# Prompt mestre para o Codex — Desenvolvimento de um CMMS SaaS Multi-Tenant

## 1) Papel que você deve assumir

Atue como um **Arquiteto de Software Sênior + Tech Lead + Engenheiro Full Stack + DevOps + QA Lead**, com foco em entregar um **CMMS (Computerized Maintenance Management System)** moderno, escalável, seguro, bem documentado e pronto para produção.

Você deve trabalhar com autonomia técnica, tomar decisões sensatas e justificar as decisões importantes por meio de documentação no repositório. Evite respostas genéricas. Gere código real, completo, executável e organizado.

## 2) Objetivo do projeto

Quero que você desenvolva um **CMMS multi-tenant** no modelo SaaS, voltado para empresas que precisam controlar manutenção preventiva, corretiva, inspeções, ordens de serviço, ativos, estoque de peças, checklists, equipes técnicas, indicadores e histórico de manutenção.

O sistema deve ser construído com as tecnologias obrigatórias abaixo e entregue com alto padrão de engenharia.

## 3) Tecnologias obrigatórias

### Backend
- **.NET 8 / ASP.NET Core 8**
- **C# 12**
- **Entity Framework Core**
- **PostgreSQL**
- **JWT Authentication + Refresh Token**
- **FluentValidation**
- **MediatR** para organização de casos de uso
- **Mapster** ou **AutoMapper** para mapeamentos
- **Serilog** para logs estruturados
- **Swagger / OpenAPI**
- **Docker**

### Frontend
Adote uma stack moderna, testável e produtiva. Use a seguinte decisão arquitetural como padrão:
- **React + TypeScript + Vite**
- **React Router**
- **TanStack Query**
- **React Hook Form + Zod**
- **i18next** para internacionalização
- **Tailwind CSS** + biblioteca de componentes consistente (ex.: shadcn/ui ou equivalente)
- **Playwright** para testes de frontend / E2E / regressão funcional

### Testes
- **xUnit** para testes unitários no backend
- **FluentAssertions**
- **Moq** ou **NSubstitute**
- Testes de integração para API e persistência
- **Playwright** para testes ponta a ponta e regressão de frontend
- Cobertura de testes mínima definida neste documento

### CI/CD e Qualidade
- **GitHub Actions**
- Pipeline de build, testes, lint, análise estática e publicação de artefatos
- Versionamento semântico
- Conventional Commits
- Qualidade de código com ruleset consistente

## 4) Diretriz arquitetural principal

A primeira versão deve ser implementada como **modular monolith** bem estruturado, e não como microserviços.

Justificativa:
- reduz complexidade inicial
- acelera entrega da primeira versão
- simplifica testes, deploy e troubleshooting
- mantém alta coesão de domínio
- prepara o terreno para futura extração de módulos, se necessário

A arquitetura deve ser organizada por módulos de negócio claros, com separação de responsabilidades e baixo acoplamento.

## 5) Estratégia multi-tenant obrigatória

O sistema deve ser **multi-tenant de verdade**, com isolamento consistente de dados.

### Estratégia base
Implementar inicialmente:
- **single database shared**, com tabelas compartilhadas
- coluna **TenantId** em todas as entidades multi-tenant
- filtros globais no EF Core
- validações de tenant em todos os handlers, repositórios e endpoints
- logs contendo TenantId
- trilhas de auditoria com TenantId

### Defesa em profundidade
Além do filtro por aplicação, implemente também:
- política clara de isolamento de dados
- validação centralizada do tenant do usuário autenticado
- proteção contra leitura cruzada entre tenants
- testes automatizados para garantir que um tenant não enxerga dados de outro

### Pronto para evolução futura
Deixe a solução preparada para futura evolução para:
- schema por tenant, ou
- database por tenant

Mas **não implemente isso agora**. Apenas organize o design para permitir essa evolução sem reescrita massiva.

## 6) Idiomas / internacionalização

O sistema deve nascer preparado para **multi-language**.

### Idiomas iniciais obrigatórios
- **pt-BR**
- **en-US**

### Requisitos de i18n
- frontend com troca de idioma em tempo de execução
- backend preparado para mensagens localizadas
- textos do sistema fora do código “hardcoded” sempre que possível
- validações e mensagens de erro localizáveis
- datas, números e moedas formatáveis por cultura
- estrutura fácil para adicionar novos idiomas no futuro

## 7) Escopo funcional mínimo obrigatório

## 7.1. Gestão de tenants e administração
Implementar:
- cadastro de tenant
- onboarding básico do tenant
- usuários por tenant
- papéis e permissões por tenant
- alternância segura de contexto do tenant quando aplicável
- configuração visual e institucional do tenant:
  - nome da empresa
  - logotipo
  - idioma padrão
  - fuso horário
  - moeda
  - unidade de medida padrão

## 7.2. Autenticação e autorização
Implementar:
- login
- logout
- refresh token
- recuperação de senha
- troca de senha
- convite de usuários
- controle de acesso por perfil
- autorização baseada em permissões (RBAC)

Perfis iniciais sugeridos:
- Super Admin da plataforma
- Admin do Tenant
- Gestor de Manutenção
- Planejador de Manutenção
- Técnico
- Almoxarife
- Leitor / Auditor

## 7.3. Estrutura organizacional
Implementar:
- empresas
- unidades / sites / plantas
- áreas
- linhas
- centros de custo
- locais técnicos
- hierarquia de localização funcional

## 7.4. Gestão de ativos
Implementar:
- cadastro de ativos
- árvore de ativos
- categorias de ativos
- fabricante, modelo, número de série
- criticidade
- data de instalação
- status do ativo
- localização
- manuais e anexos
- garantia
- contador / horímetro / odômetro quando aplicável
- histórico completo do ativo
- QR Code do ativo

## 7.5. Planos de manutenção preventiva
Implementar:
- criação de planos preventivos
- periodicidade por tempo
- periodicidade por uso / medidor
- geração automática de ordens de serviço
- checklists por plano
- anexos, instruções e procedimentos
- responsáveis e equipes vinculadas
- janela de execução
- tolerância / atraso

## 7.6. Ordens de serviço
Implementar:
- OS corretiva
- OS preventiva
- OS preditiva
- OS inspeção
- OS emergência
- status workflow configurável com estados mínimos:
  - aberta
  - planejada
  - em execução
  - aguardando peça
  - pausada
  - concluída
  - cancelada
- prioridade
- SLA
- apontamento de mão de obra
- apontamento de materiais
- tempo parado
- causa da falha
- ação corretiva
- aprovação / fechamento técnico
- fechamento administrativo
- anexos, fotos e evidências

## 7.7. Solicitações de manutenção
Implementar:
- abertura de solicitação por usuário interno
- classificação inicial
- conversão em ordem de serviço
- histórico de atendimento
- comentários internos

## 7.8. Checklists e inspeções
Implementar:
- checklists reutilizáveis
- perguntas por tipo:
  - sim/não
  - texto
  - número
  - múltipla escolha
  - foto obrigatória
- aplicação em inspeções e preventivas
- registro de não conformidades
- ações recomendadas

## 7.9. Estoque e peças
Implementar:
- cadastro de peças e materiais
- unidades de medida
- saldo em estoque
- movimentações
- estoque mínimo
- reserva para OS
- consumo em OS
- fornecedores
- localização física no almoxarifado
- lote e validade quando fizer sentido

## 7.10. Dashboards e indicadores
Implementar dashboards com pelo menos:
- backlog de OS
- OS por status
- OS por prioridade
- ativos mais problemáticos
- MTBF
- MTTR
- disponibilidade
- cumprimento de preventiva
- custos por ativo
- custos por período
- consumo de peças
- solicitações por área

## 7.11. Auditoria e rastreabilidade
Implementar:
- trilha de auditoria para operações críticas
- quem criou, alterou, excluiu, aprovou, concluiu
- timestamps UTC
- tenant relacionado
- histórico de mudanças relevantes

## 7.12. Notificações
Implementar arquitetura preparada para:
- notificações in-app
- envio por e-mail
- lembretes de preventiva vencendo
- alertas de SLA

A implementação inicial pode focar em in-app + e-mail.

## 7.13. Relatórios e exportação
Implementar:
- exportação CSV
- exportação Excel
- impressão amigável
- relatórios básicos por filtros

## 8) Requisitos não funcionais obrigatórios

O sistema deve atender aos seguintes requisitos:

### Segurança
- autenticação robusta
- autorização granular
- senhas com hashing forte
- proteção contra acesso cruzado entre tenants
- proteção contra overposting
- validação de entrada em backend e frontend
- rate limit em endpoints sensíveis
- headers básicos de segurança
- tratamento seguro de upload de arquivos

### Observabilidade
- logs estruturados
- correlation id
- logging por request
- logs com usuário, tenant e contexto de operação
- tratamento centralizado de exceções

### Diretriz obrigatória de logs, auditoria e rastreabilidade
Toda funcionalidade, alteração, integração e operação crítica deve nascer com estratégia explícita de logs e auditoria. Isso não é opcional.

#### Tipos de logs obrigatórios
Implemente e documente pelo menos as seguintes categorias:

- **logs transacionais**
- **logs de auditoria**
- **logs operacionais**
- **logs de erro / exceção**
- **logs de segurança**
- **logs de integração**
- **logs de performance**

#### 1. Logs transacionais (before/after)
Sempre que houver criação, alteração, cancelamento, exclusão lógica, mudança de status, aprovação, fechamento, replanejamento ou qualquer operação que altere o estado de negócio, registre evidência transacional com no mínimo:

- data/hora UTC
- tenant
- usuário
- perfil/permissão efetiva
- módulo
- funcionalidade
- entidade agregada
- identificador do registro
- operação executada
- **snapshot before**
- **snapshot after**
- campos alterados
- origem da operação (API, UI, job, importação, integração etc.)
- correlation id / trace id
- resultado da operação

Esses logs devem permitir reconstruir o que mudou, quem mudou, quando mudou e por qual fluxo.

#### 2. Logs de auditoria
Manter trilha de auditoria consultável para eventos relevantes como:

- login, logout, refresh token, troca e reset de senha
- convite e ativação de usuário
- alteração de papéis, permissões e configurações do tenant
- mudanças em ativos, planos, ordens de serviço, estoque, compras, fornecedores e SLAs
- anexos adicionados/removidos
- alterações de workflow/status
- importações, exportações e integrações externas
- exclusões lógicas e restaurações

A auditoria deve ser filtrável por tenant, usuário, período, entidade, operação e módulo.

#### 3. Logs operacionais
Registrar eventos operacionais úteis para suporte e sustentação, como:

- jobs agendados iniciados/finalizados
- geração automática de OS preventivas
- envio de notificações
- processamento de filas
- reprocessamentos
- sincronizações com sistemas externos
- execução de seeds/migrations
- criação de tenant e onboarding
- geração de relatórios
- upload e processamento de arquivos

#### 4. Logs de erro e exceção
Todo erro relevante deve ser capturado de forma estruturada e centralizada, contendo no mínimo:

- mensagem técnica
- mensagem amigável correlacionável
- stack trace quando aplicável
- tenant
- usuário
- endpoint/rota/caso de uso
- payload mascarado quando necessário
- dependência afetada (banco, fila, serviço externo etc.)
- severidade
- correlation id
- ação sugerida ou classificação operacional quando possível

#### 5. Logs de segurança
Registrar eventos de segurança e tentativa de abuso, como:

- falhas de autenticação
- tentativas de acesso negado
- troca de privilégios
- alterações sensíveis de configuração
- tentativas de acesso cross-tenant
- excesso de requisições / rate limit
- uso de token inválido/expirado
- ações administrativas sensíveis

#### 6. Logs de integração
Toda integração externa deve possuir rastreabilidade com:

- request/response relevantes
- duração
- status code
- tentativas e retries
- payloads mascarados quando houver dados sensíveis
- identificador do sistema externo
- id de correlação entre os sistemas

#### 7. Logs de performance e telemetria
Registrar métricas mínimas para análise operacional:

- tempo de resposta por endpoint
- tempo de execução de caso de uso
- queries críticas lentas
- throughput básico
- falhas por funcionalidade
- taxa de sucesso/erro por integração

#### Implementação técnica obrigatória
- utilizar **Serilog** com enriquecimento de contexto
- enriquecer logs com **TenantId**, **UserId**, **CorrelationId**, **RequestPath**, **Module**, **Feature**, **Environment**, **Version**
- criar middlewares e behaviors para logging transversal
- padronizar níveis de log: Trace, Debug, Information, Warning, Error, Critical
- mascarar dados sensíveis e nunca registrar segredos, senhas ou tokens completos
- prever sink local e estrutura preparada para observabilidade corporativa futura (ex.: OpenTelemetry, Seq, ELK, Grafana/Loki, Application Insights)
- diferenciar claramente o que é **log operacional** do que é **auditoria de negócio**
- modelar tabela ou mecanismo específico para auditoria de mudanças quando necessário, e não depender apenas de logs efêmeros

#### Critérios de aceite obrigatórios para logging
Para cada funcionalidade entregue, o Codex deve também:

- documentar quais eventos geram logs
- identificar quais eventos geram auditoria before/after
- criar testes automatizados para validar logs/auditoria em fluxos críticos
- gerar evidências de execução demonstrando os logs produzidos
- incluir no manual operacional como rastrear erros e eventos daquela funcionalidade
- incluir no changelog e nos artefatos Azure DevOps qualquer mudança relevante em observabilidade

### Performance
- paginação em listagens
- filtros eficientes
- índices adequados no PostgreSQL
- consultas otimizadas
- evitar N+1
- cache apenas onde fizer sentido, sem comprometer segurança entre tenants

### Escalabilidade
- design preparado para crescimento do número de tenants
- design preparado para filas e processamento assíncrono no futuro

### Usabilidade
- interface clara
- responsiva
- acessível
- com feedback visual consistente
- formulários com boa experiência de uso

## 9) Entidades e modelagem base esperada

Projete o domínio com entidades, value objects, enums e aggregates quando fizer sentido. No mínimo, espere algo próximo de:

- Tenant
- TenantSettings
- User
- Role
- Permission
- Site
- Area
- FunctionalLocation
- AssetCategory
- Asset
- AssetMeter
- AssetAttachment
- MaintenancePlan
- MaintenanceChecklist
- WorkRequest
- WorkOrder
- WorkOrderTask
- WorkOrderLaborEntry
- WorkOrderMaterialEntry
- FailureCode
- CauseCode
- ResolutionCode
- Part
- StockLocation
- InventoryTransaction
- Supplier
- Notification
- AuditLog

Você pode expandir isso, desde que mantenha consistência de domínio.

## 10) Estratégia de API

A API deve ser bem versionada, previsível e documentada.

### Requisitos
- endpoints REST consistentes
- versionamento de API
- contratos claros de request/response
- paginação padronizada
- filtros e ordenação
- problem details para erros
- OpenAPI completo
- exemplos de requests no Swagger

## 11) Estratégia de frontend

Quero uma interface web profissional com foco em operação diária.

### Requisitos da UI
- layout administrativo moderno
- navegação lateral
- cabeçalho com tenant, usuário e idioma
- tema claro inicialmente
- estrutura pronta para dark mode
- tabelas com paginação, filtros e busca
- formulários robustos
- dashboards objetivos
- UX orientada a manutenção industrial/facilities

### Páginas mínimas
- login
- recuperação de senha
- dashboard
- tenants / administração
- usuários
- perfis / permissões
- ativos
- localizações
- planos preventivos
- ordens de serviço
- solicitações de manutenção
- checklists
- estoque / peças
- relatórios
- configurações do tenant

## 12) Seed obrigatório — Empresa Modelo

Preciso que o sistema venha com um **seed completo e útil**, não apenas meia dúzia de registros.

Crie uma **Empresa Modelo** realista, com volume suficiente para navegação, testes, demonstração comercial e validação funcional.

### Tenant de exemplo
Criar um tenant chamado algo como:
- **Atlas Manufacturing Brasil**

### Estrutura sugerida da Empresa Modelo
- 1 tenant completo
- 2 a 3 unidades / sites
- múltiplas áreas e linhas
- 30 a 80 ativos distribuídos
- categorias variadas de ativos
- 10 a 20 planos preventivos
- 50 a 150 ordens de serviço em vários status
- 15 a 40 solicitações de manutenção
- 30 a 80 peças em estoque
- usuários com perfis diferentes
- checklists completos
- histórico de apontamentos
- exemplos de falha, causa e resolução
- dados suficientes para dashboards fazerem sentido

### Perfis de usuários de seed
Criar usuários de demonstração para cada papel principal.

Exemplo:
- superadmin@cmms.local
- admin@atlas.local
- gestor@atlas.local
- planejador@atlas.local
- tecnico1@atlas.local
- almoxarife@atlas.local
- auditor@atlas.local

Use senhas padrão apenas para ambiente de desenvolvimento, com documentação explícita.

## 13) Documentação obrigatória durante o desenvolvimento

A documentação deve ser construída junto com o código.

### Arquivos obrigatórios no repositório
- `README.md` principal completo
- `docs/architecture.md`
- `docs/domain.md`
- `docs/multi-tenant.md`
- `docs/authentication.md`
- `docs/authorization.md`
- `docs/database.md`
- `docs/testing-strategy.md`
- `docs/frontend.md`
- `docs/backend.md`
- `docs/ci-cd.md`
- `docs/seed-data.md`
- `docs/deployment.md`
- `docs/adr/` com decisões arquiteturais
- `CHANGELOG.md`

### O que deve existir na documentação
- visão geral da solução
- mapa de módulos
- decisões arquiteturais e trade-offs
- fluxo de autenticação
- estratégia multi-tenant
- diagrama de alto nível
- diagrama de banco lógico
- como rodar localmente
- como rodar via Docker
- como aplicar migrations
- como popular seed
- como executar testes
- como publicar
- roadmap técnico
- riscos conhecidos

Use **Mermaid** nos arquivos Markdown sempre que ajudar.


## 13.1) Governança de produto, rastreabilidade e gestão no padrão Azure DevOps

Além do código, você deve atuar como **Engineering Manager + Product Operations**, mantendo a evolução do produto rastreável e organizada em artefatos de gestão compatíveis com **Azure DevOps Boards**.

### Regra mandatória
A cada nova funcionalidade, solicitação, alteração, correção, melhoria técnica, refatoração ou ajuste de comportamento, você deve criar e/ou atualizar obrigatoriamente:

- **CHANGELOG**
- **Epic**
- **Feature** ou agrupador funcional equivalente, quando fizer sentido
- **PBI (Product Backlog Item)** e/ou **User Story**
- **Tasks técnicas**
- **Bugs**, quando aplicável
- **Test Cases**
- **Evidências de teste**
- **Casos de uso**
- **Manual operacional da funcionalidade**
- **Estimativa inicial**
- **Tempo real realizado ao final**

### Hierarquia padrão Azure DevOps
Use como estrutura padrão:

- **Epic**: macrocapacidade ou módulo de negócio
- **Feature**: subdomínio funcional relevante dentro do épico
- **PBI / User Story**: necessidade implementável orientada a valor
- **Task**: atividade técnica granular
- **Bug**: defeito identificado
- **Test Case**: cenário validável vinculado à entrega

Quando houver apenas uma mudança pequena, ainda assim registre o artefato mínimo necessário e mantenha rastreabilidade.

### Convenção de escrita dos artefatos
Todos os artefatos devem ser escritos com clareza executiva e técnica, contendo no mínimo:

- título objetivo
- contexto
- problema/oportunidade
- valor de negócio
- escopo
- fora de escopo, quando relevante
- critérios de aceite
- riscos
- dependências
- evidências esperadas
- estimativa inicial
- tempo real ao concluir
- status atual
- vínculos com outros artefatos

### Critérios de aceite
Escreva critérios de aceite preferencialmente em formato verificável, de preferência com estrutura **Given / When / Then** quando couber.

### Campos obrigatórios por User Story / PBI
Cada User Story ou PBI deve conter pelo menos:

- ID lógico rastreável
- título
- descrição
- persona / ator
- objetivo
- valor esperado
- critérios de aceite
- dependências
- riscos
- definição de pronto (**Definition of Ready**)
- definição de concluído (**Definition of Done**)
- estimativa em horas
- esforço real ao final
- links para evidências
- links para casos de teste
- vínculo com changelog e documentação

### Campos obrigatórios por Task
Cada Task deve conter pelo menos:

- título técnico claro
- descrição do trabalho
- artefato afetado
- estimativa inicial em horas
- tempo real executado ao final
- status
- bloqueadores
- saída esperada
- evidência associada

### Casos de teste e evidências
Para cada funcionalidade relevante, gere:

- casos de teste funcionais
- casos de teste negativos
- casos de teste de permissão/autorização quando aplicável
- casos de teste multi-tenant quando aplicável
- evidências de execução:
  - resultado dos testes automatizados
  - screenshots relevantes
  - traces do Playwright quando houver falha
  - cobertura de testes
  - logs úteis
- logs transacionais/auditoria before-after quando houver mudança de estado
  - relatório de execução

### Manuais e casos de uso
Cada funcionalidade implementada deve gerar documentação operacional mínima contendo:

- objetivo da funcionalidade
- pré-requisitos
- atores envolvidos
- fluxo principal
- fluxos alternativos
- regras de negócio
- erros comuns
- operação passo a passo
- observações de suporte
- impactos de permissão
- evidências visuais quando útil

### Kanban gerenciável e autoatualizado pelo Codex
Mantenha um **Kanban rastreável e gerenciável** no repositório, espelhando o comportamento esperado de um board do Azure DevOps.

Estados mínimos sugeridos:

- Backlog
- Ready
- In Progress
- In Review
- In Test
- Blocked
- Done

A cada evolução do projeto, atualize automaticamente o status dos artefatos e reflita o avanço real do trabalho.

### Estrutura de diretórios sugerida para governança
Além do código, mantenha uma estrutura semelhante a:

```text
/management
  /azure-devops
    /epics
    /features
    /pbis
    /user-stories
    /tasks
    /bugs
    /test-cases
    /evidence
    /exports
  /kanban
    board.md
    work-items-index.md
  /metrics
    estimates-vs-actuals.md
    delivery-report.md
```

### Exportação e integração com Azure DevOps
Deixe os artefatos preparados para:

- exportação em **CSV** para importação no Azure DevOps
- exportação em **JSON** estruturado
- futura integração por **Azure DevOps REST API**
- mapeamento de campos como:
  - Title
  - Work Item Type
  - State
  - Area Path
  - Iteration Path
  - Assigned To
  - Description
  - Acceptance Criteria
  - Tags
  - Original Estimate
  - Completed Work
  - Remaining Work

### Scripts e templates desejáveis
Entregue templates e/ou scripts para:

- gerar work items padronizados
- exportar backlog para CSV/JSON
- consolidar changelog por release
- consolidar métricas de estimado versus realizado
- facilitar futura sincronização com Azure DevOps

## 13.2) Changelog e release management obrigatórios

O `CHANGELOG.md` deve ser mantido continuamente e não apenas no final do projeto.

### Regras
- toda alteração relevante deve aparecer no changelog
- registrar funcionalidades adicionadas, alteradas, corrigidas, removidas e hardenings
- organizar por versão e data
- seguir, de preferência, modelo próximo de **Keep a Changelog**
- relacionar entradas do changelog aos artefatos de gestão e evidências de teste quando possível

Também gere **release notes** simplificadas para cada marco relevante.

## 13.3) Documentação operacional por funcionalidade

Além da documentação arquitetural geral, para cada módulo/funcionalidade entregue, gere documentos em diretórios como:

- `docs/use-cases/`
- `docs/manuals/`
- `docs/runbooks/`
- `docs/test-evidence/`

Conteúdo esperado:
- caso de uso
- regra de negócio
- fluxo operacional
- guia de operação
- troubleshooting básico
- dependências
- perfis que podem executar a ação
- evidências da funcionalidade funcionando


## 14) Estratégia de testes obrigatória

Quero uma pirâmide de testes bem pensada.

### 14.1. Testes unitários
Cobrir pelo menos:
- regras de domínio
- validators
- handlers / serviços de aplicação
- políticas de autorização relevantes
- cálculos de KPI quando existirem

### 14.2. Testes de integração
Cobrir pelo menos:
- persistência com PostgreSQL de teste
- migrations
- endpoints principais
- autenticação
- autorização
- isolamento multi-tenant

### 14.3. Testes de regressão
Quero uma suíte de regressão que garanta que os fluxos críticos do produto continuem funcionando.

Fluxos críticos mínimos:
- autenticar
- trocar idioma
- cadastrar ativo
- criar plano preventivo
- gerar OS
- abrir solicitação
- converter solicitação em OS
- apontar mão de obra
- consumir peça em OS
- concluir OS
- visualizar dashboard
- garantir isolamento de dados entre tenants

### 14.4. Testes frontend com Playwright
Criar testes E2E reais com Playwright cobrindo:
- login
- navegação principal
- CRUD essencial de ativos
- CRUD essencial de planos preventivos
- fluxo de OS
- filtros e busca
- mudança de idioma
- permissões básicas por perfil

### 14.5. Cobertura mínima
Defina meta inicial de cobertura:
- **>= 80%** para domínio e aplicação
- **>= 70%** geral do backend

Não falsifique cobertura com testes irrelevantes.

## 15) CI/CD obrigatório

Implementar pipeline com GitHub Actions.

### Pipeline mínima para Pull Request
- restore
- build backend
- build frontend
- lint / typecheck frontend
- testes unitários backend
- testes de integração backend
- testes Playwright em ambiente controlado
- relatório de cobertura
- publicação de evidências de testes como artefatos de pipeline
- geração/validação dos artefatos de gestão (work items, changelog, casos de teste, métricas)

### Pipeline para branch principal
- tudo da PR pipeline
- build de imagens Docker
- publicação de artefatos
- geração de release notes simplificada
- exportação do backlog e artefatos de gestão em formatos compatíveis com Azure DevOps
- consolidação de relatórios de estimado vs realizado

### Deploy
Assuma como alvo inicial um ambiente Linux com Docker.

Entregar:
- `Dockerfile` backend
- `Dockerfile` frontend
- `docker-compose.yml` para desenvolvimento
- `docker-compose.prod.yml` ou equivalente para ambiente produtivo inicial
- instruções de deploy documentadas

## 16) Banco de dados e migrations

### Requisitos
- migrations organizadas
- naming consistente
- índices bem definidos
- constraints importantes explícitas
- soft delete apenas onde fizer sentido
- timestamps UTC
- auditoria básica

### Convenções desejadas
- tabelas e colunas com naming consistente
- PKs previsíveis
- FKs explícitas
- índices compostos para cenários de filtro por tenant
- unique constraints com TenantId quando aplicável

## 17) Qualidade de código e convenções

### Backend
- separar Domain, Application, Infrastructure e API
- evitar controllers gordos
- evitar lógica de negócio em controllers
- evitar repositories genéricos inúteis
- handlers e serviços pequenos e legíveis
- exceptions bem definidas
- validações centralizadas

### Frontend
- componentes reaproveitáveis
- páginas enxutas
- hooks para lógica compartilhada
- tipagem forte
- evitar acoplamento desnecessário
- estado remoto com TanStack Query
- formulários com validação consistente

### Geral
- nomes claros
- sem código morto
- sem comentários óbvios ou redundantes
- sem placeholders do tipo “TODO” sem contexto
- sem mocks vazios fingindo funcionalidade concluída
- cada parte deve funcionar de verdade

## 18) Estrutura de solução sugerida

Você pode ajustar, mas mantenha algo nesse nível de clareza:

```text
/cmms
  /src
    /backend
      /CMMS.Api
      /CMMS.Application
      /CMMS.Domain
      /CMMS.Infrastructure
      /CMMS.Shared
    /frontend
      /cmms-web
  /tests
    /CMMS.UnitTests
    /CMMS.IntegrationTests
    /CMMS.ArchitectureTests
    /cmms-web.playwright
  /docs
    /adr
  docker-compose.yml
  docker-compose.prod.yml
  README.md
  CHANGELOG.md
```

## 19) Requisitos de entrega do repositório

O resultado final deve incluir:
- solução completa compilando
- backend funcional
- frontend funcional
- migrations criadas
- seed configurado
- testes automatizados passando
- documentação completa
- pipelines configuradas
- dockerização pronta
- ambiente local simples de subir
- backlog técnico-funcional rastreável em padrão Azure DevOps
- changelog atualizado
- casos de uso e manuais operacionais por funcionalidade crítica
- evidências de testes armazenadas
- relatórios de estimativa versus tempo real
- artefatos exportáveis para Azure DevOps

## 20) Fluxo de execução esperado para você, Codex

Quero que você trabalhe em fases bem definidas, documentando o avanço e atualizando os artefatos de gestão a cada evolução.

### Antes de iniciar cada fase
Você deve:
- criar ou atualizar épicos, features, PBIs/user stories e tasks relacionados
- registrar estimativas
- atualizar o kanban
- preparar critérios de aceite e casos de teste
- alinhar o escopo daquela fase na documentação

### Ao concluir cada fase
Você deve:
- atualizar changelog
- atualizar status do kanban
- atualizar documentação de observabilidade, eventos de log e auditoria da funcionalidade
- registrar tempo real executado
- anexar evidências de teste
- atualizar casos de uso e manuais operacionais
- atualizar release notes internas da fase

### Fase 1 — Fundação
- criar estrutura da solução
- configurar backend
- configurar frontend
- configurar PostgreSQL
- configurar autenticação
- configurar multi-tenancy base
- configurar documentação inicial
- configurar CI inicial

### Fase 2 — Núcleo do domínio
- tenants
- usuários
- permissões
- estrutura organizacional
- ativos
- localizações

### Fase 3 — Manutenção
- planos preventivos
- checklists
- solicitações
- ordens de serviço
- apontamentos
- workflow de OS

### Fase 4 — Estoque e custos
- peças
- estoque
- movimentações
- consumo em OS
- custos

### Fase 5 — Dashboards, relatórios e auditoria
- KPIs
- dashboards
- exportações
- auditoria
- notificações iniciais

### Fase 6 — Qualidade final
- seed robusto
- testes adicionais
- hardening de segurança
- revisão da documentação
- revisão de UX
- estabilização final

## 21) Critérios de aceite obrigatórios

Considere o trabalho concluído somente quando:

1. o projeto sobe localmente com poucos comandos
2. o banco PostgreSQL é criado e migrado corretamente
3. o seed da Empresa Modelo funciona
4. é possível autenticar e navegar no sistema
5. ativos, planos e ordens de serviço funcionam de ponta a ponta
6. o isolamento multi-tenant está coberto por testes
7. Playwright cobre os fluxos principais
8. a documentação permite outro desenvolvedor continuar o projeto
9. o CI executa build e testes
10. o sistema está minimamente pronto para demonstração comercial

## 22) Restrições importantes

- Não use microserviços nesta primeira versão.
- Não entregue apenas protótipos visuais sem backend real.
- Não entregue apenas endpoints sem frontend funcional.
- Não entregue apenas CRUDs superficiais sem regras de negócio.
- Não deixe autenticação, autorização e multi-tenant para “depois”.
- Não esconda lacunas importantes.
- Se algo não puder ser concluído, documente claramente o gap e a razão.

## 23) Expectativa de qualidade

Quero um projeto com cara de produto SaaS sério.

A solução deve ser:
- organizada
- elegante
- prática
- extensível
- segura
- bem testada
- bem documentada
- pronta para continuar evoluindo

## 24) Entregáveis que você deve gerar

Gere no repositório, no mínimo:
- código backend completo
- código frontend completo
- testes backend
- testes Playwright
- seeds completos
- migrations
- documentação técnica
- documentação operacional por funcionalidade
- dockerização
- pipelines CI/CD
- scripts auxiliares para setup local
- backlog estruturado em padrão Azure DevOps
- changelog contínuo
- test cases
- evidências de testes
- relatórios de estimado versus realizado
- templates e exports para Azure DevOps

## 25) Instrução final de execução

Comece criando a estrutura base da solução e o plano de implementação, depois execute a construção por fases até chegar em uma versão funcional e consistente.

Ao longo do desenvolvimento:
- mantenha a documentação sincronizada com o código
- mantenha testes automatizados úteis
- mantenha foco em domínio e qualidade
- prefira decisões pragmáticas e sustentáveis
- sempre que houver trade-off importante, registre em ADR
- trate gestão, backlog e evidências como parte do produto, não como anexo opcional
- mantenha os artefatos compatíveis com Azure DevOps desde o início
- sempre registre estimativa antes da execução e tempo real ao final

## 26) Bônus desejáveis

Se couber sem comprometer o escopo principal, inclua:
- dark mode preparado
- script de sincronização opcional com Azure DevOps via API
- dashboard interno de métricas de delivery (estimado vs realizado, throughput, lead time, cycle time)
- upload de imagens com política segura
- geração de QR Code para ativos
- dashboard com gráficos mais refinados
- importação de ativos por CSV
- arquitetura preparada para fila assíncrona futura
- arquitetura preparada para app mobile no futuro

## 27) Formato ideal da sua resposta inicial

Sua primeira resposta deve conter:
1. visão arquitetural resumida
2. estrutura de pastas
3. plano de implementação por fases
4. principais decisões técnicas assumidas
5. checklist do que será entregue

Depois disso, avance para a implementação real.

---

# Resumo executivo em uma frase

Desenvolva um **CMMS SaaS multi-tenant completo**, com **.NET 8 + PostgreSQL + EF Core + React + Playwright + testes + seed robusto + documentação + CI/CD**, usando **modular monolith**, com **isolamento de tenants**, **multi-idioma**, **alto padrão de engenharia** e **pronto para evolução real de produto**.
