# Prompt mestre para o Codex — Desenvolvimento de um CMMS SaaS Multi-Tenant (v8)

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



## 7.14. Administração de configurações, parâmetros, catálogos, chaves e observabilidade operacional
Implementar um módulo administrativo robusto para evitar dependências hardcoded e dar autonomia operacional à plataforma e aos tenants.

### Diretrizes obrigatórias
- tudo que for **catálogo de negócio**, lista administrável, tabela de domínio variável, parâmetro operacional ou comportamento configurável deve ser **externalizado**
- evitar hardcode no frontend e no backend para itens que podem variar por tenant, país, idioma, operação, integração ou regra de negócio
- somente invariantes realmente técnicas e estruturais podem permanecer em código
- sempre que possível, preferir **catálogos gerenciáveis** em vez de listas estáticas no frontend
- listas exibidas no frontend devem vir da API ou de contratos compartilhados; não duplicar opções manualmente em múltiplos componentes
- permitir distinção entre:
  - configuração global da plataforma
  - configuração por tenant
  - configuração por módulo
  - configuração por ambiente
  - configuração segura/sigilosa
  - catálogo de domínio
  - feature flag

### O módulo deve contemplar, no mínimo
- cadastro e gestão de parâmetros do sistema
- cadastro e gestão de catálogos/listas de negócio
- suporte a listas equivalentes a enums administráveis quando isso fizer sentido
- gestão de feature flags
- gestão de templates
- gestão de integrações
- gestão de chaves, segredos e credenciais de integração
- gestão de configuração visual e institucional do tenant
- gestão de políticas operacionais por tenant
- visualização de logs, auditorias, transações e execuções técnicas
- trilha de alteração de configuração com before/after

### Catálogos/listas administráveis
Criar suporte para catálogos administráveis, com versionamento e auditoria, para itens como:
- prioridades
- tipos de OS
- classificações de solicitação
- categorias
- criticidades
- motivos de cancelamento
- causas de falha
- ações corretivas padrão
- unidades de medida
- status configuráveis quando a regra permitir
- tipos de checklist/pergunta quando a regra permitir
- códigos auxiliares, tags e classificadores de negócio

Regras:
- o frontend deve consumir esses catálogos dinamicamente
- o backend deve validar o uso correto dos catálogos
- deve existir controle para ativar/desativar itens
- deve existir ordenação, agrupamento e tradução dos itens
- deve haver proteção para impedir remoção de itens em uso
- deve haver seed inicial consistente para todos os catálogos essenciais

### Gestão de chaves, segredos e configurações sensíveis
Implementar uma área administrativa para gestão de configurações e segredos, com forte controle de acesso e observabilidade.

#### Requisitos obrigatórios
- permitir cadastro de chaves e segredos por escopo:
  - plataforma
  - ambiente
  - tenant
  - integração
  - módulo
- armazenar segredos de forma protegida, preferencialmente criptografados em repouso
- exibir segredos mascarados no frontend
- permitir rotação, ativação, expiração e versionamento de segredos
- registrar quem criou, alterou, desativou ou revelou parcialmente um segredo
- nunca registrar o valor completo do segredo em logs
- permitir associação de segredo a integrações, jobs, providers, SMTP, APIs externas, webhooks e storage
- manter compatibilidade arquitetural para futura integração com cofre externo de segredos, sem depender disso na primeira entrega

### Área administrativa no frontend
Deve existir uma área administrativa clara e navegável para operação do sistema, com no mínimo:
- configurações gerais da plataforma
- configurações do tenant
- catálogos/listas administráveis
- feature flags
- integrações
- chaves e segredos
- monitoramento de jobs
- visualização de logs operacionais
- visualização de logs de erro
- visualização de logs transacionais
- visualização de trilhas de auditoria
- visualização de transações por correlação
- filtros por tenant, módulo, entidade, usuário, período e correlation id

### Regras de UX e segurança para configuração
- somente perfis autorizados podem acessar áreas administrativas sensíveis
- toda alteração crítica deve pedir confirmação apropriada
- alterações sensíveis devem gerar evidência before/after
- alterações de configuração devem ser descritas em linguagem de negócio na documentação da entrega
- o sistema deve diferenciar claramente configuração editável de configuração somente leitura
- toda tela administrativa deve possuir ajuda contextual e passo a passo resumido de uso quando necessário


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


### Componentização, configuração externa e eliminação de hardcode
- todo o projeto deve ser **componentizado**, principalmente o frontend
- construir componentes reutilizáveis, composáveis e testáveis
- usar design system consistente para botões, inputs, tabelas, filtros, drawers, modais, cards, badges, timelines, viewers e dashboards
- evitar duplicação de markup, regras de UI e lógica de formulário
- extrair lógica compartilhada para hooks, serviços, utilitários, adapters e componentes de domínio
- nada que seja de negócio, parametrização, lista administrável, texto operacional, template, status configurável ou integração deve ficar hardcoded sem justificativa explícita
- sempre que possível, listas equivalentes a enums de negócio devem ser administráveis e carregadas dinamicamente
- quando um enum técnico precisar existir em código, documentar por que ele não é um catálogo administrável
- preferir contratos tipados compartilhados entre frontend e backend para catálogos, statuses, permissões e configurações
- todo comportamento configurável deve possuir estratégia clara de persistência, cache, invalidação, auditoria e fallback
- toda configuração que impacte operação deve poder ser consultada de forma segura pela interface administrativa

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

