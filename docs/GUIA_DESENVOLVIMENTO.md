# 👨‍💻 Guia de Desenvolvimento - Sistema de Locação

## 🎯 Para Novos Desenvolvedores

Este guia orienta desenvolvedores que vão trabalhar no sistema pela primeira vez.

## 🏗️ Arquitetura do Projeto

### **Estrutura de Pastas**
```
Locacao/
├── main.py                    # 🚀 Servidor FastAPI principal
├── repositories_adapter.py   # 🗄️ Camada de dados
├── dashboard_sql_server.py   # 📊 Dashboard e métricas  
├── search_api.py             # 🔍 Sistema de busca
├── script10.sql              # 🗃️ Estrutura do banco
├── frontend/                 # 🎨 Interface React
│   ├── src/
│   │   ├── components/       # Componentes reutilizáveis
│   │   ├── pages/           # Páginas principais  
│   │   ├── services/        # Clientes de API
│   │   └── types/           # Tipos TypeScript
└── migrations/               # 📦 Versionamento do banco
```

### **Fluxo de Dados**
```
Frontend (React) → API (FastAPI) → Repository → SQL Server
      ↓                ↓              ↓           ↓
   UI State         Validation    Data Logic   Storage
```

## 🛠️ Como Adicionar uma Nova Feature

### **1. Preparar o Ambiente**
```bash
# Backend
cd Locacao
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
pip install -r requirements.txt

# Frontend  
cd frontend
npm install
```

### **2. Workflow de Desenvolvimento**
```bash
# 1. Iniciar backend
python main.py

# 2. Em outro terminal, iniciar frontend
cd frontend && npm run dev

# 3. Abrir no browser
# Backend: http://localhost:8000/docs
# Frontend: http://localhost:3005
```

### **3. Estrutura de uma Feature Completa**

#### **Exemplo: Adicionar "Categoria de Imóvel"**

**PASSO 1: Banco de Dados**
```sql
-- Adicionar coluna na tabela
ALTER TABLE Imoveis ADD categoria NVARCHAR(50);

-- Índice se necessário
CREATE INDEX IX_Imoveis_Categoria ON Imoveis(categoria);
```

**PASSO 2: Backend (Pydantic)**
```python
# Em main.py
class ImovelCreate(BaseModel):
    # Campos existentes...
    categoria: Optional[str] = None

class ImovelUpdate(BaseModel):
    # Campos existentes...
    categoria: Optional[str] = None
```

**PASSO 3: Repository**
```python
# Em repositories_adapter.py
def criar_imovel(dados):
    # Adicionar categoria nos campos_inserir
    campos_inserir = [
        'tipo', 'endereco', 'valor_aluguel', 
        'categoria'  # ← Novo campo
    ]
    
    valores = [
        dados.get('tipo'),
        dados.get('endereco'), 
        dados.get('valor_aluguel'),
        dados.get('categoria')  # ← Novo valor
    ]
```

**PASSO 4: API Endpoint**
```python
# Em main.py
@app.post("/imoveis")
async def criar_imovel(imovel: ImovelCreate):
    try:
        resultado = inserir_imovel(**imovel.dict())
        return {"message": "Imóvel criado", "data": resultado}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
```

**PASSO 5: Types TypeScript**
```typescript
// Em frontend/src/types/index.ts
export interface Imovel {
    id: number;
    tipo: string;
    endereco: string;
    valor_aluguel: number;
    categoria?: string;  // ← Novo campo
}
```

**PASSO 6: Frontend Service**
```typescript
// Em frontend/src/services/api.ts
async criarImovel(imovel: Imovel): Promise<ApiResponse<any>> {
    return this.request('/imoveis', {
        method: 'POST',
        body: JSON.stringify(imovel)
    });
}
```

**PASSO 7: Componente React**
```typescript
// Em frontend/src/components/forms/ImovelForm.tsx
const [formData, setFormData] = useState<Imovel>({
    tipo: '',
    endereco: '',
    valor_aluguel: 0,
    categoria: ''  // ← Novo campo
});

// No JSX
<Select
    label="Categoria"
    value={formData.categoria}
    onChange={(value) => setFormData({...formData, categoria: value})}
    options={[
        { value: 'residencial', label: 'Residencial' },
        { value: 'comercial', label: 'Comercial' },
        { value: 'industrial', label: 'Industrial' }
    ]}
/>
```

## 🔧 Padrões de Código

### **Backend (Python)**
```python
# ✅ BOM: Função bem documentada
def calcular_aluguel_proporcional(valor_base: float, dias_ocupados: int, total_dias: int) -> float:
    """
    Calcula aluguel proporcional baseado nos dias ocupados.
    
    Args:
        valor_base: Valor integral do aluguel
        dias_ocupados: Dias que o imóvel foi ocupado  
        total_dias: Total de dias do mês
        
    Returns:
        Valor proporcional calculado
    """
    if total_dias <= 0:
        raise ValueError("Total de dias deve ser maior que zero")
        
    percentual = dias_ocupados / total_dias
    return round(valor_base * percentual, 2)

# ❌ RUIM: Função sem documentação
def calc(v, d, t):
    return v * d / t
```

