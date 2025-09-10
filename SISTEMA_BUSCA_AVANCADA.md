# 🔍 Sistema de Busca Avançada

## 🎯 Visão Geral

O sistema de busca permite localizar rapidamente informações em todo o banco de dados através de:
- **Busca global** em todas as entidades
- **Filtros específicos** por tipo de dados
- **Busca inteligente** com sugestões
- **Resultados consolidados** com relevância

## 🔧 Implementação Técnica

### **API de Busca (search_api.py)**
```python
# Busca global em todas as entidades
def buscar_global(termo: str, limite: int = 50):
    return {
        "locadores": buscar_locadores(termo, limite),
        "locatarios": buscar_locatarios(termo, limite), 
        "imoveis": buscar_imoveis(termo, limite),
        "contratos": buscar_contratos(termo, limite)
    }

# Busca específica com filtros
def buscar_locadores(termo: str, filtros: dict = None):
    # WHERE nome LIKE %termo% OR cpf_cnpj LIKE %termo%
    # AND tipo_pessoa = filtros.get('tipo_pessoa')
```

### **Endpoints Disponíveis**
```python
GET /buscar/global?termo=joão&limite=20
GET /buscar/locadores?termo=silva&tipo_pessoa=PF
GET /buscar/imoveis?termo=centro&status=Disponivel
GET /buscar/contratos?termo=123&status=Ativo
GET /buscar/sugestoes  # Termos mais buscados
```

## 🎨 Interface de Busca

### **Componente Principal**
```typescript
interface BuscaAvancadaProps {
    placeholder?: string;
    tipo?: 'global' | 'locadores' | 'locatarios' | 'imoveis' | 'contratos';
    filtros?: FiltrosBusca;
    onResultados?: (resultados: ResultadosBusca) => void;
}

interface ResultadosBusca {
    locadores?: Locador[];
    locatarios?: Locatario[];
    imoveis?: Imovel[];
    contratos?: Contrato[];
    total: number;
    tempo_execucao: number;
}
```

### **Funcionalidades da Interface**
- **Campo de busca** com autocompletar
- **Filtros rápidos** por categoria
- **Resultados agrupados** por tipo
- **Ordenação** por relevância
- **Paginação** automática
- **Destaque** dos termos encontrados

## 🔎 Tipos de Busca

### **1. Busca Global**
Pesquisa simultânea em todas as entidades:
```
Termo: "joão silva"
Resultados:
├── Locadores (3)
│   ├── João Silva Santos (PF)
│   └── João da Silva LTDA (PJ)
├── Locatários (1)
│   └── Maria João Silva (PF)
├── Contratos (2)
│   └── Contrato #123 - João Silva
└── Imóveis (0)
```

### **2. Busca por CPF/CNPJ**
```
Termo: "123.456.789-01"
Resultado direto:
- João Silva Santos (Locador PF)
- Vinculado aos contratos: #123, #456
```

### **3. Busca por Endereço**
```
Termo: "rua das flores"
Resultados:
├── Imóveis (2)
│   ├── Rua das Flores, 123
│   └── Rua das Flores, 456
└── Locadores (1)
    └── Pedro Santos (endereço residencial)
```

### **4. Busca por Contrato**
```
Termo: "123"
Resultados:
├── Contratos (1)
│   └── #123 - João Silva ↔ Casa Centro
├── Relacionados:
│   ├── Locador: João Silva Santos
│   ├── Locatário: Maria da Silva
│   └── Imóvel: Rua das Flores, 123
```

## ⚡ Recursos Avançados

### **Autocomplete Inteligente**
```typescript
// Sugestões baseadas em histórico
const sugestoes = [
    "João Silva",           // Nome completo
    "123.456.789-01",      // CPF formatado
    "Rua das Flores",      // Endereço parcial
    "Contrato #123",       // Referência de contrato
    "Centro",              // Bairro
    "Disponível"           // Status
];
```

### **Filtros Contextuais**
```typescript
interface FiltrosBusca {
    // Locadores/Locatários
    tipo_pessoa?: 'PF' | 'PJ';
    ativo?: boolean;
    
    // Imóveis
    status?: 'Disponivel' | 'Ocupado' | 'Manutencao';
    tipo_imovel?: 'Casa' | 'Apartamento' | 'Comercial';
    bairro?: string;
    
    // Contratos
    status_contrato?: 'Ativo' | 'Encerrado' | 'Pendente';
    data_inicio?: DateRange;
    valor_min?: number;
    valor_max?: number;
}
```