#### Templates obrigatórios de log/auditoria por caso de uso
Para **cada caso de uso relevante**, gere um arquivo de especificação de observabilidade em `docs/observability/<modulo>/<caso-de-uso>.md` contendo pelo menos o seguinte template:

```md
# Observabilidade — <Caso de Uso>

## Identificação
- Módulo:
- Funcionalidade:
- Caso de uso:
- Work Item relacionado:
- Endpoint / Command / Query:
- Perfis autorizados:
- Sensibilidade dos dados:

## Eventos de negócio
| Evento | Quando ocorre | Nível | Auditoria before/after | Obrigatório | Observações |
|---|---|---|---|---|---|

## Campos mínimos do contexto
- TenantId
- UserId
- UserName
- CorrelationId
- TraceId
- RequestPath
- Module
- Feature
- EntityName
- EntityId
- ExecutionTimeMs
- Result

## Snapshot before/after
- Fonte do before:
- Fonte do after:
- Campos mascarados:
- Campos ignorados:
- Estratégia de serialização:

## Erros esperados
| Código | Cenário | Log Level | Mensagem técnica | Mensagem amigável | Ação operacional |
|---|---|---|---|---|---|

## Métricas
- Tempo máximo esperado:
- Eventos críticos a monitorar:
- Integrações impactadas:
- KPIs/SLAs relacionados:

## Testes de observabilidade
- Teste unitário:
- Teste de integração:
- Teste E2E:
- Evidência gerada:
```

Além disso, para toda mudança de estado, gere um artefato resumido no formato:

```json
{
  "eventName": "WorkOrderStatusChanged",
  "module": "WorkOrders",
  "feature": "ChangeStatus",
  "tenantId": "<tenant-id>",
  "userId": "<user-id>",
  "entityName": "WorkOrder",
  "entityId": "<id>",
  "operation": "StatusTransition",
  "before": { "status": "Open" },
  "after": { "status": "InProgress" },
  "changedFields": ["status"],
  "source": "API",
  "isSuccess": true,
  "correlationId": "<correlation-id>",
  "occurredAtUtc": "<utc>"
}
```

#### Estrutura obrigatória de auditoria no PostgreSQL
Implemente uma estrutura **explícita e consultável** para auditoria, preferencialmente com tabelas dedicadas em vez de depender somente do sink de logs.

##### Tabela principal de auditoria
Crie tabela equivalente a:

