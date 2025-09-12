# 📋 Documentação Completa - Módulo de Contratos

## 🏗️ Arquitetura do Sistema

### **Frontend → Backend → Database**
```
ModernContratoForm.tsx → main.py (ContratoCreate) → repositories_adapter.py → Tabela Contratos
```

---

## 🗄️ Estrutura da Tabela `Contratos` (95 colunas)

### **🔑 Campos Obrigatórios**
- `id` (IDENTITY) - Chave primária
- `id_imovel` - FK para Imoveis
- `id_locatario` - FK para Locatarios  
- `data_inicio` - Data início contrato
- `data_fim` - Data fim contrato
- `valor_aluguel` - Valor mensal aluguel
- `vencimento_dia` - Dia vencimento (1-31)
- `tipo_garantia` - Tipo de garantia

### **💰 Campos Monetários (Aba "Valores")**
```sql
valor_aluguel [decimal(10,2)]
valor_condominio [decimal(10,2)]
valor_fci [decimal(10,2)]
valor_iptu [decimal(10,2)]
valor_seguro_fianca [decimal(10,2)]
valor_seguro_incendio [decimal(10,2)]
valor_taxa_lixo [decimal(10,2)]
valor_taxa_administracao [decimal(10,2)]
valor_fundo_reserva [decimal(10,2)]
bonificacao [decimal(5,2)]
taxa_administracao [decimal(5,2)]
```

### **📅 Campos de Datas**
```sql
data_inicio [date]
data_fim [date] 
data_assinatura [date]
data_entrega_chaves [date]
ultimo_reajuste [date]
proximo_reajuste [date]
seguro_fianca_inicio [date]
seguro_fianca_fim [date]
seguro_incendio_inicio [date]
seguro_incendio_fim [date]
data_inicio_iptu [date]
data_fim_iptu [date]
```

### **☑️ Campos de Antecipação (Checkboxes)**
```sql
antecipa_condominio [bit]
antecipa_seguro_fianca [bit]
antecipa_seguro_incendio [bit]
antecipa_iptu [bit]
antecipa_taxa_lixo [bit]
```

### **☑️ Campos de Retenção (Checkboxes)**
```sql
retido_fci [bit]
retido_condominio [bit]
retido_seguro_fianca [bit]
retido_seguro_incendio [bit]
retido_iptu [bit]
retido_taxa_lixo [bit]
```

### **🔄 Campos de Reajuste**
```sql
percentual_reajuste [decimal(5,2)]
indice_reajuste [nvarchar(50)]
tempo_reajuste [int]
proximo_reajuste_automatico [bit]
```

### **📋 Campos de Parcelamento**
```sql
parcelas_iptu [int]
parcelas_seguro_fianca [int]
parcelas_seguro_incendio [int]
periodo_contrato [int]
```

### **👨‍💼 Campos do Corretor**
```sql
tem_corretor [bit]
corretor_nome [nvarchar(200)]
corretor_creci [nvarchar(20)]
corretor_cpf [nvarchar(14)]
corretor_telefone [nvarchar(20)]
corretor_email [nvarchar(100)]
```

### **🏠 Campos de Obrigações**
```sql
obrigacao_manutencao [bit]
obrigacao_pintura [bit]
obrigacao_jardim [bit]
obrigacao_limpeza [bit]
obrigacao_pequenos_reparos [bit]
obrigacao_vistoria [bit]
```

### **💸 Campos de Multas**
```sql
multa_locador [decimal(10,2)]
multa_locatario [decimal(10,2)]
percentual_multa_atraso [decimal(5,2)]
```

### **📝 Campos Texto**
```sql
clausulas_adicionais [varchar(max)]
tipo_plano_locacao [nvarchar(20)]
status [nvarchar(20)]
```

### **❌ Campos que NÃO EXISTEM (causam erro)**
- ~~`observacoes`~~ - **REMOVIDO** (não existe na tabela)
- ~~`numero_contrato`~~ - Não mapeado
- ~~`valor_caucao`~~ - Não mapeado
- ~~`valor_desconto`~~ - Não mapeado

---

## 🔗 Tabelas Relacionadas

