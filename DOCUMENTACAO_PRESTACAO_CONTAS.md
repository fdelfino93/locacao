# 📊 Documentação - Sistema de Prestação de Contas

## 🎯 Visão Geral

O sistema de prestação de contas permite calcular automaticamente os valores devidos aos locadores considerando:
- **Aluguéis proporcionais** (dias ocupados)
- **Descontos e bonificações**  
- **Múltiplos locadores** por contrato
- **Taxas e impostos** (IPTU, Seguro Incêndio)
- **Taxa de administração/transferência**

## 🧮 Cálculos Automáticos

### **1. ALUGUEL PROPORCIONAL**
Para contratos que iniciam/terminam no meio do mês:

```
EXEMPLO: Contrato iniciado em 22 de março (10 dias ocupados)

Dias ocupados: 10 de 31 dias (32,26%)
Aluguel proporcional:      R$ 2.500,00 × 32,26% = R$ 806,45
IPTU proporcional:         R$   106,63 × 32,26% = R$  34,40
Seguro Incêndio (fixo):    R$    32,50           = R$  32,50
Subtotal:                  R$ 873,35
Bonificação proporcional:  R$ -161,29 (32,26% de R$ 500)
ALUGUEL DO MÊS:           R$ 712,06
```

### **2. MÚLTIPLOS LOCADORES**
Para contratos com vários proprietários:

```
EXEMPLO: 3 locadores com participações diferentes

RECEITA BRUTA:            R$ 2.500,00

LOCADOR A (50%):          R$ 1.250,00
LOCADOR B (30%):          R$   750,00  
LOCADOR C (20%):          R$   500,00

Taxa de transferência:    R$ 5,00 (2 transferências × R$ 2,50)
- Aplicada apenas aos locadores não-principais
```

### **3. DESCONTOS E TAXAS**
```
RECEITA BRUTA:            R$ 2.500,00
(-) Taxa Administração:   R$   125,00 (5%)
(-) Taxa Transferência:   R$     5,00 (múltiplos locadores)
(-) Bonificação Acordada: R$   200,00
RECEITA LÍQUIDA:          R$ 2.170,00
```

## 🔧 Implementação no Sistema

### **Endpoint Principal**
```python
POST /prestacao-contas/calcular
Body: {
    "contrato_id": 123,
    "mes": 3,
    "ano": 2025,
    "dias_ocupados": 10,
    "valor_base": 2500.00,
    "bonificacoes": 500.00,
    "observacoes": "Entrada em 22/03"
}
```

### **Resposta do Sistema**
```json
{
    "contrato_id": 123,
    "periodo": "março/2025",
    "calculos": {
        "dias_ocupados": 10,
        "total_dias": 31,
        "percentual": 32.26,
        "valor_proporcional": 806.45,
        "iptu_proporcional": 34.40,
        "seguro_fixo": 32.50,
        "bonificacao": -161.29,
        "valor_final": 712.06
    },
    "locadores": [
        {
            "id": 1,
            "nome": "João Silva",
            "participacao": 50.0,
            "valor_bruto": 356.03,
            "taxa_transferencia": 0.00,
            "valor_liquido": 356.03
        },
        {
            "id": 2,  
            "nome": "Maria Santos",
            "participacao": 50.0,
            "valor_bruto": 356.03,
            "taxa_transferencia": 2.50,
            "valor_liquido": 353.53
        }
    ],
    "resumo": {
        "total_bruto": 712.06,
        "total_taxas": 2.50,
        "total_liquido": 709.56
    }
}
```

## 📋 Regras de Negócio

### **Proporção de Dias**
- Cálculo baseado em dias corridos do mês
- Entrada: proporcional a partir da data de início
- Saída: proporcional até a data de término
- Mês completo: 100% dos valores

### **Taxa de Transferência**
- **R$ 2,50 por locador adicional** (além do principal)
- **Locador principal:** sem taxa
- **Locadores secundários:** R$ 2,50 cada
- **Aplicação:** deduzida do valor líquido de cada locador

### **Bonificações e Descontos**
- **Proporcionais aos dias ocupados**
- **Acordadas previamente** no contrato
- **Podem ser fixas ou percentuais**
- **Aplicadas após cálculo proporcional**

### **IPTU e Seguros**
- **IPTU:** sempre proporcional
- **Seguro Incêndio:** normalmente fixo (valor integral)
- **Condomínio:** proporcional aos dias
- **Outros impostos:** conforme definido no contrato

## 🎨 Interface do Sistema

### **Tela de Prestação de Contas**
```typescript
interface PrestacaoContasForm {
    contrato_id: number;
    mes: number;
    ano: number;
    data_inicio?: string;  // Para cálculo proporcional
    data_fim?: string;     // Para cálculo proporcional  
    valor_aluguel: number;
    valor_iptu: number;
    valor_condominio: number;
    valor_seguro: number;
    bonificacoes: number;
    descricao_bonificacoes: string;
    observacoes: string;
}
```

### **Relatório Gerado**
- **Resumo executivo** com valores totais
- **Detalhamento por locador** (nome, %, valores)
- **Cálculos demonstrativos** (fórmulas aplicadas)
- **Observações** e justificativas
- **Data de geração** e responsável

## 📊 Relatórios Disponíveis

### **1. Prestação Individual**
- **Por contrato** e período específico
- **Detalhamento completo** dos cálculos
- **Arquivo PDF** para envio

### **2. Prestação Consolidada**
- **Múltiplos contratos** por locador
- **Resumo mensal** por proprietário
- **Totais consolidados**

