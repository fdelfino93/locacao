# 📄 Análise do Módulo Contratos

## 🎯 Visão Geral

O módulo de contratos é o **núcleo do sistema**, gerenciando:
- **Relacionamentos N:N** (múltiplos locadores ↔ múltiplos locatários)
- **Cálculos financeiros** complexos
- **Gestão de garantias** e pets
- **Prestação de contas** automática
- **Controle de status** e renovações

## 🏗️ Estrutura de Dados

### **Tabela Principal: Contratos**
```sql
CREATE TABLE Contratos (
    id INT IDENTITY(1,1) PRIMARY KEY,
    numero_contrato NVARCHAR(50),
    id_imovel INT NOT NULL,
    valor_aluguel DECIMAL(10,2),
    valor_iptu DECIMAL(10,2), 
    valor_condominio DECIMAL(10,2),
    valor_seguro DECIMAL(10,2),
    data_inicio DATE,
    data_fim DATE,
    status NVARCHAR(20) DEFAULT 'Ativo',
    tipo_garantia NVARCHAR(50),
    observacoes NVARCHAR(MAX),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);
```

### **Relacionamentos N:N**

#### **ContratoLocadores**
```sql
CREATE TABLE ContratoLocadores (
    id INT IDENTITY(1,1) PRIMARY KEY,
    contrato_id INT NOT NULL,
    locador_id INT NOT NULL,
    porcentagem_participacao DECIMAL(5,2) NOT NULL,
    responsabilidade_principal BIT DEFAULT 0,
    data_entrada DATE,
    data_saida DATE,
    ativo BIT DEFAULT 1,
    
    CONSTRAINT FK_ContratoLocadores_Contrato 
        FOREIGN KEY (contrato_id) REFERENCES Contratos(id),
    CONSTRAINT FK_ContratoLocadores_Locador 
        FOREIGN KEY (locador_id) REFERENCES Locadores(id),
    CONSTRAINT UC_ContratoLocadores_Unico 
        UNIQUE (contrato_id, locador_id)
);
```

#### **ContratoLocatarios**
```sql
CREATE TABLE ContratoLocatarios (
    id INT IDENTITY(1,1) PRIMARY KEY,
    contrato_id INT NOT NULL,
    locatario_id INT NOT NULL,
    percentual_responsabilidade DECIMAL(5,2) NOT NULL,
    responsabilidade_principal BIT DEFAULT 0,
    data_entrada DATE,
    data_saida DATE,
    ativo BIT DEFAULT 1,
    
    CONSTRAINT FK_ContratoLocatarios_Contrato 
        FOREIGN KEY (contrato_id) REFERENCES Contratos(id),
    CONSTRAINT FK_ContratoLocatarios_Locatario 
        FOREIGN KEY (locatario_id) REFERENCES Locatarios(id),
    CONSTRAINT UC_ContratoLocatarios_Unico 
        UNIQUE (contrato_id, locatario_id)
);
```

## 💰 Cálculos Financeiros

### **1. Taxa de Transferência Múltiplos Locadores**
```python
def calcular_taxa_transferencia(locadores: List[dict]) -> float:
    """
    Calcula taxa de transferência para múltiplos locadores.
    
    Regra: R$ 2,50 por locador adicional (além do principal)
    """
    num_locadores = len(locadores)
    locadores_adicionais = max(0, num_locadores - 1)
    taxa_por_locador = 2.50
    
    return locadores_adicionais * taxa_por_locador

# Exemplo:
# 1 locador = R$ 0,00 (sem taxa)
# 2 locadores = R$ 2,50 (1 adicional)  
# 3 locadores = R$ 5,00 (2 adicionais)
```

### **2. Distribuição Proporcional**
```python
def distribuir_valor_locadores(valor_total: float, locadores: List[dict]) -> List[dict]:
    """
    Distribui valor total entre locadores conforme percentual.
    """
    taxa_transferencia_total = calcular_taxa_transferencia(locadores)
    valor_liquido = valor_total - taxa_transferencia_total
    
    resultados = []
    for locador in locadores:
        percentual = locador['porcentagem_participacao']
        valor_bruto = (valor_total * percentual) / 100
        
        # Taxa aplicada apenas aos não-principais
        if locador['responsabilidade_principal']:
            taxa_individual = 0.00
        else:
            taxa_individual = 2.50
            
        valor_liquido_individual = valor_bruto - taxa_individual
        
        resultados.append({
            'locador_id': locador['locador_id'],
            'nome': locador['nome'],
            'percentual': percentual,
            'valor_bruto': valor_bruto,
            'taxa_transferencia': taxa_individual,
            'valor_liquido': valor_liquido_individual
        })
    
    return resultados
```

