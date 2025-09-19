# Documentação - Implementação PDF HTML para Prestação de Contas

## 📋 RESUMO EXECUTIVO

**Data:** 18/09/2025
**Status:** ANÁLISE CONCLUÍDA - AGUARDANDO AUTORIZAÇÃO
**Objetivo:** Substituir geração de PDF ReportLab por layout HTML moderno aprovado
**Compatibilidade:** 100% - Usar estrutura V2.0 existente

---

## 🎯 SITUAÇÃO ATUAL IDENTIFICADA

### ✅ Sistema V2.0 Implementado (Setembro 2025)
- **Tabela PrestacaoContas:** Novos campos implementados
- **Campo detalhamento_json:** JSON completo com todos os dados
- **Componentes:** PrestacaoContasDetalhamento.tsx funcionando
- **Salvamento:** Via salvar_prestacao_contas() com dados completos

### ✅ Layouts HTML Aprovados
- **COBIMOB_HTML_OPCAO_1_Clean_Moderno.html** - Múltiplos proprietários (PIX)
- **COBIMOB_HTML_OPCAO_1_Leonci_Correia.html** - Proprietário único (TED)
- **Visual:** Cores COBIMOB (#137D76, #431E75), fonte Poppins, logo oficial

---

## 🔍 ANÁLISE DETALHADA DA ESTRUTURA

### 📊 Fonte CORRETA dos Dados

#### ❌ INICIAL (Incorreto)
```python
# Buscava dados dos contratos
valor_aluguel = contrato['valor_aluguel']
valor_iptu = contrato['valor_iptu']
```

#### ✅ CORRETO (Identificado)
```python
# Dados vêm do JSON salvo na prestação
json_data = prestacao['detalhamento_json']
valores_lancados = json_data['lancamentos']['principais']
totais_calculados = json_data['totais']
```

### 🗄️ Estrutura Real dos Dados

#### Tabela PrestacaoContas (V2.0)
```sql
-- Campos principais preservados
id, contrato_id, mes, ano, status, total_bruto, total_liquido

-- NOVOS CAMPOS V2.0 (implementados)
valor_boleto DECIMAL(10,2)        -- Total da fatura
total_retido DECIMAL(10,2)        -- Valores retidos
valor_repasse DECIMAL(10,2)       -- Valor para proprietário
tipo_calculo VARCHAR(20)          -- entrada/mensal/rescisao/saida
multa_rescisoria DECIMAL(10,2)    -- Multa em rescisões
detalhamento_json TEXT            -- JSON COMPLETO ⭐
```

#### JSON detalhamento_json
```json
{
  "contrato": {
    "id": 123,
    "codigo": "CONT-2025-001",
    "valor_aluguel": 2500.00,
    "locadores": [
      {
        "id": 1,
        "nome": "João Silva",
        "porcentagem": 50,
        "dados_bancarios": {
          "tipo_recebimento": "PIX",
          "chave_pix": "joao@pix.com"
        }
      }
    ],
    "locatario_nome": "Maria Santos",
    "locatario_cpf": "123.456.789-00",
    "imovel_endereco": "Rua das Flores, 123"
  },
  "lancamentos": {
    "principais": [
      {"tipo": "aluguel", "descricao": "Aluguel", "valor": 2500.00},
      {"tipo": "iptu", "descricao": "IPTU - Parcela 05/10", "valor": 106.63},
      {"tipo": "seguro", "descricao": "Seguro incêndio", "valor": 32.50}
    ],
    "extras": [
      {"tipo": "desconto", "descricao": "Bonificação - Pagamento até vencimento", "valor": -500.00},
      {"tipo": "reembolso", "descricao": "Reembolso - Fundo de Benfeitoria", "valor": -17.00}
    ]
  },
  "totais": {
    "valorBoleto": 2122.13,
    "totalRetido": 234.13,
    "valorRepasse": 1888.00,
    "repassePorLocador": [
      {
        "locador_id": 1,
        "locador_nome": "João Silva",
        "porcentagem": 50,
        "valor_repasse": 944.00
      }
    ]
  },
  "configuracoes": {
    "mes_referencia": "08/2025",
    "data_vencimento": "2025-09-05",
    "retencoes": {
      "taxa_admin": 5,
      "taxa_boleto": 2.50
    }
  }
}
```

---

## 🎯 MAPEAMENTO HTML ↔ DADOS

### 📋 Campos do Layout HTML

#### Header/Período
```html
<h1>PRESTAÇÃO DE CONTAS</h1>
<div class="subtitulo">Agosto/2025</div>
```
**Fonte:** `json_data.configuracoes.mes_referencia`

#### Proprietário
```html
<h3>Proprietário</h3>
<p class="destaque">João Silva</p>
<p>CPF: 123.456.789-00</p>
```
**Fonte:** `json_data.contrato.locadores[0]`

#### Locatário & Imóvel
```html
<h3>Locatário & Imóvel</h3>
<p class="destaque">Maria Santos</p>
<p>CPF: 123.456.789-00</p>
<p>Rua das Flores, 123</p>
```
**Fonte:** `json_data.contrato.locatario_*`

#### Dados da Fatura (CORREÇÃO)
```html
<!-- ❌ ANTES -->
<div class="numero-boleto">Boleto Nº: 2025080001</div>

<!-- ✅ CORRETO -->
<div class="numero-fatura">Fatura Nº: PC-123</div>
<div>Vencimento: 05/09/2025</div>
<div>Pagamento: 05/09/2025</div>
```
**Fonte:**
- Número: `f"PC-{prestacao.id:03d}"`
- Datas: `json_data.configuracoes` ou campos da prestação

#### Valores Cobrados
```html
<tr><td>Aluguel</td><td class="valor">R$ 2.500,00</td></tr>
<tr><td>IPTU - Parcela 05/10</td><td class="valor">R$ 106,63</td></tr>
<tr><td>Seguro incêndio</td><td class="valor">R$ 32,50</td></tr>
```
**Fonte:** `json_data.lancamentos.principais` (valores positivos)

#### Valores Retidos
```html
<tr><td>Taxa de administração 5% (-)</td><td class="valor">R$ 101,63</td></tr>
<tr><td>Bonificação - Pagamento até vencimento (-)</td><td class="valor valor-negativo">-R$ 500,00</td></tr>
```
**Fonte:**
- Calculados a partir de `json_data.totais.totalRetido`
- Lançamentos negativos de `json_data.lancamentos.extras`

#### Repasses
```html
<td><strong>João Silva</strong><br><small>CPF: 123.456.789-00</small></td>
<td>PIX: joao@pix.com</td>
<td class="valor">R$ 944,00</td>
```
**Fonte:** `json_data.totais.repassePorLocador`

---

## 🔧 IMPLEMENTAÇÃO PROPOSTA

### 1. Localização da Mudança
**Arquivo:** `locacao/repositories/prestacao_contas_repository.py`
**Função:** `gerar_relatorio_pdf(prestacao_contas: Dict[str, Any]) -> BytesIO`
**Linhas:** 492-651 (código ReportLab atual)

### 2. Estratégia de Implementação

#### ✅ Substituição Direta (Recomendada)
```python
def gerar_relatorio_pdf(prestacao_contas: Dict[str, Any]) -> BytesIO:
    """
    NOVA IMPLEMENTAÇÃO: Gera PDF usando layout HTML COBIMOB
    Substitui código ReportLab por HTML→PDF
    """
    # 1. Mapear dados da prestação para formato HTML
    dados_html = mapear_dados_prestacao_html(prestacao_contas)

    # 2. Escolher template baseado em número de proprietários
    template_path = escolher_template_cobimob(dados_html)

    # 3. Renderizar HTML com dados
    html_content = renderizar_template_html(template_path, dados_html)

    # 4. Converter HTML→PDF (Playwright/WeasyPrint)
    return converter_html_para_pdf(html_content)
```

### 3. Funções de Apoio Necessárias

#### Mapeamento de Dados
```python
def mapear_dados_prestacao_html(prestacao: dict) -> dict:
    """Mapeia dados da prestação V2.0 para formato HTML"""
    json_data = prestacao.get('detalhamento_json', {})

    return {
        'mes_ano': extrair_mes_ano_referencia(json_data),
        'numero_fatura': f"PC-{prestacao.get('id', 0):03d}",
        'proprietarios': json_data.get('contrato', {}).get('locadores', []),
        'locatario': extrair_dados_locatario(json_data),
        'imovel': json_data.get('contrato', {}).get('imovel_endereco', ''),
        'valores_cobrados': extrair_valores_cobrados(json_data),
        'valores_retidos': calcular_valores_retidos_detalhados(json_data),
        'repasses': json_data.get('totais', {}).get('repassePorLocador', []),
        'datas': extrair_datas_vencimento_pagamento(prestacao, json_data)
    }
```

#### Escolha de Template
```python
def escolher_template_cobimob(dados_html: dict) -> str:
    """Escolhe template baseado no número de proprietários"""
    num_proprietarios = len(dados_html.get('proprietarios', []))

    if num_proprietarios > 1:
        return "templates/COBIMOB_HTML_OPCAO_1_Clean_Moderno.html"  # PIX
    else:
        return "templates/COBIMOB_HTML_OPCAO_1_Leonci_Correia.html"  # TED
```

### 4. Ajustes nos Templates HTML

#### Correções Necessárias
```html
<!-- Ajustar nomenclatura -->
- "Boleto Nº:" → "Fatura Nº:"
- Usar numeração PC-XXX em vez de formato ano/mês

<!-- Garantir paths corretos das imagens -->
<img src="static/images/Cobimob logos-01.png" alt="CobiMob" class="logo">
<img src="static/images/Cobimob logos-03.png" alt="CbiMb" style="height: 24px;">
```

---

## 📊 VANTAGENS DA IMPLEMENTAÇÃO

### ✅ Benefícios Técnicos
- **Código mais limpo:** 50 linhas vs 160 linhas ReportLab
- **Manutenção fácil:** Mudanças visuais = editar HTML/CSS
- **Visual aprovado:** Usa exatamente o layout aprovado pelo usuário
- **Dados corretos:** Usa mesmos dados que DetalhamentoBoleto

### ✅ Benefícios Visuais
- **Logo COBIMOB:** Inclui logos oficiais
- **Cores da marca:** #137D76, #431E75, #DFADE7
- **Fonte Poppins:** Tipografia moderna
- **Layout responsivo:** Se adapta a múltiplos proprietários
- **Footer com listras:** Elementos visuais da marca

### ✅ Compatibilidade
- **Zero impacto:** Mesma assinatura de função
- **Dados idênticos:** Usa prestacao_contas como input
- **Output igual:** Retorna BytesIO PDF
- **Sistema V2.0:** Aproveita estrutura implementada

---

## 🚨 PONTOS DE ATENÇÃO

### ⚠️ Dependências
- **Bibliotecas PDF:** Playwright ou WeasyPrint para HTML→PDF
- **Templates:** Arquivos HTML precisam estar no local correto
- **Imagens:** Logos COBIMOB no diretório assets
- **Encoding:** JSON com caracteres especiais (UTF-8)

### ⚠️ Arquivos da Pasta exemplos_pdf
**📁 ARQUIVOS ESSENCIAIS (mover para implementação):**
- `COBIMOB_HTML_OPCAO_1_Clean_Moderno.html` - Template principal (múltiplos proprietários)
- `COBIMOB_HTML_OPCAO_1_Leonci_Correia.html` - Template secundário (proprietário único)
- `Cobimob logos-01.png` - Logo principal (header)
- `Cobimob logos-03.png` - Logo do footer

**🗑️ ARQUIVOS PARA EXCLUSÃO (20+ arquivos):**
- Scripts de teste: `gerar_*.py`, `converter_*.py`, `abrir_*.py`
- Templates não aprovados: `COBIMOB_VARIACAO_*.html`, `OPCAO_1_*.html`
- Arquivos de desenvolvimento: `*.tsx`, `*.ai`
- PDFs de exemplo: Todos exceto referência visual se necessário

**📂 ESTRUTURA FINAL PROPOSTA:**
```
locacao/templates/prestacao_contas/
├── COBIMOB_HTML_OPCAO_1_Clean_Moderno.html
├── COBIMOB_HTML_OPCAO_1_Leonci_Correia.html
└── assets/
    ├── Cobimob logos-01.png
    └── Cobimob logos-03.png
```

### ⚠️ Testes Necessários
- **Dados reais:** Testar com prestações salvas no banco
- **Múltiplos cenários:** Entrada, mensal, rescisão, saída
- **Proprietários:** Único vs múltiplos
- **Valores:** Negativos, reembolsos, multas
- **Performance:** Velocidade de geração vs ReportLab

---

## 📋 PLANO DE IMPLEMENTAÇÃO

### Fase 1: Preparação (AGUARDANDO AUTORIZAÇÃO)
1. **Criar diretório templates:** `locacao/templates/prestacao_contas/`
2. **Mover arquivos essenciais:** Da pasta `exemplos_pdf/` para local definitivo
3. **Ajustar templates:** Nomenclatura Boleto→Fatura, paths das imagens
4. **Instalar dependência:** Playwright ou WeasyPrint
5. **Limpar pasta exemplos_pdf:** Excluir após mover arquivos necessários

### Fase 2: Implementação Core (AGUARDANDO AUTORIZAÇÃO)
1. **Implementar função mapeamento:** `mapear_dados_prestacao_html()`
2. **Implementar escolha template:** `escolher_template_cobimob()`
3. **Implementar conversão PDF:** `converter_html_para_pdf()`
4. **Substituir função principal:** `gerar_relatorio_pdf()`

### Fase 3: Testes (AGUARDANDO AUTORIZAÇÃO)
1. **Testar com dados reais:** Prestações existentes no banco
2. **Validar layouts:** PIX vs TED
3. **Verificar imagens:** Logos aparecendo corretamente
4. **Performance:** Comparar velocidade com ReportLab

### Fase 4: Deploy (AGUARDANDO AUTORIZAÇÃO)
1. **Backup código atual:** Salvar versão ReportLab
2. **Deploy nova versão:** Substituir função
3. **Monitorar:** Verificar se PDFs geram corretamente
4. **Rollback se necessário:** Voltar ReportLab se houver problemas

---

## 🔄 COMPATIBILIDADE COM SISTEMA ATUAL

### ✅ Preservado
- **Assinatura da função:** `gerar_relatorio_pdf(prestacao_contas)`
- **Input esperado:** Dict com dados da prestação V2.0
- **Output produzido:** BytesIO com PDF gerado
- **Integração Streamlit:** Sem mudanças necessárias
- **API endpoints:** Funcionam sem alteração

### ✅ Melhorado
- **Visual:** Layout COBIMOB profissional
- **Dados:** Usa lançamentos reais (não dados do contrato)
- **Flexibilidade:** Adapta-se automaticamente a cenários
- **Manutenção:** Mudanças visuais = editar HTML

---

## 📝 STATUS ATUAL

**✅ ANÁLISE COMPLETA:** Estrutura identificada e mapeada
**✅ PLANO DEFINIDO:** Implementação detalhada
**✅ TEMPLATES APROVADOS:** Layouts HTML prontos
**✅ DADOS MAPEADOS:** Fonte correta identificada

**🚨 AGUARDANDO AUTORIZAÇÃO PARA:**
1. Mover 4 arquivos essenciais da pasta `exemplos_pdf/`
2. Excluir pasta `exemplos_pdf/` (após mover arquivos)
3. Ajustar templates HTML (nomenclatura Boleto→Fatura)
4. Implementar funções de mapeamento de dados
5. Substituir código ReportLab por HTML→PDF
6. Testar com dados reais do sistema V2.0

**📋 PRÓXIMO PASSO:** Autorização para iniciar Fase 1 da implementação

---

## 📞 CONTATO

**Responsável:** Claude Code Assistant
**Data:** 18/09/2025
**Versão:** 1.0
**Sistema:** COBIMOB Prestação de Contas V2.0

**Importante:** NENHUMA ALTERAÇÃO SERÁ FEITA NO SISTEMA SEM AUTORIZAÇÃO EXPLÍCITA