### **Frontend (TypeScript)**
```typescript
// ✅ BOM: Componente tipado e bem estruturado
interface FormularioImovelProps {
    imovel?: Imovel;
    onSalvar: (imovel: Imovel) => Promise<void>;
    onCancelar: () => void;
    readonly?: boolean;
}

export const FormularioImovel: React.FC<FormularioImovelProps> = ({
    imovel,
    onSalvar,
    onCancelar,
    readonly = false
}) => {
    const [formData, setFormData] = useState<Imovel>(
        imovel || {
            id: 0,
            tipo: '',
            endereco: '',
            valor_aluguel: 0
        }
    );
    
    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await onSalvar(formData);
            toast.success('Imóvel salvo com sucesso!');
        } catch (error) {
            toast.error('Erro ao salvar imóvel');
            console.error(error);
        }
    }, [formData, onSalvar]);
    
    return (
        <form onSubmit={handleSubmit}>
            {/* Campos do formulário */}
        </form>
    );
};

// ❌ RUIM: Componente sem tipos
export const FormularioImovel = (props) => {
    // Código sem tipagem...
};
```

## 🐛 Debugging e Logs

### **Backend**
```python
# Logs estruturados
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def criar_locatario(dados):
    logger.info(f"Criando locatário: {dados.get('nome')}")
    
    try:
        resultado = inserir_dados(dados)
        logger.info(f"Locatário criado com ID: {resultado}")
        return resultado
    except Exception as e:
        logger.error(f"Erro ao criar locatário: {e}")
        raise
```

### **Frontend**
```typescript
// Console estruturado
const debug = {
    api: (message: string, data?: any) => {
        console.log(`🌐 API: ${message}`, data);
    },
    form: (message: string, data?: any) => {
        console.log(`📝 FORM: ${message}`, data);
    },
    error: (message: string, error: any) => {
        console.error(`❌ ERROR: ${message}`, error);
    }
};

// Uso
debug.api('Enviando dados de locatário', formData);
debug.form('Validação de CPF', { cpf, valido: isValidCPF(cpf) });
debug.error('Falha na criação', error);
```

## 📊 Testes

### **Backend (pytest)**
```python
# tests/test_calculos.py
import pytest
from main import calcular_aluguel_proporcional

def test_aluguel_proporcional_mes_completo():
    resultado = calcular_aluguel_proporcional(2500.0, 31, 31)
    assert resultado == 2500.0

def test_aluguel_proporcional_meio_mes():
    resultado = calcular_aluguel_proporcional(2500.0, 15, 30)
    assert resultado == 1250.0

def test_aluguel_proporcional_erro_dias_zero():
    with pytest.raises(ValueError):
        calcular_aluguel_proporcional(2500.0, 15, 0)
```

### **Frontend (Jest/React Testing Library)**
```typescript
// tests/ImovelForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FormularioImovel } from '../components/forms/ImovelForm';

test('deve salvar imóvel com dados válidos', async () => {
    const mockSalvar = jest.fn();
    
    render(
        <FormularioImovel 
            onSalvar={mockSalvar}
            onCancelar={() => {}}
        />
    );
    
    fireEvent.change(screen.getByLabelText('Tipo'), {
        target: { value: 'Apartamento' }
    });
    
    fireEvent.change(screen.getByLabelText('Valor do Aluguel'), {
        target: { value: '2500' }
    });
    
    fireEvent.click(screen.getByText('Salvar'));
    
    await waitFor(() => {
        expect(mockSalvar).toHaveBeenCalledWith({
            tipo: 'Apartamento',
            valor_aluguel: 2500,
            // ... outros campos
        });
    });
});
```

## 🚀 Deploy e Produção

### **Variáveis de Ambiente**
```bash
# .env.production
DB_SERVER=production-server
DB_NAME=Locacao_Prod
DB_USER=app_user
DB_PASSWORD=secure_password

API_PORT=8000
CORS_ORIGINS=https://locacao.empresa.com
ENVIRONMENT=production

# Logs
LOG_LEVEL=INFO
LOG_FILE=/var/log/locacao/app.log
```

### **Build do Frontend**
```bash
# Build otimizado
npm run build

# Servir arquivos estáticos
npx serve -s dist -l 3005
```

### **Checklist de Deploy**
- [ ] ✅ Banco de dados migrado
- [ ] ✅ Variáveis de ambiente configuradas
- [ ] ✅ SSL/HTTPS configurado
- [ ] ✅ Backup automático ativo
- [ ] ✅ Monitoramento configurado
- [ ] ✅ Logs estruturados
- [ ] ✅ Testes passando

## 🤝 Colaboração

### **Git Flow**
```bash
# Feature branch
git checkout -b feature/nova-categoria-imovel
git add .
git commit -m "feat: adicionar categoria aos imóveis"
git push origin feature/nova-categoria-imovel

# Pull request para main
# Code review obrigatório
```

### **Padrão de Commits**
```bash
feat: nova funcionalidade
fix: correção de bug  
docs: atualização de documentação
style: formatação de código
refactor: refatoração sem mudança de funcionalidade
test: adição ou correção de testes
```

## 📚 Recursos Úteis

### **Documentação**
- **FastAPI:** https://fastapi.tiangolo.com/
- **React:** https://reactjs.org/docs/
- **TypeScript:** https://www.typescriptlang.org/docs/
- **SQL Server:** https://docs.microsoft.com/sql/

### **Ferramentas Recomendadas**
- **IDE:** VS Code com extensões Python e TypeScript
- **Banco:** SQL Server Management Studio
- **API:** Postman/Insomnia
- **Git:** GitHub Desktop ou linha de comando

---
**Atualizado:** 10/09/2025  
**Para desenvolvedores do Sistema de Locação v2.0**