```sql
CREATE TABLE audit.audit_log (
    id                  UUID PRIMARY KEY,
    occurred_at_utc     TIMESTAMPTZ NOT NULL,
    tenant_id           UUID NOT NULL,
    user_id             UUID NULL,
    user_name           VARCHAR(200) NULL,
    module              VARCHAR(120) NOT NULL,
    feature             VARCHAR(160) NOT NULL,
    entity_name         VARCHAR(160) NOT NULL,
    entity_id           VARCHAR(120) NOT NULL,
    action              VARCHAR(80) NOT NULL,
    result              VARCHAR(40) NOT NULL,
    source              VARCHAR(40) NOT NULL,
    correlation_id      VARCHAR(100) NOT NULL,
    trace_id            VARCHAR(100) NULL,
    request_path        VARCHAR(300) NULL,
    ip_address          VARCHAR(64) NULL,
    user_agent          TEXT NULL,
    reason              TEXT NULL,
    before_data         JSONB NULL,
    after_data          JSONB NULL,
    changed_fields      JSONB NULL,
    metadata            JSONB NULL,
    error_code          VARCHAR(80) NULL,
    error_message       TEXT NULL,
    created_at_utc      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

##### Índices obrigatórios
Crie índices equivalentes a:
- `(tenant_id, occurred_at_utc DESC)`
- `(tenant_id, entity_name, entity_id)`
- `(tenant_id, module, feature, occurred_at_utc DESC)`
- `(correlation_id)`
- `(user_id, occurred_at_utc DESC)`
- índice GIN para `changed_fields`, `before_data`, `after_data` e `metadata` quando justificável

##### Tabelas complementares recomendadas
Quando fizer sentido, criar também:
- `audit.integration_log`
- `audit.security_log`
- `audit.job_execution_log`

Cada uma deve seguir a mesma filosofia: dados consultáveis, rastreáveis, filtráveis por tenant e vinculáveis por `correlation_id`.

##### Convenções obrigatórias
- usar schema dedicado `audit`
- armazenar payloads em `JSONB`
- mascarar dados sensíveis antes da persistência
- não armazenar senhas, segredos, tokens completos ou dados indevidos
- suportar retenção e arquivamento futuro
- suportar filtros por período, módulo, entidade, ação, usuário e correlação

#### Padrão técnico exato de implementação com Serilog + middleware + MediatR pipeline
A implementação de observabilidade deve seguir **um padrão técnico transversal, previsível e repetível**.

##### Serilog
Implementar:
- `UseSerilog()` no bootstrap da aplicação
- configuração por `appsettings.*.json`
- enrichers customizados para `TenantId`, `UserId`, `CorrelationId`, `TraceId`, `Module`, `Feature`, `Environment`, `Version`
- sinks mínimos:
  - Console
  - arquivo local rotacionado
  - estrutura preparada para sink corporativo futuro

##### Middlewares obrigatórios
Implementar, no mínimo:
1. **CorrelationIdMiddleware**
   - cria ou propaga `X-Correlation-Id`
   - injeta no contexto do request e no logger

2. **TenantResolutionMiddleware**
   - resolve tenant por token/claim/subdomínio/configuração
   - injeta `TenantId` no contexto atual
   - bloqueia inconsistências de tenant

3. **RequestContextLoggingMiddleware**
   - registra início/fim de request
   - registra duração
   - registra rota, método, status code e usuário autenticado

4. **GlobalExceptionHandlingMiddleware**
   - trata exceções centralmente
   - converte para `ProblemDetails`
   - grava log estruturado de erro
   - anexa `CorrelationId` à resposta

##### Behaviors obrigatórios do MediatR
Registrar behaviors, nesta ordem lógica aproximada:
1. `CorrelationBehavior`
2. `ValidationBehavior`
3. `AuthorizationBehavior`
4. `PerformanceBehavior`
5. `LoggingBehavior`
6. `TransactionBehavior`
7. `AuditBehavior`

##### Responsabilidades mínimas dos behaviors
- **ValidationBehavior**: valida requests com FluentValidation
- **AuthorizationBehavior**: garante permissão e escopo do tenant
- **PerformanceBehavior**: mede tempo do caso de uso e emite warning acima do threshold
- **LoggingBehavior**: registra início/fim do caso de uso, dados não sensíveis, resultado e duração
- **TransactionBehavior**: controla transação em comandos mutáveis
- **AuditBehavior**: captura snapshots before/after e persiste em `audit.audit_log` quando houver mudança de estado

##### Contratos técnicos recomendados
Criar contratos/abstrações equivalentes a:
- `ICurrentTenant`
- `ICurrentUser`
- `ICorrelationContext`
- `IAuditLogger`
- `IOperationalLogger`
- `ISecurityLogger`
- `IIntegrationLogger`
- `IEntitySnapshotProvider`
- `IAuditableEntity`

##### Convenção obrigatória por comando mutável
Todo `Command` que altera estado relevante deve:
- declarar claramente a entidade raiz afetada
- permitir captura de estado anterior
- informar razão/motivo quando aplicável
- gerar evento de auditoria consistente
- possuir teste automatizado validando log/auditoria

##### Evidências obrigatórias de observabilidade
Para cada funcionalidade entregue, gerar em `management/azure-devops/evidence/`:
- captura de log do fluxo feliz
- captura de log do fluxo de erro
- evidência de auditoria before/after
- evidência de `CorrelationId`
- evidência de multi-tenant correto nos logs

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



### Diretriz obrigatória de componentização do frontend
O frontend deve ser construído como uma aplicação **fortemente componentizada**, orientada a reutilização, legibilidade, testabilidade e economia de contexto.

#### Regras obrigatórias
- separar claramente:
  - componentes de UI base
  - componentes compartilhados de negócio
  - layouts
  - páginas
  - hooks
  - services/api clients
  - schemas de validação
  - stores e query keys
- criar componentes reutilizáveis para:
  - tabelas
  - filtros
  - formulários
  - selects dinâmicos
  - campos dependentes
  - status badges
  - timelines de auditoria
  - visualizadores de logs/transações
  - drawers/modais de detalhe
  - cabeçalhos de tela
  - blocos de KPI
- não repetir listas estáticas em múltiplas páginas
- consumir listas, catálogos, enums administráveis e configurações a partir de APIs centralizadas
- toda página deve ser montada pela composição de componentes menores, e não por arquivos gigantes
- componentes críticos devem ter testes próprios quando aplicável
- documentar os componentes e padrões principais em guidelines e na documentação do frontend

#### Área administrativa e operacional obrigatória
Além das telas de negócio do CMMS, o frontend deve incluir telas administrativas para:
- parâmetros do sistema
- catálogos/listas administráveis
- feature flags
- integrações
- gestão de segredos com exibição mascarada
- logs de erro
- logs operacionais
- logs transacionais
- trilhas de auditoria
- rastreamento por correlation id
- monitoramento de jobs/processamentos


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
- `docs/configuration-management.md`
- `docs/observability.md`
- `docs/admin-console.md`
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
- estratégia de componentização do frontend
- estratégia de configuração externa, catálogos, feature flags e segredos
- manual da área administrativa e operacional
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


### 13.1.1) Nomenclatura exata dos work items
Padronize **IDs lógicos, títulos e tags** de forma rígida.

#### Prefixos obrigatórios
- `EPIC-CMMS-<NNN>`
- `FEAT-CMMS-<MOD>-<NNN>`
- `US-CMMS-<MOD>-<NNN>`
- `PBI-CMMS-<MOD>-<NNN>`
- `TASK-CMMS-<MOD>-<NNN>`
- `BUG-CMMS-<MOD>-<NNN>`
- `TC-CMMS-<MOD>-<NNN>`
- `CHG-CMMS-<YYYYMMDD>-<NN>`

#### Abreviações de módulo sugeridas
- `PLT` = Plataforma / Tenant / Identity
- `AST` = Ativos
- `WKO` = Work Orders / Ordens de Serviço
- `PMN` = Preventiva
- `REQ` = Solicitações
- `CHK` = Checklists / Inspeções
- `INV` = Estoque / Inventário
- `RPT` = Relatórios / Dashboards
- `OBS` = Observabilidade / Auditoria
- `INT` = Integrações
- `DOC` = Documentação
- `DEV` = DevOps / Pipeline / Infra

#### Padrão de título
Use:
- **Epic**: `<Área de Negócio> — <Objetivo macro>`
- **Feature**: `[<Módulo>] <Capacidade>`
- **User Story / PBI**: `[<Módulo>] Como <persona>, quero <objetivo>, para <valor>`
- **Task**: `[<Módulo>] <Ação técnica> em <artefato/componente>`
- **Bug**: `[<Módulo>] Corrigir <comportamento incorreto>`
- **Test Case**: `[<Módulo>] Validar <cenário>`

Exemplos:
- `EPIC-CMMS-001 | Gestão de Ativos — Cadastro, hierarquia e rastreabilidade`
- `FEAT-CMMS-AST-001 | [Ativos] Cadastro e edição de ativos`
- `US-CMMS-AST-001 | [Ativos] Como gestor de manutenção, quero cadastrar ativos, para controlar histórico e criticidade`
- `TASK-CMMS-AST-003 | [Ativos] Implementar endpoint POST /api/assets`
- `TC-CMMS-AST-007 | [Ativos] Validar cadastro de ativo com TenantId correto`

### 13.1.2) Templates prontos de work items
Todos os templates devem existir também como arquivos versionados em `management/azure-devops/templates/`.

#### Template de Epic
```md
# EPIC-CMMS-XXX | <Título>

