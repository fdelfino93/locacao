# 🔧 Documentação Técnica - Sistema de Locação

## 🏗️ Arquitetura do Sistema

### Backend (FastAPI + SQL Server)
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    main.py      │───▶│repositories_    │───▶│   SQL Server    │
│   (FastAPI)     │    │   adapter.py    │    │   Database      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│  search_api.py  │    │dashboard_sql_   │
│   (Busca)       │    │  server.py      │
└─────────────────┘    └─────────────────┘
```

### Frontend (React + TypeScript)
```
frontend/
├── src/
│   ├── components/
│   │   ├── forms/          # Formulários principais
│   │   ├── ui/             # Componentes base
│   │   └── pages/          # Páginas principais
│   ├── services/
│   │   └── api.ts          # Cliente da API
│   └── types/              # Tipos TypeScript
└── package.json
```

## 📊 Estrutura do Banco de Dados

### Tabelas Principais

#### **Locadores**
```sql
CREATE TABLE Locadores (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nome NVARCHAR(200) NOT NULL,
    cpf_cnpj NVARCHAR(18),
    tipo_pessoa NVARCHAR(2), -- 'PF' ou 'PJ'
    -- Campos de endereço estruturado
    endereco_rua NVARCHAR(200),
    endereco_numero NVARCHAR(10),
    -- ... outros campos
)
```

#### **Locatarios**
```sql
CREATE TABLE Locatarios (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nome NVARCHAR(200) NOT NULL,
    cpf_cnpj NVARCHAR(18),
    tipo_pessoa NVARCHAR(2),
    -- Campos específicos para PJ
    data_constituicao DATE,
    capital_social DECIMAL(18,2),
    porte_empresa NVARCHAR(50),
    regime_tributario NVARCHAR(50),
    -- ... outros campos
)
```

#### **RepresentanteLegalLocatario**
```sql
CREATE TABLE RepresentanteLegalLocatario (
    id INT IDENTITY(1,1) PRIMARY KEY,
    id_locatario INT,
    nome NVARCHAR(200) NOT NULL,
    cpf NVARCHAR(14) NOT NULL,
    rg NVARCHAR(20),
    endereco NVARCHAR(500), -- String formatada
    telefone NVARCHAR(20),
    email NVARCHAR(200),
    cargo NVARCHAR(100)
)
```

#### **Relacionamentos N:N**
```sql
-- Múltiplos locadores por contrato
CREATE TABLE ContratoLocadores (
    id INT IDENTITY(1,1) PRIMARY KEY,
    contrato_id INT,
    locador_id INT,
    porcentagem_participacao DECIMAL(5,2),
    responsabilidade_principal BIT
)

-- Múltiplos locatários por contrato  
CREATE TABLE ContratoLocatarios (
    id INT IDENTITY(1,1) PRIMARY KEY,
    contrato_id INT,
    locatario_id INT,
    percentual_responsabilidade DECIMAL(5,2),
    responsabilidade_principal BIT
)
```

## 🔌 APIs e Endpoints

### **Locadores**
```python
# Listar locadores
GET /locadores
Response: { "data": [{"id": 1, "nome": "João", ...}] }

# Criar locador
POST /locadores
Body: {
    "nome": "João Silva",
    "cpf_cnpj": "12345678901",
    "tipo_pessoa": "PF",
    "endereco": {...},
    "telefones": ["41999999999"],
    "emails": ["joao@email.com"]
}
```

### **Locatários**
```python
# Criar locatário PJ com representante
POST /locatarios
Body: {
    "nome": "Empresa LTDA",
    "cpf_cnpj": "12345678000100",
    "tipo_pessoa": "PJ",
    "data_constituicao": "2020-01-01",
    "capital_social": "50000.00",
    "representante_legal": {
        "nome": "Maria Silva",
        "cpf": "12345678901",
        "cargo": "Gerente",
        "endereco": "Rua A, 123, Centro, Curitiba-PR"
    }
}
```

### **Dashboard**
```python
# Dashboard completo
GET /dashboard/completo?mes=9&ano=2025
Response: {
    "metricas": {...},
    "ocupacao": {...},
    "vencimentos": [...],
    "alertas": [...]
}
```

## 🔍 Sistema de Busca

### **Busca Global**
```python
GET /buscar/global?termo=joão&limite=50
Response: {
    "locadores": [...],
    "locatarios": [...],
    "imoveis": [...],
    "contratos": [...]
}
```

### **Implementação Interna**
```python
def buscar_global(termo: str, limite: int = 50):
    # Busca em múltiplas tabelas simultaneamente
    resultados = {
        "locadores": buscar_locadores(termo, limite),
        "locatarios": buscar_locatarios(termo, limite),
        "imoveis": buscar_imoveis(termo, limite),
        "contratos": buscar_contratos(termo, limite)
    }
    return resultados
