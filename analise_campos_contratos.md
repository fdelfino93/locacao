# Análise de Campos - Tabela Contratos vs ContratoUpdate

## ✅ Campos que JÁ EXISTEM no banco (podem ser usados imediatamente):

### Campos Básicos:
- `id_locatario` ✅ (como id_locatario)
- `id_imovel` ✅ (como id_imovel) 
- `valor_aluguel` ✅ (como valor_aluguel)
- `data_inicio` ✅ (como data_inicio)
- `data_fim` ✅ (como data_fim)
- `tipo_garantia` ✅ (como tipo_garantia)
- `valor_condominio` ✅ (como valor_condominio)
- `valor_iptu` ✅ (como valor_iptu)
- `percentual_reajuste` ✅ (como percentual_reajuste)
- `indice_reajuste` ✅ (campo não encontrado no schema - precisa verificar)

### Campos de Datas:
- `data_assinatura` ✅ (como data_assinatura)
- `ultimo_reajuste` ✅ (como ultimo_reajuste)  
- `proximo_reajuste` ✅ (como proximo_reajuste)

### Campos de Configuração:
- `renovacao_automatica` ✅ (como renovacao_automatica - nvarchar)
- `vencimento_dia` ✅ (como vencimento_dia)
- `bonificacao` ✅ (como bonificacao)

### Campos Financeiros:
- `taxa_administracao` ✅ (como taxa_administracao) 
- `fundo_conservacao` ✅ (como fundo_conservacao)
- `valor_seguro_fianca` ✅ (como valor_seguro_fianca)
- `valor_seguro_incendio` ✅ (como valor_seguro_incendio)
- `percentual_multa_atraso` ✅ (como percentual_multa_atraso)

### Campos de Datas de Seguros:
- `seguro_fianca_inicio` ✅ (como seguro_fianca_inicio)
- `seguro_fianca_fim` ✅ (como seguro_fianca_fim) 
- `seguro_incendio_inicio` ✅ (como seguro_incendio_inicio)
- `seguro_incendio_fim` ✅ (como seguro_incendio_fim)

### Campos de Checkboxes (Retidos):
- `retido_fci` ✅ (como retido_fci - bit)
- `retido_iptu` ✅ (como retido_iptu - bit)
- `retido_condominio` ✅ (como retido_condominio - bit) 
- `retido_seguro_fianca` ✅ (como retido_seguro_fianca - bit)
- `retido_seguro_incendio` ✅ (como retido_seguro_incendio - bit)

### Campos de Checkboxes (Antecipação):
- `antecipa_condominio` ✅ (como antecipa_condominio - bit)
- `antecipa_seguro_fianca` ✅ (como antecipa_seguro_fianca - bit)
- `antecipa_seguro_incendio` ✅ (como antecipa_seguro_incendio - bit)

## ❌ Campos que NÃO EXISTEM no banco (precisam ser criados):

### Campos de Configuração Temporal:
- `data_entrega_chaves` ❌ *
- `proximo_reajuste_automatico` ❌ *
- `periodo_contrato` ❌ *
- `tempo_renovacao` ❌ *
- `tempo_reajuste` ❌ *

### Campos IPTU:
- `data_inicio_iptu` ❌ *
- `data_fim_iptu` ❌ *  
- `parcelas_iptu` ❌ *

### Campos de Valores Específicos:
- `valor_fci` ❌ * (pode usar tabela Valores com tipo='FCI')

### Campos que podem estar com nomes diferentes:
- `data_vencimento` ⚠️ (verificar se é dia_vencimento_aluguel)
- `prazo_reajuste` ⚠️ (pode ser tempo_reajuste)
- `valor_seguro` ⚠️ (campo genérico, temos específicos)

## 🔧 Script para Adicionar Campos Faltantes:

```sql
USE locacao;

-- Adicionar campos que realmente não existem
ALTER TABLE Contratos ADD data_entrega_chaves DATE NULL;
ALTER TABLE Contratos ADD proximo_reajuste_automatico BIT NULL;
ALTER TABLE Contratos ADD periodo_contrato INT NULL;
ALTER TABLE Contratos ADD tempo_renovacao INT NULL;
ALTER TABLE Contratos ADD tempo_reajuste INT NULL;
ALTER TABLE Contratos ADD data_inicio_iptu DATE NULL;
ALTER TABLE Contratos ADD data_fim_iptu DATE NULL;
ALTER TABLE Contratos ADD parcelas_iptu INT NULL;

SELECT 'Campos adicionados com sucesso!' as Resultado;
```

## 📋 Ações Necessárias:

1. **Execute o script SQL acima** para adicionar os campos marcados com *
2. **Verifique os campos com ⚠️** se têm nomes diferentes no banco
3. **Para valor_fci**: considere usar a tabela `Valores` existente
4. **Teste** a funcionalidade de edição após executar o script

## 🎯 Resultado Esperado:
Após executar o script, todos os campos do ContratoUpdate terão correspondência no banco de dados, permitindo que as edições sejam salvas corretamente.