### **N:N Relationships**
```sql
ContratoLocadores (contrato_id, locador_id, conta_bancaria_id, porcentagem)
ContratoLocatarios (contrato_id, locatario_id, responsabilidade_principal)
ContratoPets (contrato_id, nome, especie, raca)
GarantiasIndividuais (contrato_id, pessoa_id, tipo_garantia)
```

### **1:N Relationships**
```sql
ContratoDocumentos (contrato_id, tipo_documento, nome_arquivo)
HistoricoContratos (contrato_id, campo_alterado, valor_anterior, valor_novo)
StatusContrato (contrato_id, status_atual, data_status)
```

---

## 💻 Implementação de Código

### **1. Backend Model (main.py)**
```python
class ContratoCreate(BaseModel):
    # Campos obrigatórios
    id_imovel: int
    id_locatario: int
    data_inicio: date
    data_fim: date
    valor_aluguel: float
    vencimento_dia: int
    tipo_garantia: str
    
    # Datas de seguros e IPTU
    seguro_fianca_inicio: Optional[date] = None
    seguro_fianca_fim: Optional[date] = None
    seguro_incendio_inicio: Optional[date] = None
    seguro_incendio_fim: Optional[date] = None
    data_inicio_iptu: Optional[date] = None
    data_fim_iptu: Optional[date] = None
    
    # Checkboxes antecipação
    antecipa_condominio: bool = False
    antecipa_seguro_fianca: bool = False
    antecipa_seguro_incendio: bool = False
    
    # Checkboxes retenção  
    retido_fci: bool = False
    retido_condominio: bool = False
    retido_seguro_fianca: bool = False
    
    # IMPORTANTE: NÃO incluir 'observacoes' - campo não existe!
```

### **2. Repository Function (repositories_adapter.py)**
```python
def inserir_contrato_completo(**kwargs):
    # Lista EXATA de campos válidos da tabela Contratos
    campos_inseríveis = [
        # Básicos
        'id_locatario', 'id_imovel', 'valor_aluguel', 'data_inicio', 
        'data_fim', 'tipo_garantia', 'status',
        
        # Monetários
        'valor_condominio', 'valor_fci', 'valor_seguro_fianca',
        'valor_seguro_incendio', 'bonificacao', 'taxa_administracao',
        
        # Datas de seguros/IPTU
        'seguro_fianca_inicio', 'seguro_fianca_fim',
        'seguro_incendio_inicio', 'seguro_incendio_fim', 
        'data_inicio_iptu', 'data_fim_iptu',
        
        # Checkboxes antecipação/retenção
        'antecipa_condominio', 'antecipa_seguro_fianca',
        'retido_fci', 'retido_condominio', 'retido_seguro_fianca',
        
        # Reajustes
        'percentual_reajuste', 'indice_reajuste', 'tempo_reajuste',
        'ultimo_reajuste', 'proximo_reajuste',
        
        # Corretor
        'tem_corretor', 'corretor_nome', 'corretor_creci',
        
        # Obrigações
        'obrigacao_manutencao', 'obrigacao_pintura',
        
        # Outros
        'clausulas_adicionais', 'periodo_contrato'
        
        # ❌ NÃO incluir: 'observacoes' (não existe na tabela!)
    ]
```

### **3. Frontend Form (ModernContratoForm.tsx)**
```tsx
// Estado inicial do contrato
const [contratoData, setContratoData] = useState({
  // Campos obrigatórios
  id_imovel: '',
  valor_aluguel: 0,
  vencimento_dia: '',
  tipo_garantia: 'Sem garantia',
  
  // Datas de seguros (IMPORTANTES!)
  seguro_fianca_inicio: '',
  seguro_fianca_fim: '',
  seguro_incendio_inicio: '',
  seguro_incendio_fim: '',
  data_inicio_iptu: '',
  data_fim_iptu: '',
  
  // Checkboxes antecipação/retenção
  antecipa_condominio: false,
  antecipa_seguro_fianca: false,
  retido_fci: false,
  retido_seguro_fianca: false,
  
  // ❌ NÃO incluir: observacoes (causa erro no banco!)
});
```

---

## 🚨 Problemas Comuns e Soluções

### **❌ Erro: "Nome de coluna 'observacoes' inválido"**
**Causa:** Campo `observacoes` não existe na tabela Contratos  
**Solução:** Remover campo da lista `campos_inseríveis` e do `ContratoCreate`

