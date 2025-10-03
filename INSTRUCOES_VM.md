# 🤖 INSTRUÇÕES PARA O CLAUDE DA VM

**⚠️ COPIE E COLE TODO ESTE CONTEÚDO NO CHAT DO CLAUDE DA VM (192.168.1.159)**

---

Olá Claude! Preciso que você configure um Docker Registry Privado nesta VM para receber imagens Docker de forma segura.

## 📋 Configuração Necessária:

### **Credenciais do Registry:**
- Usuário: `locacao`
- Senha: `Loc@c@o2025!Secure`
- Porta: `5000`

### **Passo 1: Criar estrutura de diretórios**

```bash
cd /home/seraph
mkdir -p registry/auth
mkdir -p registry/data
cd registry
```

### **Passo 2: Instalar htpasswd (se necessário)**

```bash
sudo apt-get update
sudo apt-get install -y apache2-utils
```

### **Passo 3: Criar arquivo de autenticação**

```bash
htpasswd -Bbn locacao 'Loc@c@o2025!Secure' > auth/htpasswd
cat auth/htpasswd
```

Deve mostrar algo como: `locacao:$2y$05$...`

### **Passo 4: Parar registry existente (se houver)**

```bash
docker stop registry 2>/dev/null
docker rm registry 2>/dev/null
```

### **Passo 5: Criar Docker Registry com autenticação**

```bash
docker run -d \
  --name registry \
  --restart=always \
  -p 5000:5000 \
  -v /home/seraph/registry/data:/var/lib/registry \
  -v /home/seraph/registry/auth:/auth \
  -e "REGISTRY_AUTH=htpasswd" \
  -e "REGISTRY_AUTH_HTPASSWD_REALM=Registry Realm" \
  -e "REGISTRY_AUTH_HTPASSWD_PATH=/auth/htpasswd" \
  registry:2
```

### **Passo 6: Verificar se está rodando**

```bash
docker ps | grep registry
docker logs registry
```

### **Passo 7: Configurar Docker daemon para aceitar registry HTTP**

```bash
# Fazer backup do daemon.json (se existir)
sudo cp /etc/docker/daemon.json /etc/docker/daemon.json.backup 2>/dev/null

# Criar/atualizar daemon.json
sudo tee /etc/docker/daemon.json > /dev/null <<EOF
{
  "insecure-registries": ["192.168.1.159:5000"]
}
EOF

# Verificar conteúdo
cat /etc/docker/daemon.json
```

### **Passo 8: Reiniciar Docker**

```bash
sudo systemctl restart docker
sleep 5
docker start registry
sleep 2
```

### **Passo 9: Fazer login no registry**

```bash
echo 'Loc@c@o2025!Secure' | docker login 192.168.1.159:5000 -u locacao --password-stdin
```

### **Passo 10: Testar registry**

```bash
curl -u locacao:Loc@c@o2025!Secure http://192.168.1.159:5000/v2/_catalog
```

Deve retornar: `{"repositories":[]}`

### **Passo 11: Configurar firewall (se UFW estiver ativo)**

```bash
sudo ufw allow from 192.168.1.0/24 to any port 5000
sudo ufw status
```

### **Passo 12: Atualizar docker-compose.prod.yml**

```bash
cd /home/seraph/locacao

# Fazer backup
cp docker-compose.prod.yml docker-compose.prod.yml.backup

# Atualizar arquivo
nano docker-compose.prod.yml
```

**Alterar as linhas de `image:`:**

DE:
```yaml
  backend:
    image: locacao-backend:latest
```

PARA:
```yaml
  backend:
    image: 192.168.1.159:5000/locacao-backend:latest
```

E:

DE:
```yaml
  frontend:
    image: locacao-frontend:latest
```

PARA:
```yaml
  frontend:
    image: 192.168.1.159:5000/locacao-frontend:latest
```

Salvar (Ctrl+O, Enter, Ctrl+X)

### **Passo 13: Verificar configuração final**

```bash
# Ver docker-compose atualizado
cat docker-compose.prod.yml | grep image:

# Ver status do registry
docker ps | grep registry

# Ver login
cat ~/.docker/config.json | grep 192.168.1.159
```

---

## ✅ **Checklist de Verificação:**

Execute e confirme cada item:

- [ ] Registry rodando: `docker ps | grep registry` (deve mostrar UP)
- [ ] Autenticação configurada: `cat /home/seraph/registry/auth/htpasswd` (deve ter conteúdo)
- [ ] daemon.json configurado: `cat /etc/docker/daemon.json` (deve ter insecure-registries)
- [ ] Login feito: `docker login 192.168.1.159:5000` (deve dizer: Login Succeeded)
- [ ] Registry responde: `curl -u locacao:Loc@c@o2025!Secure http://192.168.1.159:5000/v2/_catalog` (deve retornar JSON)
- [ ] docker-compose.prod.yml atualizado: `cat docker-compose.prod.yml | grep "192.168.1.159:5000"` (deve mostrar as imagens)

---

## 🎉 **Se tudo estiver OK, responda:**

"✅ Registry configurado com sucesso! Registry rodando na porta 5000 com autenticação ativa."

---

## ⚠️ **Se algo der errado, forneça:**

1. Saída do comando que falhou
2. Logs: `docker logs registry`
3. Status: `docker ps -a | grep registry`
