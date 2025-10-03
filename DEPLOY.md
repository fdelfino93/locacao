# 🚀 Deploy - Sistema Locação

## 📋 Visão Geral

Sistema de deploy via **Docker Registry HTTPS** com certificado auto-assinado.

- **Desenvolvimento**: `localhost:3000` (frontend) + `localhost:8080` (backend)
- **Produção**: `192.168.1.159:3000` (frontend) + `192.168.1.159:8080` (backend)
- **Registry**: `192.168.1.159:5000` (HTTPS com autenticação)
- **Database**: `192.168.1.45\SQLTESTES` (compartilhado)

---

## 🔧 Pré-requisitos

### 1️⃣ Certificado Instalado (Apenas uma vez)

**Windows (Sua máquina):**
```powershell
# Instalar certificado
certutil -addstore -user "Root" "C:\Users\matheus\Documents\Locacao\Locacao\certs\registry.crt"

# Copiar para Docker Desktop
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.docker\certs.d\192.168.1.159_5000"
Copy-Item "C:\Users\matheus\Documents\Locacao\Locacao\certs\registry.crt" "$env:USERPROFILE\.docker\certs.d\192.168.1.159_5000\ca.crt"

# Reiniciar Docker Desktop
```

**Linux/VM (192.168.1.159):**
```bash
sudo cp /home/seraph/registry/certs/domain.crt /usr/local/share/ca-certificates/registry.crt
sudo update-ca-certificates
sudo systemctl restart docker
```

### 2️⃣ Login no Registry

**Windows:**
```powershell
docker login 192.168.1.159:5000 -u locacao -p "Loc@c@o2025!Secure"
```

**VM:**
```bash
echo 'Loc@c@o2025!Secure' | docker login 192.168.1.159:5000 -u locacao --password-stdin
```

---

## 🔄 Fluxo de Desenvolvimento → Produção

### **Passo 1: Desenvolvimento Local**

```powershell
# Iniciar ambiente de desenvolvimento
npm run dev

# Acesse: http://localhost:3000
```

### **Passo 2: Build das Imagens**

```powershell
# Build das imagens Docker
npm run docker:build

# Ou manualmente:
docker-compose -f docker-compose.dev.yml build
```

### **Passo 3: Push para Registry**

```powershell
# Tag e push para o registry HTTPS
npm run registry:push

# Ou manualmente:
docker tag locacao-backend:latest 192.168.1.159:5000/locacao-backend:latest
docker tag locacao-frontend:latest 192.168.1.159:5000/locacao-frontend:latest
docker push 192.168.1.159:5000/locacao-backend:latest
docker push 192.168.1.159:5000/locacao-frontend:latest
```

### **Passo 4: Deploy na VM**

**SSH na VM:**
```bash
ssh seraph@192.168.1.159
cd /home/seraph/locacao
```

**Atualizar containers:**
```bash
# Parar containers atuais
docker-compose -f docker-compose.prod.yml down

# Baixar imagens atualizadas do registry
docker pull 192.168.1.159:5000/locacao-backend:latest
docker pull 192.168.1.159:5000/locacao-frontend:latest

# Subir containers com novas imagens
docker-compose -f docker-compose.prod.yml up -d

# Verificar status
docker-compose -f docker-compose.prod.yml ps
```

---

## 📦 Scripts NPM Disponíveis

### Desenvolvimento:
- `npm run dev` - Inicia ambiente local (dev)
- `npm run stop` - Para todos os containers

### Build & Deploy:
- `npm run docker:build` - Build das imagens
- `npm run registry:push` - Push para registry HTTPS
- `npm run registry:login` - Login no registry

### Produção (na VM):
```bash
docker-compose -f docker-compose.prod.yml up -d    # Subir
docker-compose -f docker-compose.prod.yml down     # Parar
docker-compose -f docker-compose.prod.yml ps       # Status
docker-compose -f docker-compose.prod.yml logs -f  # Logs
```

---

## 🔍 Verificação e Debug

### Verificar Imagens

**Windows:**
```powershell
docker images | findstr locacao
```

**VM:**
```bash
docker images | grep locacao
```

### Verificar Registry

**Listar repositórios:**
```powershell
curl.exe -k -u locacao:Loc@c@o2025!Secure https://192.168.1.159:5000/v2/_catalog
```

**Listar tags:**
```powershell
curl.exe -k -u locacao:Loc@c@o2025!Secure https://192.168.1.159:5000/v2/locacao-backend/tags/list
```

### Logs dos Containers

```bash
# Todos os logs
docker-compose -f docker-compose.prod.yml logs -f

# Backend apenas
docker-compose -f docker-compose.prod.yml logs -f backend

# Frontend apenas
docker-compose -f docker-compose.prod.yml logs -f frontend
```

---

## ⚡ Deploy Rápido (Resumo)

```powershell
# 1. Na sua máquina (Windows)
npm run docker:build
npm run registry:push

# 2. Na VM (SSH)
ssh seraph@192.168.1.159
docker-compose -f docker-compose.prod.yml down
docker pull 192.168.1.159:5000/locacao-backend:latest
docker pull 192.168.1.159:5000/locacao-frontend:latest
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🛠️ Troubleshooting

### Problema: "tls: failed to verify certificate"
**Solução:** Instalar certificado (ver Pré-requisitos)

### Problema: "pull access denied"
**Solução:** Fazer login no registry
```bash
echo 'Loc@c@o2025!Secure' | docker login 192.168.1.159:5000 -u locacao --password-stdin
```

### Problema: Porta 8080 ocupada na VM
**Solução:**
```bash
lsof -i :8080
kill <PID>
```

### Problema: Imagens não atualizam
**Solução:** Forçar pull removendo imagens antigas
```bash
docker-compose -f docker-compose.prod.yml down
docker rmi -f 192.168.1.159:5000/locacao-backend:latest
docker rmi -f 192.168.1.159:5000/locacao-frontend:latest
docker pull 192.168.1.159:5000/locacao-backend:latest
docker pull 192.168.1.159:5000/locacao-frontend:latest
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🔐 Segurança

- ✅ HTTPS com certificado auto-assinado
- ✅ Autenticação básica (locacao:Loc@c@o2025!Secure)
- ✅ Registry privado (apenas rede local)
- ✅ Variáveis de ambiente para credenciais

**Importante:** Nunca commitar:
- Arquivos `.env`
- Credenciais
- Certificados privados (`.key`)

---

## 📚 Arquitetura

```
┌─────────────────────────────────────────┐
│  Windows (Desenvolvimento)              │
│  ├─ Build: docker-compose.dev.yml       │
│  ├─ Push: 192.168.1.159:5000            │
│  └─ Test: localhost:3000                │
└─────────────────────────────────────────┘
                    ↓ HTTPS
┌─────────────────────────────────────────┐
│  Docker Registry (192.168.1.159:5000)   │
│  ├─ HTTPS + Auth                        │
│  └─ Armazena: backend + frontend        │
└─────────────────────────────────────────┘
                    ↓ Pull
┌─────────────────────────────────────────┐
│  VM Produção (192.168.1.159)            │
│  ├─ Run: docker-compose.prod.yml        │
│  ├─ Access: 192.168.1.159:3000          │
│  └─ DB: 192.168.1.45\SQLTESTES          │
└─────────────────────────────────────────┘
```

---

**Última atualização:** 2025-10-03
**Sistema funcionando com Docker Registry HTTPS** ✅
