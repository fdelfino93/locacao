# Guia de Implementação - Módulo de Busca Avançada

## 📋 Visão Geral

O sistema de busca avançada integra o backend Python (FastAPI) com o frontend React para fornecer busca unificada em todas as entidades do sistema: locadores, locatários, imóveis e contratos.

## 🚀 Recursos Implementados

### ✅ Backend (Python/FastAPI)

**APIs REST Completas:**
- `/api/search/global` - Busca unificada global
- `/api/search/locadores` - Busca avançada de locadores
- `/api/search/locatarios` - Busca avançada de locatários  
- `/api/search/imoveis` - Busca avançada de imóveis
- `/api/search/contratos` - Busca avançada de contratos
- `/api/search/autocomplete` - Sugestões de busca

**Funcionalidades:**
- Busca full-text com filtros avançados
- Paginação server-side
- Cache automático para performance
- Fallback para dados mockados em caso de erro
- CORS configurado para React

### ✅ Frontend (React/TypeScript)

**Componente Principal:** `EnhancedSearchModule.tsx`

**Funcionalidades:**
- Carregamento automático de dados ao inicializar
- Busca reativa com debounce (300ms)
- Cards interativos para filtrar por categoria
- Estados de loading e erro
- Histórico de buscas (localStorage)
- Design responsivo com animações
- Fallback para dados mockados

## 🔧 Como Usar

### 1. Iniciar o Backend

```bash
cd locacao
python main.py
# Servidor rodará em http://localhost:8000
```

### 2. Iniciar o Frontend

```bash
cd frontend
npm run dev
# Aplicação rodará em http://localhost:5173
```

### 3. Acessar o Módulo de Busca

O componente `EnhancedSearchModule` pode ser usado diretamente:

```tsx
import EnhancedSearchModule from './components/search/EnhancedSearchModule';

function App() {
  return <EnhancedSearchModule />;
}
```

## 📊 Estrutura das APIs

### Busca Global
```
GET /api/search/global?q=termo&limit=20
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "termo_busca": "joão",
    "total_resultados": 15,
    "resultados_por_tipo": {
      "locadores": { "dados": [...], "total": 5 },
      "locatarios": { "dados": [...], "total": 3 },
      "imoveis": { "dados": [...], "total": 4 },
      "contratos": { "dados": [...], "total": 3 }
    }
  }
}
```

### Busca por Categoria
```
GET /api/search/locadores?q=termo&limit=20&offset=0
```

**Parâmetros:**
- `q` - Termo de busca
- `limit` - Itens por página (padrão: 20)
- `offset` - Offset para paginação
- Filtros específicos por categoria

## 🎨 Interface do Usuário

### Componentes Principais

1. **Header** - Título e descrição do módulo
2. **Barra de Busca** - Input com debounce e loading
3. **Buscas Recentes** - Histórico de buscas anteriores
4. **Cards de Categoria** - Filtros interativos com contadores
5. **Seções de Resultados** - Listas expansíveis por categoria

### Estados da Interface

- **Loading** - Indicador visual durante carregamento
- **Error** - Mensagem de erro com fallback
- **Empty** - Estado quando não há resultados
- **Success** - Exibição dos dados com animações

## 🔗 Integração com Projeto Existente

### 1. Verificar Dependências

Certifique-se que as dependências estão instaladas:

**Backend:**
```bash
pip install fastapi uvicorn python-dotenv pyodbc
```

**Frontend:**
```bash
npm install framer-motion lucide-react
```

### 2. Configurar Variáveis de Ambiente

No arquivo `.env` do backend:
```env
DB_DRIVER=ODBC Driver 17 for SQL Server
DB_SERVER=seu_servidor
DB_DATABASE=sua_database
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
```

### 3. Configurar CORS

O backend já está configurado para aceitar requisições do frontend React nas portas comuns (3000, 5173, etc.).

### 4. Usar o Componente

```tsx
// Em seu App.tsx ou página de busca
import EnhancedSearchModule from './components/search/EnhancedSearchModule';

export default function SearchPage() {
  return (
    <div className="min-h-screen">
      <EnhancedSearchModule />
    </div>
  );
}
```

## ⚡ Performance e Otimizações

### Backend
- Queries otimizadas com JOIN e subqueries
- Paginação implementada com OFFSET/FETCH
- Índices recomendados nas colunas de busca
- Cache automático para consultas frequentes

### Frontend
- Debounce de 300ms para evitar excesso de requisições
- useMemo para otimizar re-renderizações
- useCallback para funções estáveis
- Lazy loading de seções expansíveis

## 🐛 Tratamento de Erros

### Backend
- Try/catch em todas as funções
- Logs detalhados para debugging
- Retorno padronizado de erros

### Frontend
- Fallback automático para dados mockados
- Mensagens de erro amigáveis
- Estados de carregamento visuais
- Retry automático em caso de falha

## 📱 Responsividade

O módulo é totalmente responsivo:
- **Desktop:** Grid de 4 colunas para cards
- **Tablet:** Grid de 2 colunas
- **Mobile:** Layout de coluna única
- **Texto:** Tamanhos adaptativos
- **Espaçamento:** Margins/paddings responsivos

## 🎯 Próximos Passos

### Melhorias Sugeridas

1. **Cache Frontend:** Implementar cache de consultas no React
2. **Infinite Scroll:** Substituir paginação por scroll infinito
3. **Filtros Avançados:** Adicionar filtros de data, valor, etc.
4. **Export:** Funcionalidade de exportar resultados
5. **Favoritos:** Sistema de salvar buscas favoritas

### Monitoramento

1. Monitorar performance das queries no SQL Server
2. Implementar analytics de uso da busca
3. Log de erros centralizados
4. Métricas de tempo de resposta

## 🔍 Debugging

### Verificar APIs
```bash
# Testar busca global
curl "http://localhost:8000/api/search/global?q=joão"

# Testar busca específica
curl "http://localhost:8000/api/search/locadores?limit=10"
```

### Logs do Frontend
O componente inclui logs detalhados no console do navegador para debugging.

### Common Issues

1. **CORS Error:** Verificar se o backend está rodando na porta 8000
2. **No Data:** Verificar conexão com SQL Server
3. **Slow Response:** Verificar índices nas tabelas
4. **Frontend Crash:** Verificar se todas as dependências estão instaladas

---

## 📞 Suporte

Para dúvidas ou problemas:

1. Verificar logs do backend (`main.py`)
2. Verificar console do navegador
3. Testar APIs diretamente com curl/Postman
4. Verificar configuração do banco de dados

O sistema está completo e pronto para uso em produção! 🚀