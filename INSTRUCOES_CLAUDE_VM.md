# 🤖 Instruções para Claude da VM

**Copie e cole este conteúdo para o Claude que está rodando na VM (192.168.1.159)**

---

## 🎯 Contexto

O sistema de locação foi migrado para Docker para resolver problemas de sincronização e deploy. Você vai ajudar a configurar e gerenciar o ambiente Docker na VM de produção.

## 📋 Configurações da VM

```
Localização: /home/seraph/locacao/
IP da VM: 192.168.1.159
Banco de dados: 192.168.1.45\SQLTESTES (Cobimob)
Frontend: porta 3000
Backend: porta 8080
```

## 🚀 Tarefas Imediatas

### 1. **Verificar Docker na VM**

Execute estes comandos para verificar se Docker está instalado:

```bash
docker --version
docker-compose --version
```

Se não estiver instalado, instale Docker e Docker Compose:

```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verificar instalação
docker --version
docker-compose --version
```

### 2. **Navegar para o Diretório**

```bash
cd /home/seraph/locacao/
pwd
ls -la
```

### 3. **Atualizar Código do Git**

```bash
git status
git pull origin main
ls -la
```

### 4. **Verificar Arquivos Docker**

Confirme que estes arquivos existem:

```bash
ls -la docker-compose.prod.yml
ls -la scripts/deploy-vm.sh
ls -la Dockerfile
ls -la frontend/Dockerfile
```

### 5. **Aguardar Arquivos .tar**

Você receberá estes arquivos do desenvolvedor:
- `locacao-backend.tar`
- `locacao-frontend.tar`

Quando receber, confirme:

```bash
ls -la *.tar
```

### 6. **Executar Deploy**

Quando tiver os arquivos .tar, execute:

```bash
# Dar permissão ao script
chmod +x scripts/deploy-vm.sh

# Executar deploy
./scripts/deploy-vm.sh
```

### 7. **Verificar Deploy**

Após o deploy, verifique:

```bash
# Status dos containers
docker-compose -f docker-compose.prod.yml ps

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f

# Testar endpoints
curl http://192.168.1.159:8080/api/health
curl http://192.168.1.159:3000
```

## 🛠️ Comandos de Manutenção

### **Monitoramento**
```bash
# Ver status
docker-compose -f docker-compose.prod.yml ps

# Ver logs em tempo real
docker-compose -f docker-compose.prod.yml logs -f

# Ver recursos utilizados
docker stats
```

### **Reiniciar Serviços**
```bash
# Reiniciar tudo
docker-compose -f docker-compose.prod.yml restart

# Reiniciar só backend
docker-compose -f docker-compose.prod.yml restart backend

# Reiniciar só frontend
docker-compose -f docker-compose.prod.yml restart frontend
```

### **Parar/Iniciar**
```bash
# Parar tudo
docker-compose -f docker-compose.prod.yml down

# Iniciar tudo
docker-compose -f docker-compose.prod.yml up -d
```

### **Debugging**
```bash
# Entrar no container backend
docker exec -it locacao-backend-1 bash

# Entrar no container frontend
docker exec -it locacao-frontend-1 sh

# Ver logs específicos
docker logs locacao-backend-1
docker logs locacao-frontend-1
```

### **Limpeza**
```bash
# Limpar containers parados
docker container prune

# Limpar imagens não utilizadas
docker image prune

# Limpeza completa (cuidado!)
docker system prune -a
```

## 🔄 Processo de Atualização

Quando o desenvolvedor enviar novas versões:

1. **Receber arquivos .tar**
2. **Executar deploy**: `./scripts/deploy-vm.sh`
3. **Verificar funcionamento**
4. **Confirmar para o desenvolvedor**

## 📋 Checklist de Verificação

Após cada deploy, verifique:

- [ ] Containers rodando: `docker-compose -f docker-compose.prod.yml ps`
- [ ] Frontend acessível: http://192.168.1.159:3000
- [ ] Backend acessível: http://192.168.1.159:8080
- [ ] Health check OK: http://192.168.1.159:8080/api/health
- [ ] Logs sem erros: `docker-compose -f docker-compose.prod.yml logs`

## ⚠️ Troubleshooting

### **Se containers não iniciarem:**
```bash
# Ver logs detalhados
docker-compose -f docker-compose.prod.yml logs

# Rebuild se necessário
docker-compose -f docker-compose.prod.yml up --build --force-recreate
```

### **Se não conseguir acessar:**
```bash
# Verificar portas
sudo netstat -tlnp | grep :3000
sudo netstat -tlnp | grep :8080

# Verificar firewall
sudo ufw status
```

### **Problemas de banco:**
```bash
# Testar conectividade
docker exec locacao-backend-1 ping 192.168.1.45

# Ver logs específicos do backend
docker logs locacao-backend-1
```

## 📞 Suporte

Se encontrar problemas:

1. **Anote os logs**: `docker-compose -f docker-compose.prod.yml logs > error.log`
2. **Tire screenshot do erro**
3. **Informe ao desenvolvedor**

---

## 🎯 **Objetivo Final**

Após configuração, você terá:
- ✅ Sistema rodando em containers isolados
- ✅ Deploy automático em segundos
- ✅ Monitoramento fácil via Docker
- ✅ Zero problemas de sincronização

**Boa sorte! 🚀**