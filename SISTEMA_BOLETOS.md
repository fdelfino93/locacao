# Sistema de Geração de Boletos para Locatários

## 📋 Resumo da Implementação

Sistema completo para geração de boletos de locação com cálculos específicos de acréscimos e descontos, implementado conforme as especificações fornecidas.

## 🗃️ Estrutura do Banco de Dados

### Tabelas Criadas

#### 1. **boletos**
- Armazena informações principais dos boletos
- Campos: id, contrato_id, mes_referencia, ano_referencia, data_vencimento, valor_total, status_pagamento, etc.
- Constraint única para evitar duplicação de boletos por período

#### 2. **componentes_boleto** 
- Detalha cada componente do boleto (aluguel, IPTU, seguros, etc.)
- Campos: id, boleto_id, tipo_componente, valor_original, valor_final, tem_acrescimo, acréscimos específicos
- Controla quais componentes podem ter acréscimos por atraso

#### 3. **historico_boletos**
- Registro completo de todas as ações realizadas nos boletos
- Auditoria de alterações, pagamentos, recálculos

#### 4. **indices_correcao**
- Armazena índices IGPM e IPCA por período
- Base para cálculos de correção monetária

### Campos Adicionados em `contratos`
- `valor_energia` - Valor da energia elétrica
- `valor_gas` - Valor do gás
- `valor_fci` - Valor do FCI
- `desconto_pontualidade` - Desconto por pontualidade
- `desconto_benfeitoria_1/2/3` - Descontos por benfeitorias

## 🔧 Componentes do Boleto

### Valores Base (Sempre Incluídos)
1. **Aluguel** - valor do contrato ✅ *Tem acréscimo*
2. **IPTU** - valor do contrato
3. **Seguro Fiança** - valor do contrato ✅ *Tem acréscimo*
4. **Seguro Incêndio** - valor do contrato ✅ *Tem acréscimo*
5. **Condomínio** - valor do contrato ✅ *Tem acréscimo*
6. **Energia Elétrica** - valor do contrato
7. **Gás** - valor do contrato  
8. **FCI** - valor do contrato ✅ *Tem acréscimo*

### Descontos (Valores Negativos)
- **Desconto Pontualidade**
- **Desconto Benfeitoria 1, 2, 3**

## 💰 Cálculo de Acréscimos por Atraso

### Regras Implementadas
- **Juros de mora**: 1% ao mês (0.033% ao dia)
- **Multa**: 2% sobre o valor em atraso
- **Correção monetária**: IGPM ou IPCA do período

### Componentes com Acréscimo
Apenas os seguintes componentes têm acréscimos aplicados:
- Aluguel
- FCI  
- Seguro Fiança
- Seguro Incêndio
- Condomínio

## 🚀 API Endpoints

Base URL: `http://localhost:5003/api`

### Boletos
- `POST /boletos/gerar` - Gerar novo boleto
- `GET /boletos/{id}` - Obter boleto específico
- `POST /boletos/{id}/recalcular` - Recalcular com acréscimos
- `GET /boletos/contrato/{id}` - Listar boletos de um contrato
- `POST /boletos/{id}/pagar` - Registrar pagamento

### Relatórios
- `GET /boletos/relatorio-mensal` - Relatório mensal
- `GET /indices-correcao` - Índices de correção disponíveis

### Exemplo de Uso da API

```python
# Gerar boleto
POST /api/boletos/gerar
{
    "contrato_id": 1,
    "mes_referencia": 12,
    "ano_referencia": 2024,
    "data_vencimento": "2024-12-10"
}

# Recalcular boleto em atraso
POST /api/boletos/123/recalcular
{
    "indice_correcao": "IGPM"
}

# Registrar pagamento
POST /api/boletos/123/pagar
{
    "data_pagamento": "2024-12-15",
    "observacoes": "Pago via PIX"
}
```

## 🎨 Frontend Components

### GeradorBoletos.tsx
Componente React para geração de boletos com:
- **Modo Individual**: Gerar boleto para um contrato específico
- **Modo Lote**: Gerar boletos para múltiplos contratos
- **Interface intuitiva** com seleção de período e configurações
- **Feedback visual** dos resultados

### Serviços TypeScript
- **boletosApi.ts** - Integração completa com API
- **Tipos TypeScript** - Definições completas em `Boleto.ts`

## 📁 Arquivos Criados/Modificados

### Backend
- `migrations/006_create_boletos_system.sql` - Migration completa
- `apis/boletos_api.py` - API Flask completa

### Frontend  
- `src/types/Boleto.ts` - Tipos TypeScript
- `src/services/boletosApi.ts` - Serviço de API
- `src/components/boletos/GeradorBoletos.tsx` - Componente React
- `src/types/index.ts` - Exportação dos tipos

## 🔄 Stored Procedures

### sp_gerar_boleto
Procedure principal que:
1. Cria o boleto na tabela `boletos`
2. Insere todos os componentes baseados no contrato
3. Calcula valor total
4. Registra no histórico
5. Retorna ID e valor do boleto criado

### Funcionalidades Avançadas
- **Validação de duplicatas** - Impede criar boleto duplicado para mesmo período
- **Cálculo automático** - Valores baseados no contrato
- **Auditoria completa** - Todas as ações são registradas
- **Transações seguras** - Rollback automático em caso de erro

## 📊 View: vw_boletos_completos

View que retorna boletos com todos os dados relacionados:
- Dados do contrato (valores, locatário, imóvel)
- Cálculo automático de dias de atraso
- Total de componentes e valores calculados

## 🧪 Como Testar

1. **Executar Migration**:
```sql
-- Execute o arquivo migrations/006_create_boletos_system.sql
```

2. **Iniciar API**:
```bash
cd apis
python boletos_api.py
```

3. **Testar Endpoints**:
```bash
# Health check
curl http://localhost:5003/health

# Listar índices
curl http://localhost:5003/api/indices-correcao
```

## 🎯 Recursos Implementados

✅ **Tabelas completas** com relacionamentos  
✅ **API RESTful** com todos os endpoints  
✅ **Cálculos de acréscimos** conforme regras  
✅ **Componente React** para geração  
✅ **Tipos TypeScript** completos  
✅ **Auditoria e histórico** completos  
✅ **Validações** de negócio  
✅ **Stored procedures** otimizadas  
✅ **Views** para consultas complexas  

## 🔮 Próximos Passos

1. **Integração com sistema de emails** para envio automático
2. **Geração de PDF** dos boletos
3. **Dashboard** de acompanhamento
4. **Integração bancária** para confirmação de pagamentos
5. **Relatórios avançados** com gráficos

## 📈 Benefícios

- **Automatização completa** da geração de boletos
- **Cálculos precisos** de acréscimos por atraso
- **Auditoria completa** de todas as operações
- **Interface moderna** e intuitiva
- **API robusta** para integrações
- **Escalabilidade** para grandes volumes

## 🛠️ Configurações

### Banco de Dados
- SQL Server com ODBC Driver 17
- Database: `LOCACAO`
- Autenticação Windows integrada

### API
- Flask 3.1.2
- Flask-CORS para requisições cross-origin
- PyODBC para conexão com SQL Server
- Porta padrão: 5003

### Frontend
- React + TypeScript
- Framer Motion para animações
- Shadcn/UI para componentes
- Toast notifications para feedback