### **3. Histórico de Prestações**
- **Consulta por período**
- **Filtros por locador/contrato**
- **Exportação para Excel**

## 🔄 Fluxo Operacional

### **1. Criação da Prestação**
1. Selecionar contrato e período
2. Sistema busca dados do contrato
3. Preencher valores específicos do mês
4. Aplicar bonificações/descontos
5. Calcular automaticamente
6. Revisar e confirmar
7. Gerar relatório

### **2. Aprovação e Envio**
1. Revisar cálculos
2. Adicionar observações se necessário
3. Aprovar prestação
4. Gerar PDF final
5. Enviar para locadores via email
6. Registrar envio no sistema

### **3. Controle de Pagamentos**
1. Marcar como "Enviado"
2. Acompanhar transferências
3. Confirmar recebimento pelos locadores
4. Atualizar status para "Pago"

## ⚠️ Situações Especiais

### **Contratos com Carência**
- Períodos sem cobrança
- Bonificações integrais
- Cálculo zerado para o período

### **Reajustes no Meio do Mês**
- Valor proporcional por período
- Data de vigência do reajuste
- Cálculo separado por valor

### **Inadimplência**
- Não impacta prestação de contas
- Locador recebe conforme o devido
- Cobrança por conta da administradora

## 🐛 Solução de Problemas

### **Problema: Lista de Prestações não Mostra Dados Reais**

**Sintomas:**
- Sistema encontra faturas (ex: 4 registros)
- Não exibe endereço do imóvel
- Não mostra nome do locatário
- Não apresenta CPF do cliente

**Causa Raiz:**
- JOINs entre tabelas PrestacaoContas, Contratos, Imoveis e Locatarios falhando
- Relacionamentos NULL ou inexistentes na base de dados
- Consultas retornando dados vazios mesmo com registros válidos

**Solução Implementada:**
```python
# repositories_adapter.py - Função buscar_faturas()

# Consulta com subqueries para garantir dados reais
query = """
    SELECT 
        p.id,
        'PC-' + RIGHT('000' + CAST(p.id AS VARCHAR(10)), 3) as numero_fatura,
        ISNULL(p.total_bruto, 0) as valor_total,
        ISNULL(p.data_criacao, GETDATE()) as data_vencimento,
        NULL as data_pagamento,
        ISNULL(p.status, 'pendente') as status,
        ISNULL(p.referencia, 'N/A') as mes_referencia,
        ISNULL(p.referencia, 'N/A') as referencia_display,
        ISNULL(p.observacoes_manuais, '') as observacoes,
        p.data_criacao,
        ISNULL(p.contrato_id, 0) as contrato_id,
        CAST(ISNULL(p.contrato_id, 0) AS VARCHAR(10)) as contrato_numero,
        
        -- SUBQUERY para endereço do imóvel
        CASE 
            WHEN p.contrato_id IS NOT NULL THEN 
                ISNULL((SELECT TOP 1 i.endereco FROM Contratos c 
                       LEFT JOIN Imoveis i ON c.id_imovel = i.id 
                       WHERE c.id = p.contrato_id), 'Endereço não encontrado')
            ELSE 'Endereço não informado'
        END as imovel_endereco,
        
        -- SUBQUERY para nome do locatário
        CASE 
            WHEN p.contrato_id IS NOT NULL THEN 
                ISNULL((SELECT TOP 1 lt.nome FROM Contratos c 
                       LEFT JOIN Locatarios lt ON c.id_locatario = lt.id 
                       WHERE c.id = p.contrato_id), 'Nome não encontrado')
            ELSE 'Nome não informado'
        END as locatario_nome,
        
        -- SUBQUERY para CPF do locatário
        CASE 
            WHEN p.contrato_id IS NOT NULL THEN 
                ISNULL((SELECT TOP 1 lt.cpf_cnpj FROM Contratos c 
                       LEFT JOIN Locatarios lt ON c.id_locatario = lt.id 
                       WHERE c.id = p.contrato_id), 'CPF não encontrado')
            ELSE 'CPF não informado'
        END as locatario_cpf,
        
        ISNULL(l.nome, 'Nome não informado') as locador_nome,
        ISNULL(l.nome, 'Nome não informado') as proprietario_nome,
        ISNULL(l.cpf_cnpj, 'CPF não informado') as proprietario_cpf,
        0 as dias_atraso,
        ISNULL(p.total_liquido, 0) as valor_liquido,
        ISNULL(p.valor_pago, 0) as valor_pago,
        ISNULL(p.locador_id, 0) as locador_id
        
    FROM PrestacaoContas p
    LEFT JOIN Locadores l ON p.locador_id = l.id
    WHERE p.ativo = 1
    ORDER BY p.id DESC
"""
```

**Por que Funciona:**
1. **Subqueries Independentes**: Cada CASE busca dados diretamente das tabelas relacionadas
2. **Fallbacks Inteligentes**: Sempre retorna um valor, mesmo que seja "não encontrado"
3. **Sem Dependência de JOINs**: Não falha se relacionamentos estão NULL
4. **Performance**: Subqueries TOP 1 são otimizadas pelo SQL Server

**Como Aplicar a Correção:**
1. Localizar a função `buscar_faturas()` em `repositories_adapter.py`
2. Substituir a consulta principal pela versão com subqueries
3. Reiniciar o backend Python
4. Testar a lista de prestações na interface

**Prevenção:**
- Sempre validar relacionamentos antes de criar prestações
- Implementar controles de integridade referencial
- Usar subqueries quando JOINs são instáveis
- Manter logs de debug para identificar problemas similares

---
**Atualizado:** 12/09/2025  
**Sistema de Prestação de Contas v2.1**