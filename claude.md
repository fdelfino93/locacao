⚠️ ATENÇÃO: Configuração obrigatória antes do próximo commit/push ⚠️

Este projeto roda em produção no servidor 192.168.1.45.
Esse servidor faz pull automático do repositório, então NUNCA devemos sobrescrever as configurações locais dele.

✅ Ações necessárias

Adicione ao .gitignore (se ainda não existe):

.env
*.env
!.env.example


Crie o arquivo .env.example na raiz do projeto com este conteúdo (com placeholders, sem credenciais reais):

# Configurações do Banco de Dados (editar conforme ambiente local)
DB_DRIVER=ODBC Driver 18 for SQL Server
DB_SERVER=localhost,1433    # alterar no seu ambiente
DB_DATABASE=SeuDatabase     # alterar no seu ambiente
DB_USER=seu_usuario         # alterar no seu ambiente
DB_PASSWORD=sua_senha       # alterar no seu ambiente
DB_ENCRYPT=yes
DB_TRUST_CERT=yes


🚫 NUNCA faça commit de:

Arquivos .env reais

Senhas ou credenciais

IPs reais de produção (192.168.1.45)

Configurações específicas do servidor

💻 No código, sempre use variáveis de ambiente:

Python → os.getenv("DB_SERVER"), etc.

Frontend → process.env.VITE_API_URL ou rotas relativas (/api)
❌ Nunca hardcode URLs como http://192.168.1.45:8000.

⚙️ Configuração real em produção (NÃO COMMITAR, apenas para referência):

DB_DRIVER=ODBC Driver 18 for SQL Server
DB_SERVER=192.168.1.45\SQLTESTES
DB_DATABASE=Cobimob
DB_USER=srvcondo1
DB_PASSWORD=2025@Condo
DB_ENCRYPT=yes
DB_TRUST_CERT=yes


Backend → porta 8000

Frontend → porta 3000

Banco de dados → Cobimob

🌐 CORS

Configuração inicial permitia apenas http://localhost:3000.

O frontend está rodando em http://192.168.1.159:3000.

🛠️ Correção aplicada no backend (main.py)

origins = [
    "http://localhost:3000",
    "http://192.168.1.159:3000",
    "http://192.168.1.159:3001",
    "http://192.168.1.159:3002",
    "http://192.168.1.159:3003",
    "http://192.168.1.159:3004",
    "http://192.168.1.159:3005",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


📝 Instruções adicionais obrigatórias

Atualizar .env com:

DB_SERVER=192.168.1.45\SQLTESTES


Criar arquivo frontend/.env.local com:

VITE_API_URL=http://192.168.1.159:8080
VITE_API_BASE_URL=http://192.168.1.159:8080/api


Atualizar frontend/src/config/api.ts para usar 192.168.1.159:8080 como fallback.

Garantir que o backend (main.py) aceite CORS de 192.168.1.159:3000-3005.