### **3. Prestação de Contas Automática**
```python
def gerar_prestacao_contas(contrato_id: int, mes: int, ano: int) -> dict:
    """
    Gera prestação de contas automática para o período.
    """
    contrato = buscar_contrato_completo(contrato_id)
    
    # Valores base do contrato
    valores_base = {
        'aluguel': contrato['valor_aluguel'],
        'iptu': contrato['valor_iptu'],
        'condominio': contrato['valor_condominio'],
        'seguro': contrato['valor_seguro']
    }
    
    # Verificar se há períodos proporcionais
    dias_ocupados, total_dias = calcular_dias_ocupados(contrato_id, mes, ano)
    
    # Aplicar proporção se necessário
    if dias_ocupados < total_dias:
        percentual = dias_ocupados / total_dias
        for chave in valores_base:
            if chave != 'seguro':  # Seguro normalmente é fixo
                valores_base[chave] *= percentual
    
    # Somar receita bruta
    receita_bruta = sum(valores_base.values())
    
    # Distribuir entre locadores
    distribuicao = distribuir_valor_locadores(receita_bruta, contrato['locadores'])
    
    return {
        'contrato_id': contrato_id,
        'periodo': f"{mes:02d}/{ano}",
        'dias_ocupados': dias_ocupados,
        'total_dias': total_dias,
        'percentual_ocupacao': (dias_ocupados / total_dias) * 100,
        'valores_base': valores_base,
        'receita_bruta': receita_bruta,
        'distribuicao_locadores': distribuicao,
        'resumo': {
            'total_bruto': sum(d['valor_bruto'] for d in distribuicao),
            'total_taxas': sum(d['taxa_transferencia'] for d in distribuicao),
            'total_liquido': sum(d['valor_liquido'] for d in distribuicao)
        }
    }
```

## 🔧 APIs do Módulo

### **Criar Contrato Completo**
```python
@app.post("/contratos")
async def criar_contrato(contrato: ContratoCreate):
    """
    Cria contrato com todos os relacionamentos.
    """
    try:
        # 1. Validar dados básicos
        validar_contrato(contrato)
        
        # 2. Verificar se percentuais somam 100%
        validar_porcentagens_contrato(contrato.locadores, contrato.locatarios)
        
        # 3. Criar contrato principal
        contrato_id = criar_contrato_principal(contrato)
        
        # 4. Salvar relacionamentos
        salvar_locadores_contrato(contrato_id, contrato.locadores)
        salvar_locatarios_contrato(contrato_id, contrato.locatarios)
        
        # 5. Salvar garantias se houver
        if contrato.garantias:
            salvar_garantias_individuais(contrato_id, contrato.garantias)
            
        # 6. Salvar pets se houver
        if contrato.pets:
            salvar_pets_contrato(contrato_id, contrato.pets)
        
        return {"message": "Contrato criado", "contrato_id": contrato_id}
        
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")
```

### **Buscar Contrato Completo**
```python
@app.get("/contratos/{contrato_id}/completo")
async def buscar_contrato_completo(contrato_id: int):
    """
    Retorna contrato com todos os relacionamentos.
    """
    contrato = buscar_contrato_base(contrato_id)
    if not contrato:
        raise HTTPException(status_code=404, detail="Contrato não encontrado")
    
    # Buscar relacionamentos
    contrato['locadores'] = buscar_locadores_contrato(contrato_id)
    contrato['locatarios'] = buscar_locatarios_contrato(contrato_id)
    contrato['imovel'] = buscar_imovel_contrato(contrato_id)
    contrato['garantias'] = buscar_garantias_por_contrato(contrato_id)
    contrato['pets'] = buscar_pets_por_contrato(contrato_id)
    
    # Calcular métricas
    contrato['metricas'] = {
        'num_locadores': len(contrato['locadores']),
        'num_locatarios': len(contrato['locatarios']),
        'taxa_transferencia_estimada': calcular_taxa_transferencia(contrato['locadores']),
        'receita_mensal_estimada': sum([
            contrato.get('valor_aluguel', 0),
            contrato.get('valor_iptu', 0),
            contrato.get('valor_condominio', 0),
            contrato.get('valor_seguro', 0)
        ])
    }
    
    return contrato
```

