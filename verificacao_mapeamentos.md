# 🔍 VERIFICAÇÃO DE MAPEAMENTOS FRONTEND vs BANCO

## Campos Potencialmente Desalinhados:

### ⚠️ CAMPOS QUE PODEM PRECISAR DE MAPEAMENTO:

#### 1. **Multa/Atraso** (JÁ CORRIGIDO):
- Frontend: `multa_atraso` → Banco: `percentual_multa_atraso` ✅

#### 2. **Dados de Seguros**:
- Frontend: `data_inicio_seguro_fianca` → Banco: `seguro_fianca_inicio` ✅
- Frontend: `data_fim_seguro_fianca` → Banco: `seguro_fianca_fim` ✅  
- Frontend: `data_inicio_seguro_incendio` → Banco: `seguro_incendio_inicio` ✅
- Frontend: `data_fim_seguro_incendio` → Banco: `seguro_incendio_fim` ✅

#### 3. **Outros campos que podem estar desalinhados**:
- Frontend: `numero_contrato` → Banco: `?` (verificar se existe)
- Frontend: `clausulas_adicionais` → Banco: `clausulas_adicionais` ✅
- Frontend: `tipo_garantia` → Banco: `tipo_garantia` ✅

## 🔧 AÇÃO NECESSÁRIA:

Vou expandir o mapeamento na função `handleContratoInputChange` para incluir os campos de seguro:

```typescript
const fieldMappings: { [key: string]: string } = {
  'multa_atraso': 'percentual_multa_atraso',
  'data_inicio_seguro_fianca': 'seguro_fianca_inicio',
  'data_fim_seguro_fianca': 'seguro_fianca_fim',
  'data_inicio_seguro_incendio': 'seguro_incendio_inicio', 
  'data_fim_seguro_incendio': 'seguro_incendio_fim'
};
```