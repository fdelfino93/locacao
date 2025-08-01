# Migração para React + FastAPI

Este projeto foi migrado do Streamlit para uma arquitetura com:
- **Backend**: FastAPI (Python)
- **Frontend**: React + TypeScript com Tailwind CSS e componentes UI modernos
- **Banco de dados**: SQL Server (mantido o mesmo)

## Estrutura do Projeto

```
Locacao/
├── backend (Python + FastAPI)
│   ├── main.py                 # API FastAPI principal
│   ├── requirements.txt        # Dependências Python
│   ├── locacao/               # Módulos originais mantidos
│   │   └── repositories/      # Repositórios de dados
│   └── .env                   # Configurações do banco
└── frontend/                  # Aplicação React
    ├── src/
    │   ├── components/        # Componentes React
    │   │   ├── forms/         # Formulários
    │   │   └── ui/            # Componentes de UI
    │   ├── services/          # Comunicação com API
    │   └── types/             # Tipos TypeScript
    ├── package.json           # Dependências Node.js
    └── tailwind.config.js     # Configuração Tailwind
```

## Como executar localmente

### 1. Preparar o Backend (FastAPI)

1. **Instalar dependências Python:**
   ```bash
   cd C:\Users\fernando\Documents\PY\Locacao
   pip install -r requirements.txt
   ```

2. **Configurar arquivo .env:**
   Certifique-se de que o arquivo `.env` existe com as configurações do SQL Server:
   ```env
   DB_DRIVER=ODBC Driver 17 for SQL Server
   DB_SERVER=seu_servidor
   DB_DATABASE=sua_database
   DB_USER=seu_usuario
   DB_PASSWORD=sua_senha
   ```

3. **Executar a API:**
   ```bash
   uvicorn main:app --reload
   ```
   A API estará disponível em: `http://localhost:8000`
   Documentação da API: `http://localhost:8000/docs`

### 2. Preparar o Frontend (React)

1. **Instalar dependências Node.js:**
   ```bash
   cd C:\Users\fernando\Documents\PY\Locacao\frontend
   npm install
   ```

2. **Executar o frontend:**
   ```bash
   npm run dev
   ```
   A aplicação estará disponível em: `http://localhost:5173`

## Funcionalidades Implementadas

### ✅ Formulários Migrados:
- **Cadastro de Cliente** - Todos os campos do Streamlit
- **Cadastro de Inquilino** - Todos os campos do Streamlit  
- **Cadastro de Imóvel** - Todos os campos do Streamlit

### ✅ API Endpoints:
- `POST /api/clientes` - Criar cliente
- `GET /api/clientes` - Listar clientes
- `POST /api/inquilinos` - Criar inquilino
- `GET /api/inquilinos` - Listar inquilinos
- `POST /api/imoveis` - Criar imóvel
- `GET /api/imoveis` - Listar imóveis

### ✅ Características da Interface:
- Design moderno com Tailwind CSS
- Componentes reutilizáveis (baseados em Radix UI)
- Validação de formulários
- Feedback visual (mensagens de sucesso/erro)
- Interface responsiva
- Navegação entre formulários

## Diferenças da versão Streamlit

### Melhorias:
- Interface mais moderna e responsiva
- Melhor experiência do usuário
- API REST para futuras integrações
- Separação clara entre frontend e backend
- Componentes reutilizáveis
- TypeScript para melhor tipagem

### Funcionalidades mantidas:
- Todos os campos dos formulários originais
- Mesma lógica de validação
- Conexão com SQL Server
- Estrutura de dados idêntica

## Próximos Passos (Opcionais)

Para expandir o sistema, você poderá:

1. **Adicionar autenticação/autorização**
2. **Implementar CRUD completo** (editar/deletar registros)
3. **Adicionar relatórios e dashboards**
4. **Implementar upload de arquivos**
5. **Adicionar notificações em tempo real**
6. **Criar aplicativo mobile com React Native**

## Tecnologias Utilizadas

### Backend:
- FastAPI
- Pydantic (validação)
- pyodbc (SQL Server)
- uvicorn (servidor ASGI)

### Frontend:
- React 18
- TypeScript
- Tailwind CSS
- Radix UI
- Vite (build tool)
- Lucide React (ícones)

## Solução de Problemas

### Erro de conexão com banco:
- Verifique as configurações no arquivo `.env`
- Confirme se o SQL Server está executando
- Teste a conexão com o código original

### Erro CORS:
- **Solução implementada**: O arquivo `vite.config.ts` foi configurado com proxy para redirecionar chamadas de `/api` e `/health` para `http://localhost:8000`
- Isso resolve problemas de CORS em desenvolvimento local
- A configuração no `vite.config.ts`:
  ```ts
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/health': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  }
  ```

### Erro de dependências:
- Para Python: `pip install -r requirements.txt`
- Para Node.js: `npm install` na pasta `frontend/`