```

## 🎨 Frontend - Componentes Principais

### **ModernLocatarioFormV2.tsx**
```typescript
interface FormData {
    nome: string;
    cpf_cnpj: string;
    tipo_pessoa: 'PF' | 'PJ';
    // Campos PJ
    data_constituicao?: string;
    capital_social?: string;
    porte_empresa?: string;
    regime_tributario?: string;
    // Representante legal
    nome_representante?: string;
    cpf_representante?: string;
    endereco_representante?: EnderecoEstruturado;
}
```

### **API Service**
```typescript
class ApiService {
    async criarLocatario(locatario: Locatario): Promise<ApiResponse<any>> {
        return this.request('/locatarios', {
            method: 'POST',
            body: JSON.stringify(locatario)
        });
    }
    
    async obterDashboardCompleto(mes?: number, ano?: number): Promise<DashboardCompleto> {
        const params = new URLSearchParams();
        if (mes) params.append('mes', mes.toString());
        if (ano) params.append('ano', ano.toString());
        
        const response = await fetch(`${API_BASE_URL}/dashboard/completo?${params}`);
        return response.json();
    }
}
```

## 🔄 Fluxos de Dados

### **Cadastro de Locatário PJ**
```
1. Frontend coleta dados do formulário
2. Valida campos obrigatórios
3. Converte tipos (data_nascimento: string→null, capital_social: number→string)
4. Estrutura endereço do representante legal
5. Envia para API POST /locatarios
6. Backend valida via Pydantic
7. repositories_adapter.py processa dados
8. Insere na tabela Locatarios
9. Insere representante em RepresentanteLegalLocatario
10. Retorna sucesso
```

### **Carregamento de Dados**
```
1. Frontend solicita dados via GET
2. repositories_adapter.py busca na tabela principal
3. Faz JOIN com tabelas relacionadas (representante, telefones, emails)
4. Converte representante_legal de array para objeto
5. Formata endereço estruturado
6. Retorna dados formatados
7. Frontend mapeia para estado do formulário
```

## 🛠️ Configurações Importantes

### **Tipos de Conversão**
```python
# Data vazias → null
if field_value == '':
    field_value = None

# Capital social → string  
if isinstance(capital_social, (int, float)):
    capital_social = str(capital_social)

# Endereço estruturado → string
endereco_str = f"{rua}, {numero}, {bairro}, {cidade}-{estado}, CEP: {cep}"
```

### **Validações Críticas**
- CPF/CNPJ único por tipo_pessoa
- Representante legal obrigatório para PJ
- Percentuais de responsabilidade somam 100%
- Pelo menos um contato (telefone ou email)

## 📋 Checklist de Manutenção

### ✅ **Para Novas Features**
- [ ] Atualizar modelo Pydantic em `main.py`
- [ ] Adicionar campo em `repositories_adapter.py`
- [ ] Atualizar tipos TypeScript
- [ ] Modificar formulários React
- [ ] Testar conversões de dados
- [ ] Verificar validações

### ✅ **Para Debugging**
- [ ] Verificar logs no backend
- [ ] Inspecionar Network no browser
- [ ] Validar estrutura JSON enviada
- [ ] Conferir mapeamento de campos
- [ ] Testar queries SQL

---
**Atualização:** 10/09/2025  
**Desenvolvedor:** Sistema Claude Code