### **❌ Erro: "Campos não salvando"**
**Causa:** Campo existe no frontend mas não no `campos_inseríveis`  
**Solução:** Adicionar campo na lista baseado na estrutura real da tabela

### **❌ Erro: "Data inválida"**
**Causa:** Formato de data incorreto ou campo NULL  
**Solução:** Validar formato YYYY-MM-DD no frontend

### **❌ Erro: "Valor monetário zerado"**
**Causa:** Campo não mapeado no ContratoCreate  
**Solução:** Adicionar campo com tipo `float` no backend

---

## 🔄 Workflow de Criação de Contrato

### **1. Frontend (ModernContratoForm.tsx)**
```
Preenchimento → Validação → handleCreateContract() → POST /api/contratos
```

### **2. Backend (main.py)**
```
ContratoCreate → Validação Pydantic → inserir_contrato_completo()
```

### **3. Repository (repositories_adapter.py)**
```
Filtrar campos → Montar INSERT → Executar → Retornar ID
```

### **4. Sequência pós-criação**
```
Inserir Locadores → Inserir Locatários → Inserir Garantias → Inserir Pets
```

---

## 📊 Abas do Formulário

### **Aba "Partes"**
- Locadores (N:N via ContratoLocadores)
- Locatários (N:N via ContratoLocatarios)  
- Pets (1:N via ContratoPets)

### **Aba "Datas e Reajustes"**
- Datas do contrato (início, fim, assinatura)
- Configuração de reajustes (índice, período)
- Período do contrato (6, 12, 24, 30, 36, 48, 120 meses)

### **Aba "Valores e Encargos"**
- Valores mensais (aluguel, condomínio, FCI)
- Seguros (fiança, incêndio) com parcelas
- IPTU com parcelas
- Checkboxes antecipação/retenção

### **Aba "Garantias"**
- Garantias por pessoa (via GarantiasIndividuais)
- Tipos: Fiador, Caução, Título, Apólice

### **Aba "Plano"**
- Configurações do plano de locação
- Taxa de administração

### **Aba "Cláusulas"**
- Cláusulas adicionais (texto livre)
- Observações específicas do plano

### **Aba "Histórico"** (apenas edição)
- Log de alterações (via HistoricoContratos)
- Mudanças de status

---

## 🎯 Checklist de Manutenção

### **Ao adicionar novo campo:**
1. ✅ Verificar se campo existe na tabela `Contratos` (script10.sql)
2. ✅ Adicionar no `ContratoCreate` (main.py)
3. ✅ Adicionar na lista `campos_inseríveis` (repositories_adapter.py)
4. ✅ Adicionar no estado `contratoData` (frontend)
5. ✅ Criar input na aba apropriada
6. ✅ Testar criação e edição

### **Ao remover campo:**
1. ✅ Remover do frontend
2. ✅ Remover do `ContratoCreate`
3. ✅ Remover de `campos_inseríveis`
4. ✅ Verificar se não quebra edição

### **Ao alterar estrutura do banco:**
1. ✅ Atualizar esta documentação
2. ✅ Sincronizar todos os arquivos
3. ✅ Testar fluxo completo

---

## 📝 Notas de Desenvolvimento

- **Padrão de nomes:** Snake_case no banco, camelCase no frontend
- **Tipos de dados:** `decimal` para valores monetários, `bit` para boolean
- **Relacionamentos:** Usar tabelas N:N separadas para múltiplos locadores/locatários
- **Histórico:** Salvar automaticamente via `HistoricoContratos`
- **Status:** Controlar via campo `status` e tabela `StatusContrato`

---

## 🚀 Status Atual (2025-09-11)

✅ **Funcionando perfeitamente:**
- Criação de contratos com todos os campos
- Datas de seguros e IPTU salvando
- Checkboxes antecipação/retenção funcionando
- Múltiplos locadores/locatários
- Edição completa de contratos
- Histórico de alterações

✅ **Correções aplicadas:**
- Campo `observacoes` removido (não existia na tabela)
- Mapeamento completo frontend ↔ backend ↔ database
- Lista de períodos atualizada (6,12,20,24,30,36,48,60,120)
- Contas bancárias carregando no modo editar

---

**📧 Para suporte:** Consulte esta documentação antes de fazer alterações no módulo de contratos.