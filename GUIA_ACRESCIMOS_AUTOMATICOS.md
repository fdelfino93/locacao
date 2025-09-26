# 🤖 Guia de Acréscimos Automáticos

## ✨ **O que foi implementado**

Sistema completo de cálculo automático de acréscimos por atraso para prestações de contas, com controle inteligente baseado no status da prestação.

---

## 🎯 **Funcionalidades Implementadas**

### ✅ **1. Visualização Melhorada na Lista**
- **Exibição de Acréscimos**: Mostra valor dos acréscimos abaixo do valor principal
- **Dias de Atraso**: Informa quantos dias a prestação está em atraso
- **Total com Acréscimos**: Calcula automaticamente o valor final
- **Status Lançada**: Adicionado suporte completo ao status `lancada`

**Exemplo Visual:**
```
💰 Valor Base: R$ 3.322,29
⚠️ +R$ 156,35 (82 dias)
📊 Total: R$ 3.478,64
```

### ✅ **2. Controle Inteligente de Botões**

#### **STATUS PENDENTE/EM ATRASO:**
- ✅ **Registrar Pagamento** (DollarSign icon)
- ✅ **Gerar Boleto** (FileText icon)
- ✅ **Editar** (Eye icon)
- ✅ **Ver PDF** (Receipt icon) - SEMPRE
- ✅ **Menu** (MoreVertical icon)

#### **STATUS PAGA:**
- ❌ Registrar Pagamento - OCULTO
- ❌ Gerar Boleto - OCULTO
- ✅ **Lançar Prestação** (CheckCircle icon) - SÓ APARECE AQUI
- ❌ Editar - OCULTO (não pode editar quando paga)
- ✅ **Ver PDF** (Receipt icon) - SEMPRE
- ✅ Menu

#### **STATUS LANÇADA:**
- ❌ Todos os botões de ação - OCULTOS
- ✅ **Ver PDF** - APENAS este botão

#### **STATUS CANCELADA:**
- ❌ Todos os botões de ação - OCULTOS
- ✅ **Ver PDF** - APENAS este botão

### ✅ **3. Job Automático de Acréscimos**

**Script**: `job_acrescimos_diario.py`

#### **Características:**
- 🕐 **Execução Diária**: Calcula acréscimos automaticamente
- 🎯 **Inteligente**: Só atualiza se houve mudança nos dias de atraso
- 🛑 **Para Automaticamente**: Quando status = `paga`, `lancada` ou `cancelada`
- 📊 **Log Completo**: Registra todas as atualizações
- 🔒 **Seguro**: Não quebra funcionalidades existentes

#### **Lógica de Cálculo:**
```python
# Multa: 2% sobre o valor
multa = valor * 0.02

# Juros: 1% ao mês (0.033% ao dia)
juros = valor * (dias_atraso * 0.00033)

# Total
acrescimos = multa + juros
```

---

## 🚀 **Como Usar**

### **1. Execução Manual do Job (Para Testes)**

#### **Pelo Terminal:**
```bash
cd C:\Users\matheus\Documents\Locacao\Locacao
python job_acrescimos_diario.py
```

#### **Pelo Script Batch:**
```bash
executar_job_acrescimos.bat
```

#### **Pela API:**
```bash
POST http://localhost:8000/api/job/calcular-acrescimos-automatico
```

### **2. Agendamento Automático**

#### **No Windows (Task Scheduler):**

1. Abrir **Task Scheduler** (Agendador de Tarefas)
2. **Criar Tarefa Básica**
3. **Configurações:**
   - **Nome**: "Job Acréscimos Diário"
   - **Quando**: "Diariamente"
   - **Horário**: "06:00" (sugestão)
   - **Ação**: "Iniciar um programa"
   - **Programa**: `C:\Users\matheus\Documents\Locacao\Locacao\executar_job_acrescimos.bat`

#### **No Linux (Cron):**
```bash
# Executar diariamente às 6:00
0 6 * * * cd /path/to/project && python job_acrescimos_diario.py
```

---

## 📊 **Monitoramento**

### **1. Logs do Job**
- **Arquivo**: `job_acrescimos.log`
- **Localização**: Pasta do projeto
- **Conteúdo**: Registra todas as execuções e atualizações

### **2. Tabela de Auditoria**
- **Tabela**: `LogAtualizacaoAcrescimos`
- **Criada automaticamente** pelo job
- **Registra**: Todas as mudanças de valores

### **3. Exemplo de Log:**
```
2025-01-25 06:00:01 - INFO - 🚀 Iniciando job de cálculo automático de acréscimos
2025-01-25 06:00:02 - INFO - Encontradas 15 prestações para verificar acréscimos
2025-01-25 06:00:03 - INFO - ✅ Prestação 42: Acréscimos atualizados de R$ 156.35 para R$ 157.40 (83 dias de atraso)
2025-01-25 06:00:04 - INFO - ✅ Job concluído! Processadas: 15, Atualizadas: 8, Duração: 2.1s
```

---

## 🔧 **Configurações**

### **Personalizar Percentual de Multa**
No banco, tabela `Contratos`, campo `percentual_multa_atraso`:
- **Padrão**: 2.0 (2%)
- **Por contrato**: Pode ser personalizado

### **Personalizar Horário do Job**
Ajustar no Task Scheduler ou cron conforme necessário.

---

## 🛡️ **Segurança e Backup**

### **Funcionalidades Preservadas:**
- ✅ Sistema de cálculo manual existente mantido
- ✅ APIs existentes inalteradas
- ✅ Interface funcionando normalmente
- ✅ PDFs gerando corretamente

### **Rollback (se necessário):**
1. Desabilitar job no Task Scheduler
2. Reverter arquivos modificados do Git
3. Sistema volta ao estado anterior

---

## 🐛 **Solução de Problemas**

### **Job não executa:**
1. Verificar se Python está instalado
2. Verificar variáveis de ambiente (`.env`)
3. Verificar conexão com banco
4. Consultar arquivo `job_acrescimos.log`

### **Acréscimos incorretos:**
1. Verificar percentual de multa no contrato
2. Verificar data de vencimento da prestação
3. Consultar tabela `LogAtualizacaoAcrescimos`

### **Botões errados:**
1. Verificar status da prestação no banco
2. Limpar cache do navegador
3. Verificar se tipos TypeScript estão atualizados

---

## 📞 **Suporte**

Para dúvidas ou problemas:
1. **Consultar logs** primeiro
2. **Verificar configurações** do ambiente
3. **Testar manualmente** o job
4. **Verificar conexão** com banco

---

## 🎉 **Resumo dos Benefícios**

✅ **Automatização Total**: Acréscimos calculados sem intervenção manual
✅ **Precisão Diária**: Valores sempre atualizados
✅ **Interface Inteligente**: Botões corretos para cada situação
✅ **Controle Total**: Para automaticamente quando necessário
✅ **Auditoria Completa**: Rastro de todas as alterações
✅ **Segurança**: Não quebra funcionalidades existentes

**Sistema profissional e robusto para gerenciamento de acréscimos!** 🚀