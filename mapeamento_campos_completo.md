# 🔍 MAPEAMENTO COMPLETO DOS CAMPOS - BANCO DE DADOS

## ✅ CAMPOS QUE JÁ EXISTEM NO BANCO:

### **Tabela CONTRATOS (70 campos encontrados):**

#### Campos Básicos (já existem):
- ✅ `data_assinatura` → **Contratos.data_assinatura** (date)
- ✅ `ultimo_reajuste` → **Contratos.ultimo_reajuste** (date)
- ✅ `proximo_reajuste` → **Contratos.proximo_reajuste** (date)
- ✅ `renovacao_automatica` → **Contratos.renovacao_automatica** (nvarchar)
- ✅ `vencimento_dia` → **Contratos.vencimento_dia** (int)
- ✅ `bonificacao` → **Contratos.bonificacao** (decimal)

#### Campos Financeiros (já existem):
- ✅ `taxa_administracao` → **Contratos.taxa_administracao** (decimal)
- ✅ `fundo_conservacao` → **Contratos.fundo_conservacao** (decimal)
- ✅ `valor_seguro_fianca` → **Contratos.valor_seguro_fianca** (decimal)
- ✅ `valor_seguro_incendio` → **Contratos.valor_seguro_incendio** (decimal)
- ✅ `percentual_multa_atraso` → **Contratos.percentual_multa_atraso** (decimal)

#### Campos de Datas de Seguros (já existem):
- ✅ `seguro_fianca_inicio` → **Contratos.seguro_fianca_inicio** (date)
- ✅ `seguro_fianca_fim` → **Contratos.seguro_fianca_fim** (date)
- ✅ `seguro_incendio_inicio` → **Contratos.seguro_incendio_inicio** (date)
- ✅ `seguro_incendio_fim` → **Contratos.seguro_incendio_fim** (date)

#### Campos de Checkboxes (já existem):
- ✅ `retido_fci` → **Contratos.retido_fci** (bit)
- ✅ `retido_iptu` → **Contratos.retido_iptu** (bit)
- ✅ `retido_condominio` → **Contratos.retido_condominio** (bit)
- ✅ `retido_seguro_fianca` → **Contratos.retido_seguro_fianca** (bit)
- ✅ `retido_seguro_incendio` → **Contratos.retido_seguro_incendio** (bit)
- ✅ `antecipa_condominio` → **Contratos.antecipa_condominio** (bit)
- ✅ `antecipa_seguro_fianca` → **Contratos.antecipa_seguro_fianca** (bit)
- ✅ `antecipa_seguro_incendio` → **Contratos.antecipa_seguro_incendio** (bit)

## ❌ CAMPOS QUE NÃO EXISTEM (precisam ser criados):

### **Na Tabela CONTRATOS:**
- ❌ `data_entrega_chaves` → **CRIAR EM CONTRATOS** (date)
- ❌ `proximo_reajuste_automatico` → **CRIAR EM CONTRATOS** (bit)
- ❌ `periodo_contrato` → **CRIAR EM CONTRATOS** (int)
- ❌ `tempo_renovacao` → **CRIAR EM CONTRATOS** (int)
- ❌ `tempo_reajuste` → **CRIAR EM CONTRATOS** (int)
- ❌ `data_inicio_iptu` → **CRIAR EM CONTRATOS** (date)
- ❌ `data_fim_iptu` → **CRIAR EM CONTRATOS** (date)
- ❌ `parcelas_iptu` → **CRIAR EM CONTRATOS** (int)
- ❌ `valor_fci` → **CRIAR EM CONTRATOS** (decimal) OU **USAR TABELA VALORES**
- ❌ `parcelas_seguro_fianca` → **CRIAR EM CONTRATOS** (int)
- ❌ `parcelas_seguro_incendio` → **CRIAR EM CONTRATOS** (int)

## 🔄 ALTERNATIVAS USANDO TABELAS RELACIONADAS:

### **Tabela SEGUROS (6 campos):**
```sql
id: int
id_contrato: int  
seguradora: varchar
valor: decimal
vigencia_inicio: date
vigencia_fim: date
```
**Pode ser usada para**: Dados de seguros com tipos específicos

### **Tabela VALORES (6 campos):**
```sql
id: int
id_contrato: int
tipo: varchar
valor: decimal  
data_inicio: date
data_fim: date
```
**Pode ser usada para**: 
- `valor_fci` → tipo='FCI'
- Outros valores específicos por tipo

### **Tabela DATASCONTRATO (5 campos):**
```sql
id: int
id_contrato: int
data_ultimo_reajuste: date
data_vistoria: date  
data_encerramento: date
```
**Pode ser usada para**: Datas específicas do contrato

## 🎯 RECOMENDAÇÃO FINAL:

### **ESTRATÉGIA HÍBRIDA RECOMENDADA:**

#### **1. ADICIONAR NA TABELA CONTRATOS:**
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
```

#### **2. USAR TABELA VALORES PARA:**
- `valor_fci` → INSERT INTO Valores (id_contrato, tipo, valor) VALUES (?, 'FCI', ?)

#### **3. CAMPOS JÁ MAPEADOS (não precisam alteração):**
- ✅ 23 campos já existem na tabela Contratos
- ✅ Podem ser usados imediatamente no ContratoUpdate

## 📋 PRÓXIMOS PASSOS:

1. **Execute o script SQL** para adicionar os 10 campos faltantes
2. **Remova os asteriscos** dos campos que já existem no banco
3. **Mantenha asteriscos** apenas nos 10 campos que serão criados
4. **Teste** o sistema completo

**Total de campos analisados**: 70 campos na tabela Contratos + tabelas relacionadas
**Campos já existem**: 23 campos ✅
**Campos para criar**: 10 campos ❌