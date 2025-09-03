# 📋 11 CAMPOS QUE PRECISAM SER CRIADOS NO BANCO

## ❌ CAMPOS QUE NÃO EXISTEM (marcados com * no código):

### 1. **Campos de Configuração Temporal:**
- `data_entrega_chaves` (DATE) - Data de entrega das chaves
- `proximo_reajuste_automatico` (BIT) - Flag para reajuste automático
- `periodo_contrato` (INT) - Duração do contrato em meses
- `tempo_renovacao` (INT) - Período de renovação em meses
- `tempo_reajuste` (INT) - Período entre reajustes em meses

### 2. **Campos Específicos do IPTU:**
- `data_inicio_iptu` (DATE) - Data de início do IPTU
- `data_fim_iptu` (DATE) - Data de fim do IPTU
- `parcelas_iptu` (INT) - Número de parcelas do IPTU

### 3. **Campos de Parcelas de Seguros:**
- `parcelas_seguro_fianca` (INT) - Parcelas do seguro fiança
- `parcelas_seguro_incendio` (INT) - Parcelas do seguro incêndio

### 4. **Campo FCI:**
- `valor_fci` (DECIMAL) - Valor do FCI

## 🔧 SCRIPT SQL PARA CRIAR:

```sql
ALTER TABLE Contratos ADD data_entrega_chaves DATE NULL;
ALTER TABLE Contratos ADD proximo_reajuste_automatico BIT NULL;
ALTER TABLE Contratos ADD periodo_contrato INT NULL;
ALTER TABLE Contratos ADD tempo_renovacao INT NULL;
ALTER TABLE Contratos ADD tempo_reajuste INT NULL;
ALTER TABLE Contratos ADD data_inicio_iptu DATE NULL;
ALTER TABLE Contratos ADD data_fim_iptu DATE NULL;
ALTER TABLE Contratos ADD parcelas_iptu INT NULL;
ALTER TABLE Contratos ADD parcelas_seguro_fianca INT NULL;
ALTER TABLE Contratos ADD parcelas_seguro_incendio INT NULL;
ALTER TABLE Contratos ADD valor_fci DECIMAL(10,2) NULL;
```

## 📁 **Arquivo Completo:**
Execute o arquivo: **`script_final_campos_faltantes.sql`**