## Objetivo
## Problema/Oportunidade
## Valor de negócio
## Escopo
## Fora de escopo
## KPIs/Resultados esperados
## Riscos
## Dependências
## Features filhas
## Definition of Ready
## Definition of Done
## Estimativa macro
## Evidências esperadas
```

#### Template de Feature
```md
# FEAT-CMMS-<MOD>-XXX | [<Módulo>] <Capacidade>

## Objetivo
## Escopo funcional
## Dependências
## User Stories relacionadas
## Restrições
## Critérios de aceite
## Definition of Ready
## Definition of Done
## Estimativa
```

#### Template de User Story / PBI
```md
# US-CMMS-<MOD>-XXX | [<Módulo>] Como <persona>, quero <objetivo>, para <valor>

## Contexto
## Descrição
## Persona
## Valor esperado
## Regras de negócio
## Critérios de aceite (Given/When/Then)
## Casos negativos
## Dependências
## Riscos
## Test Cases vinculados
## Evidências esperadas
## Definition of Ready
## Definition of Done
## Estimativa inicial (h)
## Tempo real (h)
```

#### Template de Task
```md
# TASK-CMMS-<MOD>-XXX | [<Módulo>] <Ação técnica>

## Objetivo técnico
## Escopo
## Artefatos afetados
## Passos de implementação
## Critérios técnicos de aceite
## Dependências
## Bloqueios
## Estimativa inicial (h)
## Tempo real (h)
## Evidências
```

#### Template de Bug
```md
# BUG-CMMS-<MOD>-XXX | [<Módulo>] Corrigir <defeito>

## Sintoma
## Comportamento atual
## Comportamento esperado
## Severidade
## Impacto
## Passos para reproduzir
## Causa raiz
## Correção proposta
## Testes de regressão
## Evidências
## Estimativa inicial (h)
## Tempo real (h)
```

#### Template de Test Case
```md
# TC-CMMS-<MOD>-XXX | [<Módulo>] Validar <cenário>

