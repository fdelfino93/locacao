# 🔧 Solução de Problemas Comuns

## 🎯 Visão Geral

Este documento lista os problemas mais frequentes encontrados no sistema e suas soluções.

## 🚨 Problemas de Conexão

### **1. Erro: "Cannot connect to SQL Server"**

**Sintomas:**
- API retorna erro 500
- Logs mostram: `pyodbc.OperationalError: Cannot open database`

**Soluções:**
```bash
# 1. Verificar se SQL Server está rodando
services.msc → SQL Server (MSSQLSERVER) → Start

# 2. Testar conexão manual
sqlcmd -S localhost -U sa -P sua_senha -Q "SELECT @@VERSION"

# 3. Verificar firewall
netsh advfirewall firewall add rule name="SQL Server" dir=in action=allow protocol=TCP localport=1433

# 4. Habilitar TCP/IP no SQL Server Configuration Manager
SQL Server Configuration Manager → SQL Server Network Configuration → Protocols → TCP/IP → Enable
```

**Arquivo .env correto:**
```bash
DB_SERVER=localhost
DB_NAME=Locacao
DB_USER=sa
DB_PASSWORD=sua_senha_forte
```

### **2. Erro: "CORS policy blocked"**

**Sintomas:**
- Frontend não consegue acessar API
- Console do browser: `Access to fetch at 'http://localhost:8000' blocked by CORS policy`

**Solução:**
```python
# Em main.py, verificar CORS middleware
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3005",  # ← URL do frontend
        "http://127.0.0.1:3005"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 📊 Problemas de Dados

### **3. Erro: "422 Unprocessable Entity"**

**Sintomas:**
- Formulário não salva
- API retorna erro de validação

**Diagnóstico:**
```python
# Adicionar logs detalhados no backend
@app.post("/locatarios")
async def criar_locatario(locatario: LocatarioCreate):
    print(f"🔍 DADOS RECEBIDOS: {locatario.dict()}")
    
    try:
        resultado = await criar_locatario_db(**locatario.dict())
        return {"data": resultado}
    except ValidationError as e:
        print(f"❌ ERRO DE VALIDAÇÃO: {e}")
        raise HTTPException(status_code=422, detail=str(e))
```

**Soluções Comuns:**
```typescript
// 1. Converter datas vazias para null
const limparDatas = (dados: any) => {
    const camposData = ['data_nascimento', 'data_constituicao'];
    camposData.forEach(campo => {
        if (dados[campo] === '') {
            dados[campo] = null;
        }
    });
    return dados;
};

// 2. Converter números para string quando necessário
if (typeof formData.capital_social === 'number') {
    formData.capital_social = String(formData.capital_social);
}

// 3. Validar CPF/CNPJ
const validarCPFCNPJ = (valor: string, tipo: 'PF' | 'PJ') => {
    if (tipo === 'PF' && valor.length !== 14) { // 123.456.789-01
        throw new Error('CPF deve ter 11 dígitos');
    }
    if (tipo === 'PJ' && valor.length !== 18) { // 12.345.678/0001-90
        throw new Error('CNPJ deve ter 14 dígitos');
    }
};
```

### **4. Representante Legal não aparece**

**Sintomas:**
- Dados do representante não carregam no formulário PJ
- Campo aparece vazio mesmo com dados no banco

**Solução:**
```python
# Verificar se repository retorna como objeto (não array)
def buscar_locatario_completo(locatario_id):
    # ❌ ERRADO: retornar como array
    representante = cursor.fetchall()  # [[dados]]
    
    # ✅ CORRETO: retornar como objeto
    representante = cursor.fetchone()  # [dados] ou None
    
    if representante:
        locatario['representante_legal'] = {
            'nome': representante[1],
            'cpf': representante[2],
            'rg': representante[3],
            # ... outros campos
        }
    else:
        locatario['representante_legal'] = None
