# 🚀 MELHORES PROMPTS PARA CLAUDE NO VS CODE - SISTEMA COBIMOB

## 📋 **ÍNDICE**
1. [Prompts Gerais](#prompts-gerais)
2. [Prompts para Frontend](#prompts-para-frontend)
3. [Prompts para Backend](#prompts-para-backend)
4. [Prompts para Banco de Dados](#prompts-para-banco-de-dados)
5. [Prompts para Debugging](#prompts-para-debugging)
6. [Estrutura de Pastas](#estrutura-de-pastas)

---

## 🎯 **PROMPTS GERAIS**

### **1. Análise de Código**
```
Analise este arquivo do sistema Cobimob e identifique:
1. Possíveis melhorias de performance
2. Problemas de segurança
3. Oportunidades de refatoração
4. Inconsistências com os padrões do projeto
5. Sugestões de otimização

[COLAR CÓDIGO AQUI]
```

### **2. Documentação Automática**
```
Gere documentação completa para este código do sistema Cobimob incluindo:
- Descrição da funcionalidade
- Parâmetros de entrada e saída
- Exemplos de uso
- Possíveis erros e como tratá-los
- Dependências necessárias

[COLAR CÓDIGO AQUI]
```

### **3. Revisão de Código**
```
Faça uma revisão completa deste código seguindo as melhores práticas:
- Clean Code
- SOLID principles
- Segurança
- Performance
- Maintainability
- Padrões do projeto Cobimob

Forneça feedback construtivo e sugestões específicas de melhoria.

[COLAR CÓDIGO AQUI]
```

---

## ⚛️ **PROMPTS PARA FRONTEND (React + TypeScript)**

### **1. Criação de Componente**
```
Crie um componente React TypeScript para o sistema Cobimob com as seguintes especificações:

**Funcionalidade**: [DESCREVER FUNCIONALIDADE]
**Props necessárias**: [LISTAR PROPS]
**Estado interno**: [DESCREVER ESTADO]
**Integração com API**: [ENDPOINTS A USAR]

Requisitos:
- Use Tailwind CSS + ShadCN para styling
- Implement loading states e error handling
- Adicione validações de formulário
- Use React Hook Form para formulários
- Aplique Framer Motion para animações
- Siga os padrões visuais do sistema existente
- Adicione TypeScript interfaces apropriadas
- Implemente acessibilidade (a11y)

Baseie-se nos componentes existentes do projeto para manter consistência.
```

### **2. Melhorar Componente Existente**
```
Melhore este componente React do sistema Cobimob:

**Melhorias desejadas**:
- [ ] Adicionar validação de formulário
- [ ] Melhorar UX/UI
- [ ] Implementar loading states
- [ ] Adicionar error handling
- [ ] Otimizar performance
- [ ] Implementar responsividade
- [ ] Adicionar animações suaves
- [ ] Melhorar TypeScript typing

**Componente atual**:
[COLAR CÓDIGO DO COMPONENTE]

Mantenha a funcionalidade existente e a compatibilidade com a API.
```

### **3. Formulário Complexo**
```
Crie um formulário React avançado para o sistema Cobimob com:

**Campos**: [LISTAR CAMPOS E TIPOS]
**Validações**: [ESPECIFICAR REGRAS]
**Campos condicionais**: [DESCREVER LÓGICA]
**Integração API**: [ENDPOINT E PAYLOAD]

Requisitos técnicos:
- React Hook Form + Zod para validação
- Campos condicionais baseados em estado
- Upload de arquivos (se necessário)
- Auto-save em drafts
- Máscaras de input (CPF, CNPJ, telefone, CEP)
- Busca automática de CEP
- Feedback visual em tempo real
- Acessibilidade completa
- Compatível com mobile

Use os componentes já existentes: InputWithIcon, Select, Textarea, etc.
```

### **4. Hook Customizado**
```
Crie um hook customizado React para o sistema Cobimob que:

**Funcionalidade**: [DESCREVER O QUE O HOOK FAZ]
**Parâmetros**: [LISTAR PARÂMETROS]
**Retorno**: [DESCREVER O QUE RETORNA]
**Estados gerenciados**: [LISTAR ESTADOS]

Requisitos:
- TypeScript completo
- Error handling robusto
- Loading states
- Caching quando apropriado
- Cleanup de recursos
- Testes unitários básicos
- Documentação JSDoc

Exemplo de uso esperado:
```typescript
const { data, loading, error, refetch } = useCustomHook(params);
```

### **5. Integração com API**
```
Crie a integração completa entre este componente React e a API do Cobimob:

**Componente**: [NOME DO COMPONENTE]
**Operações necessárias**: 
- [ ] GET - Listar dados
- [ ] POST - Criar novo
- [ ] PUT - Atualizar existente
- [ ] DELETE - Remover

**Endpoints**:
- GET: [URL]
- POST: [URL]
- PUT: [URL]
- DELETE: [URL]

Implemente:
- Loading states para todas as operações
- Error handling com mensagens amigáveis
- Success feedback
- Optimistic updates quando apropriado
- Retry logic para falhas de rede
- TypeScript interfaces para request/response
- Validação de dados antes do envio

Use o serviço apiService existente do projeto.
```

---

## 🔧 **PROMPTS PARA BACKEND (FastAPI + Python)**

### **1. Endpoint CRUD Completo**
```
Crie um endpoint CRUD completo para o sistema Cobimob FastAPI:

**Entidade**: [NOME DA ENTIDADE]
**Tabela do banco**: [NOME DA TABELA]
**Campos**: [LISTAR CAMPOS E TIPOS]

Requisitos:
- Modelos Pydantic para request/response
- Validações de entrada
- Tratamento de erros personalizado
- Documentação OpenAPI
- Logging adequado
- Paginação para listagem
- Filtros de busca
- Soft delete (campo ativo)
- Auditoria (created_at, updated_at)
- Relacionamentos com outras entidades
- Validação de regras de negócio

Siga os padrões dos endpoints existentes do projeto.
```

### **2. Repository Pattern**
```
Crie um repository para a entidade [NOME] no sistema Cobimob seguindo o padrão existente:

**Operações necessárias**:
- buscar_todos(filtros, paginacao)
- buscar_por_id(id)
- inserir(dados)
- atualizar(id, dados)
- excluir(id) - soft delete
- buscar_por_criterio(criterios)

**Tabela**: [NOME DA TABELA]
**Relacionamentos**: [DESCREVER RELACIONAMENTOS]

Requisitos:
- Use pyodbc para conexão
- Tratamento de exceções SQL
- Queries otimizadas
- Prevenção contra SQL Injection
- Logging de operações
- Transações quando necessário
- Documentação das funções
- Type hints completos

Baseie-se nos repositories existentes do projeto.
```

### **3. Validação de Dados**
```
Crie validações robustas para o sistema Cobimob:

**Dados a validar**: [ESPECIFICAR DADOS]
**Regras de negócio**: [LISTAR REGRAS]

Implemente:
- Validação de CPF/CNPJ
- Validação de email
- Validação de telefone
- Validação de CEP
- Validação de dados bancários
- Verificação de duplicatas
- Validação de relacionamentos (FK)
- Validação de datas (início < fim)
- Validação de valores monetários
- Sanitização de entrada
- Mensagens de erro claras e específicas

Use Pydantic validators e custom validators quando necessário.
```

### **4. Relatório Complexo**
```
Crie um endpoint para gerar relatório no sistema Cobimob:

**Tipo de relatório**: [DESCREVER RELATÓRIO]
**Filtros**: [LISTAR FILTROS DISPONÍVEIS]
**Formatos de saída**: PDF, Excel, CSV
**Agrupamentos**: [ESPECIFICAR AGRUPAMENTOS]

Requisitos:
- Query otimizada com JOINs
- Paginação para grandes volumes
- Cache de resultados quando apropriado
- Geração de PDF com ReportLab
- Geração de Excel com openpyxl
- Headers HTTP corretos para download
- Logging de geração de relatórios
- Validação de permissões
- Tratamento de timeout para queries longas

Baseie-se no sistema de prestação de contas existente.
```

### **5. Migração de Banco**
```
Crie um script de migração para o banco de dados do Cobimob:

**Alterações necessárias**:
- [ ] Criar tabelas: [LISTAR TABELAS]
- [ ] Modificar tabelas: [LISTAR MODIFICAÇÕES]
- [ ] Criar índices: [LISTAR ÍNDICES]
- [ ] Migrar dados: [DESCREVER MIGRAÇÃO]
- [ ] Criar foreign keys: [LISTAR FKs]

Requisitos:
- Script idempotente (pode rodar múltiplas vezes)
- Rollback automático em caso de erro
- Backup automático antes da execução
- Validação de integridade dos dados
- Log detalhado de operações
- Verificação de pré-requisitos
- Estimativa de tempo de execução
- Confirmation prompt antes da execução

Siga o padrão dos scripts existentes na pasta scripts/.
```

---

## 🗄️ **PROMPTS PARA BANCO DE DADOS**

### **1. Otimização de Query**
```
Otimize esta query SQL do sistema Cobimob:

**Query atual**:
```sql
[COLAR QUERY AQUI]
```

**Problemas identificados**: [LISTAR PROBLEMAS SE CONHECIDOS]
**Volume de dados**: [ESTIMAR VOLUME]
**Frequência de execução**: [DESCREVER FREQUÊNCIA]

Forneça:
- Query otimizada
- Índices necessários
- Explicação das melhorias
- Plano de execução estimado
- Métricas de performance esperadas
- Alternativas de implementação

Considere as tabelas e relacionamentos do sistema Cobimob.
```

### **2. Modelagem de Dados**
```
Crie a modelagem de dados para [FUNCIONALIDADE] no sistema Cobimob:

**Requisitos funcionais**:
- [LISTAR REQUISITOS]

**Relacionamentos necessários**:
- [DESCREVER RELACIONAMENTOS]

**Volume estimado**:
- [ESTIMAR REGISTROS]

Forneça:
- Diagrama ER (em texto/markdown)
- Scripts CREATE TABLE
- Índices recomendados
- Foreign keys e constraints
- Triggers se necessário
- Procedures para operações complexas
- Considerações de performance
- Estratégia de backup/recovery

Mantenha consistência com o padrão existente do banco.
```

### **3. Análise de Performance**
```
Analise a performance do banco de dados Cobimob:

**Tabelas principais**: Clientes, Inquilinos, Imoveis, Contratos, Pagamentos
**Operações mais frequentes**: [LISTAR OPERAÇÕES]
**Problemas reportados**: [DESCREVER PROBLEMAS]

Forneça:
- Análise de índices existentes
- Sugestões de novos índices
- Identificação de queries lentas
- Recomendações de otimização
- Estratégias de particionamento
- Configurações de servidor
- Plano de monitoramento
- Métricas importantes a acompanhar
```

---

## 🔍 **PROMPTS PARA DEBUGGING**

### **1. Análise de Erro**
```
Analise este erro do sistema Cobimob e forneça soluções:

**Erro**:
```
[COLAR LOG DE ERRO AQUI]
```

**Contexto**:
- Sistema: [Frontend/Backend/Database]
- Ação do usuário: [DESCREVER AÇÃO]
- Ambiente: [Desenvolvimento/Produção]
- Frequência: [OCASIONAL/RECORRENTE]

Forneça:
- Causa raiz provável
- Soluções passo-a-passo
- Prevenção de recorrência
- Logs/debugging adicionais necessários
- Testes para validar a correção
- Impacto no sistema
- Prioridade de correção

Considere o contexto do sistema imobiliário Cobimob.
```

### **2. Code Review Focado**
```
Faça uma revisão focada em bugs potenciais neste código do Cobimob:

**Código**:
[COLAR CÓDIGO AQUI]

**Foco da análise**:
- [ ] Memory leaks
- [ ] Race conditions
- [ ] Null pointer exceptions
- [ ] Input validation
- [ ] Security vulnerabilities
- [ ] Performance bottlenecks
- [ ] Error handling
- [ ] Edge cases

Forneça:
- Lista priorizada de issues
- Sugestões de correção
- Testes para validar correções
- Refatorações preventivas
- Melhores práticas aplicáveis
```

### **3. Troubleshooting Guide**
```
Crie um guia de troubleshooting para [FUNCIONALIDADE] do sistema Cobimob:

**Funcionalidade**: [DESCREVER FUNCIONALIDADE]
**Problemas comuns**: [LISTAR SE CONHECIDOS]

Estruture o guia com:
- Symptoms → Possible Causes → Solutions
- Logs importantes para verificar
- Comandos de diagnóstico
- Checklist de verificações
- Escalation criteria
- Preventive measures
- Recovery procedures
- Contact information

Inclua exemplos específicos do sistema Cobimob.
```

---

## 📁 **ESTRUTURA DE PASTAS E ORGANIZAÇÃO**

### **Estrutura Recomendada para Novos Componentes**:
```
frontend/src/
├── components/
│   ├── forms/           # Formulários específicos
│   ├── ui/             # Componentes base reutilizáveis
│   ├── sections/       # Seções de página
│   └── shared/         # Componentes compartilhados
├── hooks/              # Custom hooks
├── services/           # Integração com APIs
├── utils/              # Funções utilitárias
├── types/              # TypeScript interfaces
└── constants/          # Constantes do sistema
```

### **Convenções de Nomenclatura**:
- **Componentes**: PascalCase (ex: `ModernClienteForm`)
- **Hooks**: camelCase iniciando com "use" (ex: `useClienteData`)
- **Arquivos**: kebab-case (ex: `cliente-form.tsx`)
- **Funções**: camelCase (ex: `formatarCPF`)
- **Constantes**: UPPER_SNAKE_CASE (ex: `API_BASE_URL`)

---

## 🎯 **PROMPTS ESPECIALIZADOS POR FUNCIONALIDADE**

### **Para Inquilinos**:
```
Crie/melhore a funcionalidade de inquilinos do sistema Cobimob com:
- Tipo PF/PJ com representante legal
- Endereço estruturado
- Sistema de fiadores
- Cadastro de moradores
- Dados bancários estruturados
- Observações

[ESPECIFICAR REQUISITOS DETALHADOS]
```

### **Para Contratos**:
```
Implemente os planos de locação estruturados no sistema Cobimob:
- Locação Completo Opção 1: 100% primeiro + 10% demais
- Locação Completo Opção 2: 16% todos
- Locação Básico Opção 1: 50% primeiro + 5% demais  
- Locação Básico Opção 2: 8% todos

Com antecipação de encargos e retidos estruturados.
```

### **Para Relatórios**:
```
Crie relatório [TIPO] para o sistema Cobimob com:
- Filtros avançados
- Agrupamentos dinâmicos
- Export PDF/Excel
- Gráficos interativos
- Performance otimizada

[ESPECIFICAR DADOS E LAYOUT]
```

---

## 💡 **DICAS PARA MELHORES RESULTADOS**

1. **Seja Específico**: Sempre forneça contexto detalhado sobre o sistema Cobimob
2. **Use Exemplos**: Cole código existente como referência
3. **Defina Requisitos**: Liste claramente o que espera como resultado
4. **Mencione Padrões**: Peça para seguir os padrões já estabelecidos no projeto
5. **Inclua Testes**: Sempre peça para incluir validações e testes
6. **Considere Performance**: Mencione performance e otimização
7. **Pense em Segurança**: Sempre inclua aspectos de segurança
8. **Documentação**: Peça documentação junto com o código
9. **Error Handling**: Sempre solicite tratamento de erros robusto
10. **TypeScript**: Peça tipagem completa para frontend

---

## 🚀 **PROMPT MASTER PARA TAREFAS COMPLEXAS**

```
Atue como um Senior Full Stack Developer especializado em sistemas imobiliários. 

Você está trabalhando no sistema Cobimob, uma aplicação para gestão de locações com:
- Frontend: React + TypeScript + Tailwind CSS + ShadCN
- Backend: FastAPI + Python
- Database: SQL Server
- Estrutura: Clientes → Imóveis → Contratos → Inquilinos → Pagamentos

TAREFA: [DESCREVER TAREFA DETALHADAMENTE]

CONTEXTO TÉCNICO:
- Mantenha consistência com código existente
- Use padrões estabelecidos no projeto
- Implemente error handling robusto
- Adicione validações adequadas
- Considere performance e segurança
- Inclua TypeScript typing completo
- Siga princípios de Clean Code
- Adicione documentação necessária

ENTREGÁVEIS ESPERADOS:
1. Código limpo e funcional
2. Explicação das decisões técnicas
3. Instruções de implementação
4. Considerações de testing
5. Possíveis melhorias futuras

Analise o problema, planeje a solução e implemente seguindo as melhores práticas.
```

---

**Última atualização**: Janeiro 2025  
**Versão**: 2.0  
**Sistema**: Cobimob - Gestão de Locações