# 🔐 Registry com HTTPS Auto-Assinado - VM

**Copie e cole estas instruções no Claude da VM:**

---

Vamos configurar o Registry com HTTPS usando certificado auto-assinado (mais seguro que HTTP).

## 📋 Comandos para executar na VM:

### **Passo 1: Criar diretório para certificados**
```bash
cd /home/seraph/registry
mkdir -p certs
```

### **Passo 2: Gerar certificado auto-assinado**
```bash
openssl req -newkey rsa:4096 -nodes -sha256 \
  -keyout certs/domain.key -x509 -days 365 -out certs/domain.crt \
  -subj "/C=BR/ST=State/L=City/O=Locacao/CN=192.168.1.159"
```

### **Passo 3: Verificar certificados criados**
```bash
ls -la certs/
```

Deve mostrar:
- domain.crt
- domain.key

### **Passo 4: Parar e remover registry HTTP anterior**
```bash
docker stop registry
docker rm registry
```

### **Passo 5: Criar registry com HTTPS**
```bash
docker run -d \
  --name registry \
  --restart=always \
  -p 5000:5000 \
  -v /home/seraph/registry/data:/var/lib/registry \
  -v /home/seraph/registry/auth:/auth \
  -v /home/seraph/registry/certs:/certs \
  -e "REGISTRY_AUTH=htpasswd" \
  -e "REGISTRY_AUTH_HTPASSWD_REALM=Registry Realm" \
  -e "REGISTRY_AUTH_HTPASSWD_PATH=/auth/htpasswd" \
  -e "REGISTRY_HTTP_TLS_CERTIFICATE=/certs/domain.crt" \
  -e "REGISTRY_HTTP_TLS_KEY=/certs/domain.key" \
  registry:2
```

### **Passo 6: Verificar registry rodando**
```bash
docker ps | grep registry
docker logs registry
```

### **Passo 7: Copiar certificado para área confiável do sistema**
```bash
sudo mkdir -p /usr/local/share/ca-certificates/
sudo cp certs/domain.crt /usr/local/share/ca-certificates/registry.crt
sudo update-ca-certificates
```

### **Passo 8: Reiniciar Docker para reconhecer certificado**
```bash
sudo systemctl restart docker
sleep 5
docker start registry
sleep 2
```

### **Passo 9: Fazer login no registry (HTTPS)**
```bash
docker login 192.168.1.159:5000 -u locacao -p 'Loc@c@o2025!Secure'
```

Deve mostrar: `Login Succeeded`

### **Passo 10: Testar registry via HTTPS**
```bash
curl -u locacao:Loc@c@o2025!Secure https://192.168.1.159:5000/v2/_catalog
```

Deve retornar: `{"repositories":[]}`

### **Passo 11: Atualizar docker-compose.prod.yml**
```bash
cd /home/seraph/locacao
cp docker-compose.prod.yml docker-compose.prod.yml.backup
nano docker-compose.prod.yml
```

Alterar as imagens:
- `image: 192.168.1.159:5000/locacao-backend:latest`
- `image: 192.168.1.159:5000/locacao-frontend:latest`

Salvar: Ctrl+O, Enter, Ctrl+X

### **Passo 12: Copiar certificado para a máquina Windows**

**Execute este comando e copie a saída:**
```bash
cat /home/seraph/registry/certs/domain.crt
```

**Copie TODO o conteúdo** (de `-----BEGIN CERTIFICATE-----` até `-----END CERTIFICATE-----`)

---

## ✅ Verificação Final:

```bash
# Registry rodando com HTTPS
docker ps | grep registry

# Certificado instalado
ls -la /usr/local/share/ca-certificates/registry.crt

# Login funciona
docker login 192.168.1.159:5000 -u locacao -p 'Loc@c@o2025!Secure'

# HTTPS responde
curl -u locacao:Loc@c@o2025!Secure https://192.168.1.159:5000/v2/_catalog

# docker-compose atualizado
cat /home/seraph/locacao/docker-compose.prod.yml | grep image:
```

---

## 🎉 Se tudo OK, responda:

"✅ Registry HTTPS configurado com sucesso! Certificado auto-assinado criado e registry rodando com TLS na porta 5000.

**Certificado para copiar na máquina Windows:**
```
[Cole aqui o conteúdo do domain.crt]
```
"

---

## ⚠️ Vantagens do HTTPS vs HTTP insecure:

- ✅ **Mais seguro** (tráfego criptografado)
- ✅ **Sem `insecure-registries`** (não precisa configurar daemon.json)
- ✅ **Boas práticas** (padrão da indústria)
- ✅ **Proteção MITM** (man-in-the-middle)