```

### **5. Percentuais não somam 100%**

**Sintomas:**
- Erro ao salvar contrato
- Validação falha nos percentuais

**Solução:**
```typescript
const validarPercentuais = (items: Array<{percentual: number}>) => {
    const total = items.reduce((sum, item) => sum + item.percentual, 0);
    const diferenca = Math.abs(total - 100);
    
    if (diferenca > 0.01) { // Tolerância para arredondamento
        throw new Error(`Percentuais somam ${total}%. Devem somar 100%.`);
    }
};

// Auto-ajuste do último item
const ajustarPercentuais = (items: Array<{percentual: number}>) => {
    const total = items.reduce((sum, item, index) => 
        index < items.length - 1 ? sum + item.percentual : sum, 0
    );
    
    // Ajustar último item para completar 100%
    if (items.length > 0) {
        items[items.length - 1].percentual = 100 - total;
    }
    
    return items;
};
```

## 🎨 Problemas de Interface

### **6. Página em branco / Not loading**

**Sintomas:**
- Interface não carrega
- Tela branca no browser

**Diagnóstico:**
```bash
# 1. Verificar console do browser (F12)
# Procurar por erros JavaScript

# 2. Verificar se backend está rodando
curl http://localhost:8000/health

# 3. Verificar se frontend está buildando
cd frontend && npm run dev
```

**Soluções:**
```typescript
// 1. Adicionar ErrorBoundary
class ErrorBoundary extends React.Component {
    state = { hasError: false, error: null };
    
    static getDerivedStateFromError(error: any) {
        return { hasError: true, error };
    }
    
    componentDidCatch(error: any, errorInfo: any) {
        console.error('💥 ERRO CAPTURADO:', error, errorInfo);
    }
    
    render() {
        if (this.state.hasError) {
            return (
                <div className="error-fallback">
                    <h2>Algo deu errado 😞</h2>
                    <details>
                        <summary>Detalhes do erro</summary>
                        <pre>{this.state.error?.toString()}</pre>
                    </details>
                    <button onClick={() => window.location.reload()}>
                        Recarregar página
                    </button>
                </div>
            );
        }
        
        return this.props.children;
    }
}

// 2. Envolver app com ErrorBoundary
<ErrorBoundary>
    <App />
</ErrorBoundary>
```

### **7. Formulário não envia dados**

**Sintomas:**
- Botão de salvar não funciona
- Dados não chegam ao backend

**Soluções:**
```typescript
// 1. Verificar prevent default
const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // ← Importante!
    
    // Validar dados
    const erros = validarFormulario(formData);
    if (erros.length > 0) {
        setErros(erros);
        return;
    }
    
    // Enviar dados
    salvarDados(formData);
};

// 2. Adicionar loading state
const [salvando, setSalvando] = useState(false);

const salvarDados = async (dados: any) => {
    setSalvando(true);
    try {
        await apiService.criarLocatario(dados);
        toast.success('Salvo com sucesso!');
    } catch (error) {
        console.error('Erro ao salvar:', error);
        toast.error('Erro ao salvar dados');
    } finally {
        setSalvando(false);
    }
};

// 3. Botão com estados
<Button 
    type="submit" 
    disabled={salvando}
    className={salvando ? 'loading' : ''}
>
    {salvando ? 'Salvando...' : 'Salvar'}
</Button>
```

## 🔧 Problemas de Performance

### **8. API muito lenta**

**Sintomas:**
- Requests demoram mais de 5 segundos
- Interface trava durante carregamento

**Soluções:**
```python
# 1. Adicionar índices no banco
CREATE INDEX IX_Locadores_Nome ON Locadores(nome);
CREATE INDEX IX_Locadores_CPF ON Locadores(cpf_cnpj);
CREATE INDEX IX_Contratos_Status ON Contratos(status, data_inicio);