### **Busca por Proximidade**
```python
# Busca fonética e aproximada
def buscar_aproximada(termo: str):
    # "joao" encontra "João"
    # "silva" encontra "Silva", "Sylva"
    # "123456" encontra "123.456.789-01"
    pass
```

## 📊 Analytics de Busca

### **Métricas Coletadas**
```python
def registrar_busca(termo: str, resultados: int, usuario_id: int):
    # Log para analytics
    analytics = {
        "termo": termo,
        "total_resultados": resultados,
        "timestamp": datetime.now(),
        "usuario_id": usuario_id,
        "tempo_execucao": tempo_ms
    }
```

### **Relatórios de Uso**
- **Termos mais buscados** do mês
- **Buscas sem resultados** (para melhorias)
- **Performance** por tipo de busca
- **Usuários mais ativos** na busca

## 🎨 Componentes React

### **BuscaGlobal.tsx**
```typescript
export const BuscaGlobal: React.FC = () => {
    const [termo, setTermo] = useState('');
    const [resultados, setResultados] = useState<ResultadosBusca | null>(null);
    const [carregando, setCarregando] = useState(false);
    
    const buscar = useCallback(async () => {
        setCarregando(true);
        try {
            const response = await apiService.buscarGlobal(termo);
            setResultados(response.data);
        } finally {
            setCarregando(false);
        }
    }, [termo]);
    
    return (
        <div className="busca-container">
            <SearchInput 
                value={termo}
                onChange={setTermo}
                onSearch={buscar}
                placeholder="Buscar locadores, contratos, imóveis..."
            />
            {resultados && (
                <ResultadosGrid resultados={resultados} />
            )}
        </div>
    );
};
```

### **FiltrosBusca.tsx**
```typescript
export const FiltrosBusca: React.FC<FiltrosProps> = ({ 
    tipo, 
    filtros, 
    onChange 
}) => {
    return (
        <div className="filtros-container">
            <Select
                label="Tipo de Pessoa"
                value={filtros.tipo_pessoa}
                onChange={(value) => onChange({...filtros, tipo_pessoa: value})}
                options={[
                    { value: 'PF', label: 'Pessoa Física' },
                    { value: 'PJ', label: 'Pessoa Jurídica' }
                ]}
            />
            
            <Switch
                label="Apenas Ativos"
                checked={filtros.ativo}
                onChange={(checked) => onChange({...filtros, ativo: checked})}
            />
        </div>
    );
};
```

## 🔧 Otimizações

### **Índices de Banco**
```sql
-- Índices para performance
CREATE INDEX IX_Locadores_Nome ON Locadores(nome);
CREATE INDEX IX_Locadores_CPF ON Locadores(cpf_cnpj);
CREATE INDEX IX_Locatarios_Nome ON Locatarios(nome);
CREATE INDEX IX_Imoveis_Endereco ON Imoveis(endereco_rua, endereco_bairro);

-- Índice composto para buscas complexas
CREATE INDEX IX_Contratos_Busca ON Contratos(status, data_inicio, valor_aluguel);
```

### **Cache de Resultados**
```python
from functools import lru_cache

@lru_cache(maxsize=100)
def buscar_cached(termo: str, tipo: str = 'global'):
    # Cache de 15 minutos para buscas repetidas
    return executar_busca(termo, tipo)
```

### **Paginação Inteligente**
```typescript
const useBuscaPaginada = (termo: string) => {
    const [pagina, setPagina] = useState(1);
    const [resultados, setResultados] = useState([]);
    const [carregandoMais, setCarregandoMais] = useState(false);
    
    const carregarMais = useCallback(async () => {
        setCarregandoMais(true);
        const novosResultados = await apiService.buscar(termo, pagina + 1);
        setResultados(prev => [...prev, ...novosResultados]);
        setPagina(prev => prev + 1);
        setCarregandoMais(false);
    }, [termo, pagina]);
    
    return { resultados, carregarMais, carregandoMais };
};
```

## 📱 UX/UI

### **Estados da Busca**
- **Vazio:** Sugestões de termos populares
- **Digitando:** Autocomplete em tempo real
- **Carregando:** Loading spinner elegante
- **Resultados:** Grid organizado por categoria
- **Sem resultados:** Sugestões de termos similares
- **Erro:** Retry automático

### **Teclado e Navegação**
- **Enter:** Executar busca
- **Esc:** Limpar campo
- **↑/↓:** Navegar sugestões
- **Tab:** Aplicar filtros
- **Ctrl+K:** Abrir busca rápida (atalho global)

---
**Atualizado:** 10/09/2025  
**Sistema de Busca v2.0 - Otimizado**