## Objetivo
## Pré-condições
## Massa de teste
## Passos
## Resultado esperado
## Tipo de teste
## Automação prevista
## Evidência de execução
## Work Item relacionado
```

### 13.1.3) Modelo CSV de importação para Azure DevOps
Gerar arquivo exemplo em `management/azure-devops/exports/azure-devops-import-example.csv` com colunas compatíveis com importação.

#### Colunas mínimas
- `Work Item Type`
- `Title`
- `State`
- `Area Path`
- `Iteration Path`
- `Assigned To`
- `Description`
- `Acceptance Criteria`
- `Tags`
- `Priority`
- `Effort`
- `Original Estimate`
- `Remaining Work`
- `Completed Work`
- `Parent`
- `Repro Steps`
- `Test Steps`

#### Exemplo de linha
```csv
Work Item Type,Title,State,Area Path,Iteration Path,Assigned To,Description,Acceptance Criteria,Tags,Priority,Effort,Original Estimate,Remaining Work,Completed Work,Parent,Repro Steps,Test Steps
User Story,"[Ativos] Como gestor de manutenção, quero cadastrar ativos, para controlar histórico e criticidade",New,"CMMS\Produto","CMMS\Release 1\Sprint 03","", "Cadastrar ativos com criticidade, localização e histórico.","Given um usuário admin do tenant, when cadastrar um ativo válido, then o ativo deve ser salvo com TenantId correto.","CMMS;Ativos;MultiTenant",2,5,8,8,0,"FEAT-CMMS-AST-001","",""
```

#### Regras obrigatórias
- manter um export consolidado por sprint e outro acumulado
- manter `Parent` preenchido com o ID lógico do item pai
- manter descrição limpa, sem HTML desnecessário
- manter critérios de aceite verificáveis
- manter tags por módulo, release, sprint e tipo

### 13.1.4) Estrutura de sprints / iterations
Adote estrutura inicial de **sprints de 2 semanas**, com iterações versionadas e previsíveis.

#### Árvore sugerida
- `CMMS`
  - `Release 1`
    - `Sprint 00 - Foundation`
    - `Sprint 01 - Tenant and Identity`
    - `Sprint 02 - Organizational Structure`
    - `Sprint 03 - Asset Management`
    - `Sprint 04 - Preventive Maintenance`
    - `Sprint 05 - Work Orders`
    - `Sprint 06 - Requests and Checklists`
    - `Sprint 07 - Inventory`
    - `Sprint 08 - Dashboards and Reports`
    - `Sprint 09 - Hardening, Audit and Release`

#### Regras
- toda User Story/PBI deve pertencer a uma sprint
- toda Task deve herdar ou repetir a sprint do item pai
- bugs críticos devem entrar na sprint corrente ou em trilha de hotfix
- manter `board.md` e `iterations.md` refletindo a iteração real

### 13.1.5) Regras de DoR / DoD por tipo de item
Defina e mantenha arquivos específicos em `management/azure-devops/definitions/`.

#### Epic — Definition of Ready
- objetivo claro
- valor de negócio explícito
- escopo e fora de escopo definidos
- dependências principais conhecidas
- KPIs esperados definidos

#### Epic — Definition of Done
- features filhas concluídas
- aceite funcional consolidado
- documentação macro atualizada
- changelog e release notes atualizados
- métricas de entrega registradas

#### Feature — Definition of Ready
- escopo funcional claro
- dependências identificadas
- critérios de aceite definidos
- impacto arquitetural conhecido
- riscos principais mapeados

#### Feature — Definition of Done
- user stories concluídas
- evidências anexadas
- documentação de módulo atualizada
- regressão principal executada

#### User Story / PBI — Definition of Ready
- descrição completa
- critérios de aceite verificáveis
- regras de negócio definidas
- dependências mapeadas
- UX/API suficientemente definida
- massa de teste mínima prevista

#### User Story / PBI — Definition of Done
- código implementado e revisado
- testes unitários/integrados/E2E conforme aplicável
- evidências anexadas
- logs/auditoria implementados
- documentação operacional atualizada
- changelog atualizado
- tempo real apontado
- sem defeitos críticos abertos

#### Task — Definition of Ready
- vinculada a item pai
- objetivo técnico claro
- artefatos alvo definidos
- sem bloqueio impeditivo aberto

#### Task — Definition of Done
- implementação concluída
- build local/pipeline ok
- testes da mudança executados
- evidências registradas
- tempo real apontado

#### Bug — Definition of Ready
- sintoma reproduzível
- impacto conhecido
- evidência mínima anexada
- severidade definida

#### Bug — Definition of Done
- causa raiz identificada
- correção aplicada
- regressão associada automatizada ou documentada
- evidência pós-correção anexada

#### Test Case — Definition of Ready
- cenário claro
- pré-condições definidas
- resultado esperado verificável

#### Test Case — Definition of Done
- executado ou automatizado
- evidência anexada
- vinculado ao item funcional correspondente
- resultado registrado

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
- descrição da entrega em **linguagem de negócio**, explicando claramente o que foi implementado, alterado ou corrigido, qual problema foi resolvido e qual valor isso gera para o usuário, evitando jargão técnico desnecessário
- fluxo operacional
- guia de operação
- troubleshooting básico
- dependências
- perfis que podem executar a ação
- instruções claras para **desenvolvedor testar** a funcionalidade localmente, com pré-requisitos, massa de teste, passo a passo e resultado esperado
- instruções claras para **QA testar** a funcionalidade, com cenários positivos, negativos, regressivos, massa de teste, passo a passo e resultado esperado
- impactos conhecidos e pontos que exigem regressão em funcionalidades relacionadas
- evidências da funcionalidade funcionando

### Pacote obrigatório de entrega por funcionalidade
Toda entrega funcional deve gerar, no mínimo, os seguintes artefatos documentais:
- **Resumo executivo da entrega em linguagem de negócio**
- **Instruções passo a passo para DEV validar**
- **Instruções passo a passo para QA validar**
- **Lista de cenários de regressão afetados**
- **Evidências de execução dos testes**
- **Registro claro do que não pode ter sido quebrado**

### Regra de clareza documental
A descrição da entrega deve ser escrita para que um gestor, usuário-chave, PO, QA ou outro desenvolvedor entenda rapidamente:
- o que mudou
- por que mudou
- como usar
- como testar
- o que precisa ser revalidado

Evite descrever a entrega apenas com termos como "criado endpoint", "ajustado handler", "refatorado service". Sempre traduza isso para o impacto de negócio da funcionalidade.


## 13.4) Arquivos de diretrizes por contexto / pastas para reduzir custo cognitivo, tokens e ambiguidade
Crie uma camada explícita de **guidelines por contexto**, organizada por pasta, para orientar o Codex e qualquer desenvolvedor humano com máxima objetividade.

### Objetivo
Esses arquivos devem:
- reduzir ambiguidade
- evitar reinterpretação repetida do projeto
- economizar tokens e pensamento em solicitações futuras
- manter consistência de código, arquitetura, nomenclatura e testes
- acelerar onboarding e manutenção
- servir como “fonte de verdade” contextual por módulo

### Estrutura sugerida
```text
/guidelines
  README.md
  /global
    coding-standards.md
    naming-conventions.md
    architecture-principles.md
    security-guidelines.md
    observability-guidelines.md
    documentation-guidelines.md
  /backend
    api-guidelines.md
    application-guidelines.md
    domain-guidelines.md
    infrastructure-guidelines.md
    configuration-management-guidelines.md
    efcore-postgresql-guidelines.md
    mediatr-guidelines.md
  /frontend
    react-guidelines.md
    ui-ux-guidelines.md
    componentization-guidelines.md
    forms-validation-guidelines.md
    i18n-guidelines.md
    playwright-guidelines.md
  /devops
    ci-cd-guidelines.md
    branching-versioning-guidelines.md
    docker-guidelines.md
    secrets-and-keys-guidelines.md
    admin-console-guidelines.md
    deployment-profiles-guidelines.md
    vps-deploy-guidelines.md
    azure-devops-governance-guidelines.md
  /testing
    unit-test-guidelines.md
    integration-test-guidelines.md
    regression-guidelines.md
    evidence-guidelines.md
  /modules
    /assets
      module-guidelines.md
    /work-orders
      module-guidelines.md
    /preventive-maintenance
      module-guidelines.md
    /inventory
      module-guidelines.md
