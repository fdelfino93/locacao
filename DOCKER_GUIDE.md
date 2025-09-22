# 🐋 Guia Completo de Dockerização - Sistema Locação

## 📋 Visão Geral

Este documento explica como o sistema foi migrado para Docker e como funciona o novo processo de desenvolvimento e deploy.

## 🏗️ Arquitetura Atual vs Docker

### ❌ **Antes (Problemas)**
```
Desenvolvimento Local          VM Produção
├── npm run dev (port 3000)   ├── git pull (manual/falhas)
├── python main.py (port 8080) ├── npm install (conflitos)
├── .env local                 ├── cache não limpo
└── node_modules local         └── versões desatualizadas
```

### ✅ **Depois (Docker)**
```
Desenvolvimento                 VM Produção
├── docker-compose.dev.yml     ├── docker-compose.prod.yml
├── Ambiente isolado           ├── Imagens padronizadas
├── Build automatizado         ├── Deploy em segundos
└── Zero conflitos             └── Rollback instantâneo
```

## 📁 Estrutura de Arquivos Criados

```
Locacao/
├── Dockerfile                     # Backend (FastAPI + Python)
├── frontend/Dockerfile            # Frontend (React + Vite)
├── docker-compose.dev.yml         # Ambiente desenvolvimento
├── docker-compose.prod.yml        # Ambiente produção
├── scripts/
│   ├── build.bat                  # Build das imagens
│   ├── dev.bat                    # Rodar desenvolvimento
│   ├── save-images.bat            # Exportar para VM
│   └── deploy-vm.sh               # Deploy na VM (Linux)
└── package.json                   # Scripts npm atualizados
```

## 🚀 Como Usar

### **1. Desenvolvimento Local**

```bash
# Opção 1: Via npm script
npm run dev

# Opção 2: Via docker-compose direto
docker-compose -f docker-compose.dev.yml up --build

# Opção 3: Via script
./scripts/dev.bat
```

**Resultado:**
- Frontend: http://localhost:3000
- Backend: http://localhost:8080
- Health Check: http://localhost:8080/api/health

### **2. Build para Produção**

```bash
# Build das imagens
npm run docker:build

# Ou via script
./scripts/build.bat
```

**Cria imagens:**
- `locacao-backend:latest`
- `locacao-frontend:latest`

### **3. Exportar para VM**

```bash
# Salvar imagens em arquivos .tar
npm run docker:save

# Ou via script
./scripts/save-images.bat
```

**Gera arquivos:**
- `locacao-backend.tar`
- `locacao-frontend.tar`

## 🖥️ Configuração da VM

### **Configurações Atuais da VM (baseado em CLAUDE.md)**

```yaml
# Informações da VM
IP: 192.168.1.159
Sistema: Linux
Localização: /home/seraph/locacao/

# Banco de Dados
Servidor: 192.168.1.45\SQLTESTES
Database: Cobimob
User: srvcondo1
Password: 2025@Condo

# Portas
Frontend: 3000
Backend: 8080
```

### **Docker Compose Produção**

O arquivo `docker-compose.prod.yml` está configurado com:

```yaml
services:
  backend:
    image: locacao-backend:latest
    ports: ["8080:8080"]
    environment:
      - DB_SERVER=192.168.1.45\SQLTESTES
      - API_HOST=192.168.1.159

  frontend:
    image: locacao-frontend:latest
    ports: ["3000:3000"]
    environment:
      - VITE_API_URL=http://192.168.1.159:8080
```

## 🔄 Processo de Deploy

### **1. Na Sua Máquina**

```bash
# 1. Desenvolver normalmente
git add .
git commit -m "Nova feature"
git push

# 2. Build e exportar
npm run docker:build
npm run docker:save

# 3. Copiar arquivos .tar para VM
# (via SCP, USB, rede compartilhada, etc.)
```

### **2. Na VM (via Claude)**

```bash
# Executar script de deploy
chmod +x scripts/deploy-vm.sh
./scripts/deploy-vm.sh
```

## 🎯 Vantagens do Docker

### ✅ **Problemas Resolvidos**

1. **Sincronização**: Não há mais git pull manual
2. **Ambiente**: Idêntico sempre (dev = prod)
3. **Deploy**: Segundos ao invés de minutos
4. **Rollback**: Instantâneo se algo der errado
5. **Isolamento**: Zero conflitos entre versões
6. **Cache**: Limpo automaticamente

### ✅ **Novos Benefícios**

1. **Health Checks**: Monitoramento automático
2. **Restart Policy**: Auto-restart se crash
3. **Networks**: Comunicação segura entre containers
4. **Logs**: Centralizados e estruturados

## 🛠️ Comandos Úteis

### **Desenvolvimento**
```bash
# Iniciar desenvolvimento
npm run dev

# Parar todos containers
npm run stop

# Ver logs
docker-compose -f docker-compose.dev.yml logs -f
```

### **Produção (VM)**
```bash
# Status dos containers
docker-compose -f docker-compose.prod.yml ps

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f

# Reiniciar serviços
docker-compose -f docker-compose.prod.yml restart

# Parar tudo
docker-compose -f docker-compose.prod.yml down
```

### **Debugging**
```bash
# Entrar no container
docker exec -it locacao-backend-1 bash
docker exec -it locacao-frontend-1 sh

# Ver imagens
docker images

# Limpar sistema
docker system prune -a
```

## 📋 Scripts NPM Disponíveis

```json
{
  "docker:build": "Build das imagens Docker",
  "docker:dev": "Rodar ambiente desenvolvimento",
  "docker:save": "Exportar imagens para VM",
  "dev": "Iniciar desenvolvimento",
  "prod": "Iniciar produção",
  "stop": "Parar todos containers"
}
```

## 🔧 Troubleshooting

### **Se der erro de build:**
```bash
# Limpar cache Docker
docker system prune -a
npm run docker:build
```

### **Se containers não iniciarem:**
```bash
# Ver logs detalhados
docker-compose -f docker-compose.dev.yml logs

# Rebuild forçado
docker-compose -f docker-compose.dev.yml up --build --force-recreate
```

### **Se VM não acessar banco:**
```bash
# Testar conectividade
docker exec locacao-backend-1 ping 192.168.1.45
```

## 🎉 Resultado Final

### **Antes:**
- ❌ Deploy manual e sujeito a erros
- ❌ Conflitos de ambiente
- ❌ Problemas de sincronização

### **Depois:**
- ✅ Deploy automatizado e confiável
- ✅ Ambiente idêntico sempre
- ✅ Zero problemas de sincronização
- ✅ Rollback instantâneo
- ✅ Monitoramento automático

---

**🚀 Agora você tem um sistema profissional de deployment com Docker!**