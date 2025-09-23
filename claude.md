⚠️ CONFIGURAÇÃO DE AMBIENTES - Sistema Locação Docker ⚠️

🏗️ ARQUITETURA ATUAL

Este sistema utiliza Docker para desenvolvimento e produção, com dois ambientes distintos:

┌─────────────────────────────────────────────────────────────┐
│  🖥️  DESENVOLVIMENTO (Sua Máquina)                          │
│  ├── Backend: localhost:8080                                │
│  ├── Frontend: localhost:3000                               │
│  ├── Docker: docker-compose.dev.yml (volume mount)          │
│  └── Database: → 192.168.1.45\SQLTESTES (remoto)           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  ☁️  PRODUÇÃO (VM 192.168.1.159)                           │
│  ├── Backend: 192.168.1.159:8080                            │
│  ├── Frontend: 192.168.1.159:3000                           │
│  ├── Docker: docker-compose.prod.yml (imagens pre-built)    │
│  └── Database: → 192.168.1.45\SQLTESTES (compartilhado)    │
└─────────────────────────────────────────────────────────────┘

🗄️ BANCO DE DADOS (Servidor Compartilhado)
├── IP: 192.168.1.45\SQLTESTES
├── Database: Cobimob
├── User: srvcondo1
└── Usado por ambos os ambientes

🔒 SEGURANÇA E BOAS PRÁTICAS

✅ Arquivos no .gitignore (NUNCA commitar):
- .env (configurações locais)
- *.env (variações de ambiente)
- *.tar (imagens Docker exportadas)
- __pycache__/ (cache Python)
- node_modules/ (dependências Node)
- *.backup (arquivos de backup)

✅ SEMPRE usar variáveis de ambiente:
- Backend Python: os.getenv("DB_SERVER")
- Frontend React: process.env.VITE_API_URL
- Docker: environment sections nos compose files

🚫 NUNCA fazer:
- Hardcode de IPs no código (ex: 192.168.1.45)
- Commit de credenciais reais
- Commit de arquivos .env com senhas
- Deploy manual via git pull (usar Docker)

🐋 FLUXO DE DESENVOLVIMENTO

📝 1. DESENVOLVIMENTO DIÁRIO:
```bash
# Iniciar ambiente local
npm run dev
# ou
docker-compose -f docker-compose.dev.yml up

# Desenvolver normalmente...
# Frontend: http://localhost:3000
# Backend: http://localhost:8080
```

🔧 2. PREPARAR DEPLOY:
```bash
# Commitar mudanças
git add .
git commit -m "Nova funcionalidade"
git push

# Build das imagens Docker
npm run docker:build
```

🚀 3. DEPLOY PARA PRODUÇÃO:
```bash
# Exportar imagens para arquivos
npm run docker:save

# Enviar para VM (automático)
npm run docker:upload
```

🌐 CONFIGURAÇÃO DE CORS

O backend aceita requests de:
- http://localhost:3000 (desenvolvimento)
- http://192.168.1.159:3000 (produção)
- Portas adicionais 3001-3005 (testes)

Esta configuração é feita via código no main.py e deve ser mantida atualizada.

🛠️ VARIÁVEIS DE AMBIENTE POR CONTEXTO

🖥️ Desenvolvimento (docker-compose.dev.yml):
```yaml
environment:
  - DB_SERVER=192.168.1.45\SQLTESTES
  - DB_DATABASE=Cobimob
  - API_HOST=localhost
  - API_PORT=8080
  - VITE_API_URL=http://localhost:8080
```

☁️ Produção (docker-compose.prod.yml):
```yaml
environment:
  - DB_SERVER=192.168.1.45\SQLTESTES
  - DB_DATABASE=Cobimob
  - API_HOST=192.168.1.159
  - API_PORT=8080
  - VITE_API_URL=http://192.168.1.159:8080
```

📋 COMANDOS ÚTEIS

Desenvolvimento:
```bash
npm run dev          # Iniciar desenvolvimento
npm run stop         # Parar containers
docker-compose -f docker-compose.dev.yml logs -f  # Ver logs
```

Deploy:
```bash
npm run docker:build    # Build das imagens
npm run docker:save     # Exportar para .tar
npm run docker:upload   # Enviar para VM
```

Debug:
```bash
docker exec -it locacao-backend-1 bash   # Entrar no container backend
docker exec -it locacao-frontend-1 sh    # Entrar no container frontend
docker system prune -a                   # Limpar sistema Docker
```

🎯 PRINCIPAIS MUDANÇAS DO SISTEMA ANTIGO

❌ ANTES:
- Deploy manual via git pull
- Conflitos de ambiente dev/prod
- Problemas de sincronização
- VM fazia pull automático (perigoso)

✅ AGORA:
- Deploy automatizado via Docker
- Ambientes isolados e idênticos
- Processo controlado e seguro
- VM só atualiza quando você manda

📚 DOCUMENTAÇÃO ADICIONAL

Para detalhes técnicos completos, consulte:
- DOCKER_GUIDE.md (processo completo)
- docker-compose.dev.yml (config desenvolvimento)
- docker-compose.prod.yml (config produção)
- scripts/ (automação de deploy)

🚀 Sistema profissional com Docker - desenvolvimento local + deploy controlado!