```

### Conteúdo mínimo de cada guideline
Cada arquivo de diretriz deve conter:
- objetivo
- escopo
- o que fazer
- o que não fazer
- padrões obrigatórios
- exemplos
- armadilhas comuns
- checklist rápido
- links para documentos correlatos

### Regra operacional para o Codex
Sempre que evoluir uma funcionalidade, consulte e atualize apenas os arquivos de diretriz do contexto impactado, evitando carregar contexto desnecessário. Isso é obrigatório para manter **eficácia, qualidade do código e economia de tokens**.

### Regras adicionais
- cada módulo de negócio deve ter ao menos um `module-guidelines.md`
- cada guideline deve ser curta, objetiva e acionável
- duplicação entre guidelines deve ser evitada
- a guideline global deve referenciar as específicas, e não repetir tudo
- toda decisão nova recorrente deve ser consolidada em guideline, não apenas no chat


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

### 14.6. Regra inegociável de não regressão por entrega
Toda funcionalidade nova, alteração, correção ou refatoração deve ser validada de forma a garantir que **nada do que já estava funcionando seja quebrado**.

Isso é obrigatório e deve incluir:
- execução dos testes automatizados impactados
- atualização da suíte de regressão quando necessário
- execução dos testes E2E/Playwright dos fluxos relacionados
- revisão dos cenários críticos afetados pela mudança
- documentação explícita do que foi testado e do que foi preservado

### 14.7. Evidências mínimas por entrega
Para cada entrega, gere evidências rastreáveis contendo:
- quais cenários foram testados
- quem pode executar cada validação (DEV, QA ou ambos)
- ambiente de execução
- massa de teste utilizada
- passo a passo de validação
- resultado esperado
- resultado obtido
- anexos possíveis: screenshots, logs, vídeos, relatórios de teste, saídas de pipeline

### 14.8. Instruções obrigatórias para DEV e QA
Para cada funcionalidade entregue, produza instruções claras e numeradas com passo a passo para:

#### DEV
- como subir o ambiente
- como preparar dados
- como acessar a funcionalidade
- como validar o comportamento esperado
- quais logs e tabelas consultar se algo falhar
- quais regressões relacionadas precisam ser verificadas

#### QA
- pré-condições
- perfil necessário
- massa de dados
- passos exatos de execução
- resultado esperado em cada etapa
- cenários negativos
- cenários de regressão obrigatórios
- evidências que devem ser capturadas

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

**Diretriz obrigatória de containerização:**
todo o projeto deve rodar integralmente em Docker, sem depender de instalações manuais no host além de Docker/Docker Compose, para permitir implantação simples em VPS e padronização entre ambientes. Nenhuma funcionalidade crítica pode exigir execução local fora de containers para funcionar corretamente.

Entregar:
- `Dockerfile` backend
- `Dockerfile` frontend
- `docker-compose.yml` para desenvolvimento
- `docker-compose.hml.yml` para homologação
- `docker-compose.prod.yml` para produção
- instruções de deploy documentadas

### Perfis obrigatórios de ambiente
Definir e documentar perfis claros de execução para:
- **DEV**: ambiente voltado para desenvolvimento local, com hot reload quando possível, logs verbosos, dados de teste, seed opcional e facilidades para depuração
- **HML**: ambiente de homologação o mais próximo possível de produção, com configurações realistas, dados controlados, validação de regressão e suporte a smoke tests
- **PRD**: ambiente produtivo, com foco em segurança, performance, observabilidade, resiliência e configurações restritivas

### Requisitos mínimos de Docker / VPS
- todos os serviços principais devem subir por Docker Compose ou estrutura equivalente claramente documentada
- padronizar variáveis de ambiente por perfil (`.env.dev`, `.env.hml`, `.env.prod` ou convenção equivalente)
- documentar portas, volumes, networks e dependências entre serviços
- prever healthchecks para serviços críticos
- prever política de restart para produção
- permitir execução em VPS Linux comum com passos claros de provisionamento
- documentar estratégia de persistência para PostgreSQL, arquivos, anexos e logs
- documentar estratégia de atualização/deploy sem quebra
- documentar rollback mínimo
- documentar como executar migrations e seed em cada ambiente
- documentar como publicar frontend e backend atrás de proxy reverso quando aplicável
- evitar segredos hardcoded; usar variáveis de ambiente, secrets ou mecanismo equivalente
- garantir que testes automatizados possam rodar em ambiente containerizado

### Critérios de aceite de containerização
- qualquer desenvolvedor deve conseguir subir o ambiente DEV com poucos comandos
- o ambiente HML deve reproduzir o comportamento esperado para validação funcional
- o ambiente PRD deve estar pronto para uso em VPS, com instruções passo a passo
- a documentação deve explicar como subir, parar, rebuildar, atualizar e inspecionar logs
- a aplicação deve funcionar de forma consistente entre DEV, HML e PRD, mudando apenas configurações de ambiente

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
    /architecture
    /manuals
    /use-cases
    /runbooks
    /observability
    /test-evidence
  /guidelines
    /global
    /backend
    /frontend
    /devops
    /testing
    /modules
  /management
    /azure-devops
    /kanban
    /metrics
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
- guidelines versionadas por contexto/pasta
- templates e exportações Azure DevOps prontos
- evidências de observabilidade e auditoria por fluxo crítico
- evidências de testes armazenadas
- instruções passo a passo para DEV e QA validarem cada entrega
- descrições das entregas em linguagem de negócio e não apenas técnica
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
- atualizar ou criar guideline do contexto afetado (`/guidelines/...`) quando surgir padrão novo ou decisão recorrente
- registrar tempo real executado
- anexar evidências de teste
- descrever a entrega em linguagem de negócio, explicando o que mudou para o usuário e para a operação
- gerar instruções passo a passo para DEV validar localmente
- gerar instruções passo a passo para QA validar funcionalmente e regressivamente
- explicitar o que foi revalidado para garantir que nada do legado funcional foi quebrado
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
10. cada entrega foi testada sem quebrar funcionalidades já existentes
11. cada entrega possui descrição em linguagem de negócio, clara para áreas não técnicas
12. cada entrega possui instruções passo a passo para DEV e QA testarem
13. há evidências rastreáveis de validação funcional, regressiva e operacional
14. o sistema está minimamente pronto para demonstração comercial

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


---

## 30) Diretriz obrigatória de aprendizado contínuo, prevenção de retrabalho e evolução das diretrizes

Esta diretriz é **obrigatória** e deve ser aplicada durante todo o ciclo de vida do projeto.

Sempre que você, Codex, encontrar qualquer um dos cenários abaixo, deve agir de forma sistemática para que o mesmo problema não volte a acontecer:
- dificuldade técnica recorrente
- comando que falha ou não funciona no ambiente
- retrabalho causado por ausência de contexto ou padrão
- erro de build, execução, teste, lint, migração, seed, pipeline ou deploy
- solução de contorno criada para destravar a implementação
- incompatibilidade de versão, dependência, sistema operacional ou ferramenta
- ambiguidade de requisito que tenha exigido interpretação adicional
- falha causada por ausência de documentação, script, template, guideline ou automação

### 30.1. Regra de ouro
Se um problema aconteceu uma vez e foi entendido ou contornado, você deve:
1. registrar o ocorrido
2. documentar a causa raiz
3. documentar a solução adotada
4. documentar como evitar a recorrência
5. atualizar a diretriz correta no repositório
6. ajustar scripts, templates, comandos, checklists, testes ou ferramentas para prevenir repetição
7. deixar explícito qual comando, fluxo ou abordagem deve ser usada dali em diante

O objetivo é fazer com que o próprio repositório fique progressivamente mais inteligente, previsível, econômico em tokens, e mais eficiente para o desenvolvimento futuro.

### 30.2. Proibição de repetição cega
Não repita tentativas ineficazes de forma cega.

Se um comando, abordagem, script, teste, sequência de build, formato de migration, estratégia de seed, padrão de execução ou automação falhar e a causa já tiver sido identificada, você deve:
- parar de insistir no padrão que falhou
- registrar explicitamente que aquela abordagem não deve mais ser repetida naquele contexto
- atualizar a diretriz contextual correspondente
- preferir o novo caminho validado e documentado

### 30.3. Atualização obrigatória das diretrizes por contexto
Toda lição aprendida deve ser refletida no arquivo de diretriz mais apropriado, para que o conhecimento fique distribuído por contexto e seja rapidamente encontrado.

Exemplos de arquivos/pastas que devem existir e ser mantidos:
- `/guidelines/README.md`
- `/guidelines/architecture/`
- `/guidelines/backend/`
- `/guidelines/frontend/`
- `/guidelines/database/`
- `/guidelines/testing/`
- `/guidelines/devops/`
- `/guidelines/azure-devops/`
- `/guidelines/observability/`
- `/guidelines/security/`
- `/guidelines/i18n/`
- `/guidelines/domain/`
- `/guidelines/workflows/`
- `/guidelines/lessons-learned/`
- `/guidelines/context-map/`
- `/guidelines/commands/`
- `/guidelines/troubleshooting/`

Cada diretriz deve conter, quando fizer sentido:
- objetivo
- escopo
- padrão oficial adotado
- anti-patterns
- comandos válidos
- comandos proibidos ou obsoletos
- exemplos corretos
- armadilhas comuns
- troubleshooting
- referências cruzadas para outros contextos

### 30.4. Arquivo obrigatório de lições aprendidas
Mantenha um artefato versionado para lições aprendidas, por exemplo:
- `/guidelines/lessons-learned/lessons-learned.md`
- `/guidelines/lessons-learned/known-issues.md`
- `/guidelines/lessons-learned/command-decisions.md`

Cada registro deve conter no mínimo:
- ID
- data
- contexto/módulo
- problema encontrado
- impacto
- causa raiz
- solução aplicada
- ação preventiva
- diretriz atualizada
- scripts/testes/ferramentas alterados
- status: prevenido / monitorando / pendente

### 30.5. Integração com changelog e Azure DevOps
Sempre que uma dificuldade relevante gerar aprendizado permanente, crie ou atualize os artefatos de gestão relacionados:
- changelog da entrega
- task técnica de melhoria interna
- bug, quando aplicável
- PBI/User Story de hardening, quando aplicável
- evidência do ajuste realizado
- documentação funcional e operacional impactada

Quando houver integração com Azure DevOps, isso deve poder ser exportado ou sincronizado.

---

## 31) Diretriz obrigatória para criação de skills, ferramentas auxiliares e automações reutilizáveis

Você está autorizado e incentivado a criar **skills, ferramentas, scripts, utilitários, templates, scaffolds, geradores e automações reutilizáveis** sempre que isso reduzir retrabalho, aumentar qualidade, acelerar desenvolvimento e diminuir custo cognitivo/tokens.

### 31.1. O que pode ser criado
Você pode criar, sempre que fizer sentido:
- scripts de setup local
- scripts de build e validação
- scripts de seed e reset de ambiente
- scripts de execução de testes segmentados
- geradores de boilerplate
- templates de work items
- templates de documentação
- templates de casos de teste
- helpers para i18n
- helpers para auditoria e logging
- middlewares reutilizáveis
- pipelines compartilhados
- actions e comandos padronizados
- ferramentas de validação arquitetural
- validadores de convenção de nomes
- geradores de changelog
- geradores de evidências de testes
- kits de scaffolding para novos módulos
- utilitários para exportação/importação Azure DevOps

### 31.2. Regras para essas skills/ferramentas
Toda skill, ferramenta ou automação criada deve:
- resolver um problema real e recorrente
- ser versionada no repositório
- ser documentada claramente
- ter instruções de uso
- informar entradas e saídas
- ser segura e previsível
- evitar efeitos colaterais ocultos
- ser testável sempre que possível
- reduzir esforço manual
- melhorar consistência de implementação

### 31.3. Estrutura recomendada para skills e ferramentas
Crie uma estrutura como referência, podendo ajustar conforme necessário:
- `/tools/`
- `/tools/scripts/`
- `/tools/scaffolding/`
- `/tools/testing/`
- `/tools/devops/`
- `/tools/azure-devops/`
- `/tools/reporting/`
- `/tools/data/`
- `/skills/`
- `/skills/backend/`
- `/skills/frontend/`
- `/skills/database/`
- `/skills/testing/`
- `/skills/documentation/`
- `/skills/qa/`
- `/skills/devops/`

### 31.4. Manifesto mínimo por ferramenta/skill
Cada ferramenta relevante deve possuir um arquivo de apoio contendo no mínimo:
- nome
- objetivo
- quando usar
- quando não usar
- pré-requisitos
- parâmetros
- exemplos de execução
- limitações conhecidas
- troubleshooting
- histórico de evolução

### 31.5. Critério de criação automática
Se durante o desenvolvimento você perceber que uma mesma tarefa está sendo repetida manualmente duas ou mais vezes, avalie obrigatoriamente se vale criar:
- um script
- um helper
- um template
- uma guideline contextual
- uma skill reutilizável

Prefira automatizar o que é repetitivo, propenso a erro humano ou custoso em tempo/tokens.

---

## 32) Diretriz obrigatória para decisões operacionais baseadas em evidência

Toda mudança de fluxo, comando, script ou ferramenta decorrente de erro ou dificuldade deve ficar apoiada em evidência.

Registre, quando aplicável:
- saída de erro relevante
- comparação entre comando que falhou e comando que funcionou
- ambiente onde ocorreu
- versão da ferramenta envolvida
- impacto observado
- evidência da solução validada

Essas evidências devem alimentar:
- troubleshooting
- lessons learned
- guidelines contextuais
- manuais do desenvolvedor
- instruções de QA/DEV

---

## 33) Entregáveis adicionais obrigatórios relacionados a melhoria contínua

Além dos demais entregáveis já definidos, o projeto deve manter e evoluir continuamente:
- diretrizes por contexto/pasta
- catálogo de comandos válidos
- catálogo de comandos proibidos/obsoletos
- troubleshooting por módulo
- base de lições aprendidas
- biblioteca de templates
- kit de scaffolding para novas funcionalidades
- utilitários para QA e evidência de testes
- automações para reduzir retrabalho

Esses artefatos fazem parte do produto de engenharia e não são opcionais.

---

## 34) Critério de aceite adicional para o Codex

Uma entrega só pode ser considerada realmente concluída quando, além dos critérios anteriores:
- a funcionalidade estiver implementada
- os testes pertinentes tiverem passado
- não houver regressão conhecida no que já existia
- a explicação em linguagem de negócio estiver pronta
- o passo a passo para DEV e QA estiver claro
- os logs, auditorias e evidências estiverem adequados
- as diretrizes contextuais tiverem sido atualizadas se houve aprendizado novo
- o repositório estiver melhor preparado para a próxima entrega do que estava antes desta

Em outras palavras: **cada entrega deve melhorar não apenas o produto, mas também o próprio sistema de desenvolvimento**.
