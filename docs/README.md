# 🏠 Sistema de Locação

Sistema completo para gestão de imóveis, locadores, locatários e contratos de locação.

## 📋 Estrutura do Sistema

### 🖥️ **Backend (Python + FastAPI)**
- **`main.py`** - Servidor principal da API
- **`repositories_adapter.py`** - Camada de acesso a dados
- **`dashboard_sql_server.py`** - Sistema de dashboard e métricas
- **`search_api.py`** - API de busca avançada

### 🎨 **Frontend (React + TypeScript)**
- **Localização:** `./frontend/`
- **Tecnologias:** React, TypeScript, Vite, TailwindCSS
- **Componentes:** Formulários modernos, dashboard, sistema de busca

### 🗄️ **Banco de Dados**
- **`script10.sql`** - Estrutura atual do banco SQL Server
- **Tabelas principais:** Locadores, Locatarios, Imoveis, Contratos
- **Relacionamentos:** N:N entre contratos-locadores e contratos-locatários

## 🚀 Como Executar

### Backend
```bash
cd Locacao
python main.py
# Servidor rodará em http://localhost:8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Interface rodará em http://localhost:3005
```

## 📂 Módulos Principais

### 👥 **Locadores**
- Cadastro PF e PJ
- Múltiplos contatos (telefones/emails)
- Métodos de pagamento (PIX, conta bancária)
- Dashboard de receitas

### 🏠 **Locatários**
- Cadastro PF e PJ completo
- Representante legal para PJ
- Dados de cônjuge
- Sistema de fiadores

### 🏢 **Imóveis**
- Cadastro com endereço estruturado
- Valores (aluguel, IPTU, condomínio)
- Status de disponibilidade
- Fotos e documentos

### 📄 **Contratos**
- Relacionamento N:N (múltiplos locadores/locatários)
- Gestão de percentuais de responsabilidade
- Sistema de prestação de contas
- Boletos e faturas

## 🔧 APIs Principais

### Endpoints Essenciais
- `GET /locadores` - Listar locadores
- `POST /locadores` - Criar locador
- `GET /locatarios` - Listar locatários
- `POST /locatarios` - Criar locatário
- `GET /imoveis` - Listar imóveis
- `POST /contratos` - Criar contrato
- `GET /dashboard/completo` - Dashboard principal

### Sistema de Busca
- `GET /buscar/global` - Busca global no sistema
- `GET /buscar/locadores` - Busca específica de locadores
- `GET /buscar/contratos` - Busca de contratos

## 🛠️ Configuração

### Variáveis de Ambiente
```bash
# Database
DB_SERVER=localhost
DB_NAME=Locacao
DB_USER=sa
DB_PASSWORD=sua_senha

# API
API_PORT=8000
FRONTEND_URL=http://localhost:3005
```

### Banco de Dados
1. Executar `script10.sql` no SQL Server
2. Configurar string de conexão
3. Verificar tabelas criadas

## 📊 Status do Sistema

- ✅ **Backend:** Funcional e otimizado
- ✅ **Frontend:** Interface moderna e responsiva  
- ✅ **Banco:** Estrutura N:N implementada
- ✅ **APIs:** Endpoints completos
- ✅ **Busca:** Sistema avançado implementado
- ✅ **Dashboard:** Métricas e relatórios

## 🔄 Próximos Passos

1. **Testes automatizados** - Implementar testes unitários
2. **Deploy** - Configurar ambiente de produção
3. **Backup** - Sistema automático de backup
4. **Logs** - Melhorar sistema de logs
5. **Segurança** - Implementar autenticação JWT

## 📝 Notas Importantes

- Sistema otimizado para **SQL Server**
- Suporte completo a **PF e PJ**
- **Representante legal** estruturado para PJ
- **Múltiplos contatos** por entidade
- **Dashboard** com métricas em tempo real
- **Busca avançada** com filtros

---
**Última atualização:** 10/09/2025  
**Versão:** 2.0 - Sistema Limpo e Otimizado