### **Gerar Prestação do Período**
```python
@app.post("/contratos/{contrato_id}/prestacao-contas")
async def gerar_prestacao_periodo(
    contrato_id: int,
    dados: PrestacaoContasRequest
):
    """
    Gera prestação de contas para período específico.
    """
    try:
        prestacao = gerar_prestacao_contas(
            contrato_id=contrato_id,
            mes=dados.mes,
            ano=dados.ano
        )
        
        # Salvar no histórico
        salvar_prestacao_contas(contrato_id, prestacao)
        
        return {
            "message": "Prestação gerada",
            "prestacao": prestacao
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

## 🎨 Interface do Usuário

### **Formulário de Contrato**
```typescript
interface ContratoForm {
    // Dados básicos
    numero_contrato: string;
    id_imovel: number;
    data_inicio: string;
    data_fim: string;
    
    // Valores
    valor_aluguel: number;
    valor_iptu: number;
    valor_condominio: number;
    valor_seguro: number;
    
    // Relacionamentos
    locadores: ContratoLocador[];
    locatarios: ContratoLocatario[];
    
    // Extras
    garantias: Garantia[];
    pets: Pet[];
    observacoes: string;
}

interface ContratoLocador {
    locador_id: number;
    nome: string; // Para exibição
    porcentagem_participacao: number;
    responsabilidade_principal: boolean;
}
```

### **Validações Frontend**
```typescript
const validarContrato = (dados: ContratoForm): string[] => {
    const erros: string[] = [];
    
    // Validar percentuais dos locadores
    const totalLocadores = dados.locadores.reduce(
        (total, loc) => total + loc.porcentagem_participacao, 0
    );
    if (Math.abs(totalLocadores - 100) > 0.01) {
        erros.push('Percentuais dos locadores devem somar 100%');
    }
    
    // Validar percentuais dos locatários
    const totalLocatarios = dados.locatarios.reduce(
        (total, loc) => total + loc.percentual_responsabilidade, 0
    );
    if (Math.abs(totalLocatarios - 100) > 0.01) {
        erros.push('Percentuais dos locatários devem somar 100%');
    }
    
    // Validar datas
    if (new Date(dados.data_fim) <= new Date(dados.data_inicio)) {
        erros.push('Data de fim deve ser posterior à data de início');
    }
    
    // Validar valores
    if (dados.valor_aluguel <= 0) {
        erros.push('Valor do aluguel deve ser maior que zero');
    }
    
    return erros;
};
```

## 📊 Relatórios e Analytics

### **Dashboard de Contratos**
```sql
-- Contratos ativos por mês
SELECT 
    YEAR(data_inicio) as ano,
    MONTH(data_inicio) as mes,
    COUNT(*) as contratos_iniciados,
    SUM(valor_aluguel) as receita_potencial
FROM Contratos 
WHERE status = 'Ativo'
GROUP BY YEAR(data_inicio), MONTH(data_inicio)
ORDER BY ano DESC, mes DESC;

-- Top locadores por receita
SELECT 
    l.nome,
    COUNT(DISTINCT cl.contrato_id) as num_contratos,
    SUM(c.valor_aluguel * cl.porcentagem_participacao / 100) as receita_mensal
FROM Locadores l
JOIN ContratoLocadores cl ON l.id = cl.locador_id
JOIN Contratos c ON cl.contrato_id = c.id
WHERE c.status = 'Ativo' AND cl.ativo = 1
GROUP BY l.id, l.nome
ORDER BY receita_mensal DESC;
```

### **Métricas de Performance**
- **Taxa de ocupação** por período
- **Receita média** por contrato
- **Tempo médio** de contrato
- **Renovações** vs novos contratos
- **Inadimplência** por locatário
- **ROI** por locador

## ⚠️ Pontos de Atenção

### **Concorrência**
```python
# Usar transações para operações críticas
def criar_contrato_atomico(dados):
    with db.transaction():
        contrato_id = criar_contrato_principal(dados)
        salvar_relacionamentos(contrato_id, dados)
        # Se alguma operação falhar, tudo é revertido
```

### **Validações Críticas**
- ✅ Percentuais sempre somam 100%
- ✅ Datas de início < fim
- ✅ Valores sempre positivos
- ✅ Locador/locatário existem
- ✅ Imóvel disponível
- ✅ Não sobrepor contratos do mesmo imóvel

### **Performance**
- ✅ Índices em foreign keys
- ✅ Query otimizada para busca completa
- ✅ Cache de cálculos complexos
- ✅ Paginação em listagens

---
**Atualizado:** 10/09/2025  
**Módulo Contratos v2.0 - Análise Completa**