# 2. Otimizar queries N+1
def buscar_contratos_otimizado():
    # ❌ RUIM: N+1 queries
    contratos = buscar_contratos()
    for contrato in contratos:
        contrato['locadores'] = buscar_locadores(contrato.id)  # N queries
    
    # ✅ BOM: 1 query com JOIN
    query = """
        SELECT c.*, l.nome as locador_nome
        FROM Contratos c
        LEFT JOIN ContratoLocadores cl ON c.id = cl.contrato_id
        LEFT JOIN Locadores l ON cl.locador_id = l.id
        WHERE c.status = 'Ativo'
    """

# 3. Cache de resultados
from functools import lru_cache

@lru_cache(maxsize=100)
def buscar_dashboard_cached():
    return calcular_dashboard()
```

### **9. Frontend lento / travando**

**Soluções:**
```typescript
// 1. Usar React.memo para componentes pesados
const ListaContratos = React.memo(({ contratos }: { contratos: Contrato[] }) => {
    return (
        <div>
            {contratos.map(contrato => (
                <ContratoCard key={contrato.id} contrato={contrato} />
            ))}
        </div>
    );
});

// 2. Usar useCallback para funções
const handleSearch = useCallback(
    debounce(async (termo: string) => {
        if (termo.length >= 3) {
            const resultados = await apiService.buscar(termo);
            setResultados(resultados);
        }
    }, 300),
    []
);

// 3. Virtualização para listas grandes
import { FixedSizeList as List } from 'react-window';

const ListaVirtualizada = ({ items }: { items: any[] }) => (
    <List
        height={600}
        itemCount={items.length}
        itemSize={80}
        itemData={items}
    >
        {({ index, style, data }) => (
            <div style={style}>
                <ItemComponent item={data[index]} />
            </div>
        )}
    </List>
);
```

## 🐛 Debugging Avançado

### **10. Como debugar problemas complexos**

**Backend Debugging:**
```python
# 1. Logs estruturados
import logging
import json

logger = logging.getLogger(__name__)

def log_request(endpoint: str, dados: dict):
    logger.info(f"🌐 {endpoint}: {json.dumps(dados, indent=2, default=str)}")

def log_error(erro: Exception, contexto: str):
    logger.error(f"❌ {contexto}: {type(erro).__name__}: {str(erro)}")
    import traceback
    logger.error(traceback.format_exc())

# 2. Middleware de debugging
@app.middleware("http")
async def debug_middleware(request: Request, call_next):
    start_time = time.time()
    
    # Log request
    body = await request.body()
    logger.info(f"📥 {request.method} {request.url}")
    if body:
        logger.info(f"📦 Body: {body.decode()}")
    
    response = await call_next(request)
    
    # Log response
    process_time = time.time() - start_time
    logger.info(f"📤 Response: {response.status_code} ({process_time:.3f}s)")
    
    return response
```

**Frontend Debugging:**
```typescript
// 1. Interceptador de API
const apiClient = axios.create({
    baseURL: '/api'
});

apiClient.interceptors.request.use(request => {
    console.log('📤 REQUEST:', {
        method: request.method?.toUpperCase(),
        url: request.url,
        data: request.data
    });
    return request;
});

apiClient.interceptors.response.use(
    response => {
        console.log('📥 RESPONSE:', {
            status: response.status,
            data: response.data
        });
        return response;
    },
    error => {
        console.error('❌ ERROR:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        return Promise.reject(error);
    }
);

// 2. Hook de debugging
const useDebugValue = (label: string, value: any) => {
    useEffect(() => {
        console.log(`🔍 ${label}:`, value);
    }, [label, value]);
};
```

## 📞 Suporte e Escalação

### **Quando Procurar Ajuda**
1. **Erro de banco** → Verificar logs do SQL Server
2. **Erro de API** → Verificar logs do Python
3. **Erro de interface** → Verificar console do browser
4. **Performance** → Usar ferramentas de profiling

### **Informações para Coleta**
- **Versão do sistema** e data do deploy
- **Passos para reproduzir** o problema
- **Logs de erro** completos
- **Dados de entrada** que causaram o problema
- **Ambiente** (desenvolvimento/produção)

---
**Atualizado:** 10/09/2025  
**Guia de Troubleshooting v2.0**