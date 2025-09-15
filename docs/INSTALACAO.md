# 🚀 Guia de Instalação - Sistema de Locação

## 📋 Pré-requisitos

### Software Necessário
- **Python 3.8+** (recomendado 3.11)
- **Node.js 16+** 
- **SQL Server** (Express ou superior)
- **Git** (opcional)

### Pacotes Python
```bash
pip install fastapi uvicorn pyodbc python-dotenv
```

### Pacotes Node.js (Frontend)
```bash
npm install
```

## 🗄️ Configuração do Banco de Dados

### 1. SQL Server
```sql
-- Criar banco de dados
CREATE DATABASE Locacao;
USE Locacao;

-- Executar script de estrutura
-- Arquivo: script10.sql (contém todas as tabelas)
```

### 2. String de Conexão
Criar arquivo `.env` na raiz do projeto:
```bash
# Database Configuration
DB_SERVER=localhost
DB_NAME=Locacao
DB_USER=sa
DB_PASSWORD=sua_senha_aqui

# API Configuration  
API_PORT=8000
CORS_ORIGINS=http://localhost:3005

# Environment
ENVIRONMENT=development
```

## 🖥️ Instalação do Backend

### 1. Dependências Python
```bash
cd Locacao
pip install -r requirements.txt
```

### 2. Arquivo requirements.txt
```txt
fastapi==0.104.1
uvicorn==0.24.0
pyodbc==5.0.1
python-dotenv==1.0.0
pydantic==2.4.2
```

### 3. Testar Conexão
```bash
python -c "
import pyodbc
conn = pyodbc.connect(
    'DRIVER={ODBC Driver 17 for SQL Server};'
    'SERVER=localhost;'
    'DATABASE=Locacao;'
    'UID=sa;'
    'PWD=sua_senha'
)
print('✅ Conexão com banco OK!')
conn.close()
"
```

### 4. Iniciar Backend
```bash
python main.py
# Servidor disponível em: http://localhost:8000
# Documentação API: http://localhost:8000/docs
```

## 🎨 Instalação do Frontend

### 1. Navegar para Frontend
```bash
cd frontend
```

### 2. Instalar Dependências
```bash
npm install
```

### 3. Configurar Proxy (vite.config.ts)
```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3005,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
```

### 4. Iniciar Frontend
```bash
npm run dev
# Interface disponível em: http://localhost:3005
```

## ✅ Verificação da Instalação

### 1. Testar Backend
```bash
curl http://localhost:8000/health
# Resposta: {"status": "ok"}
```

### 2. Testar API Locadores
```bash
curl http://localhost:8000/locadores
# Resposta: {"data": []}
```

### 3. Testar Frontend
- Acessar: http://localhost:3005
- Verificar carregamento da interface
- Testar navegação entre páginas

### 4. Testar Integração
- Criar um locador via interface
- Verificar se dados aparecem no banco
- Testar busca

## 🔧 Solução de Problemas

### Erro de Conexão com Banco
```bash
# Verificar se SQL Server está rodando
services.msc → SQL Server

# Testar conexão manual
sqlcmd -S localhost -U sa -P sua_senha -Q "SELECT @@VERSION"
```

### Erro de CORS
```python
# Verificar origins no main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3005"],  # Adicionar URL do frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Erro de Porta Ocupada
```bash
# Backend (porta 8000)
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Frontend (porta 3005)  
netstat -ano | findstr :3005
taskkill /PID <PID> /F
```

## 📊 Verificar se Tudo Funciona

### Checklist Final
- [ ] ✅ SQL Server conectando
- [ ] ✅ Backend rodando na porta 8000
- [ ] ✅ Frontend rodando na porta 3005
- [ ] ✅ API respondendo em /health
- [ ] ✅ Interface carregando
- [ ] ✅ Pode criar locador
- [ ] ✅ Pode criar locatário
- [ ] ✅ Dashboard funcionando
- [ ] ✅ Busca funcionando

## 🎯 Próximos Passos

1. **Configurar dados iniciais** (se necessário)
2. **Importar dados existentes** (se houver)
3. **Configurar backup automático**
4. **Personalizar interface** (se necessário)
5. **Configurar environment de produção**

## 📞 Suporte

### Comandos Úteis
```bash
# Verificar logs do backend
python main.py 2>&1 | tee backend.log

# Verificar logs do frontend  
npm run dev 2>&1 | tee frontend.log

# Backup do banco
sqlcmd -S localhost -E -Q "BACKUP DATABASE Locacao TO DISK='C:\backup\locacao.bak'"
```

### Arquivos de Log
- Backend: Logs aparecem no console
- Frontend: Logs no browser (F12 → Console)
- Banco: Event Viewer do Windows

---
**Data:** 10/09/2025  
**Versão:** 2.0 Limpa e Otimizada