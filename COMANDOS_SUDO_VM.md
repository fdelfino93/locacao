# 🔧 COMANDOS SUDO PARA EXECUTAR NA VM

**Execute estes comandos MANUALMENTE no terminal SSH da VM:**

---

## 📋 Abrir terminal SSH:

```bash
ssh seraph@192.168.1.159
```

---

## 🔑 Comandos para executar (um por vez):

### 1. Verificar permissões do diretório Docker:
```bash
sudo ls -la /etc/docker/
```

### 2. Copiar arquivo daemon.json:
```bash
sudo cp /tmp/daemon.json /etc/docker/daemon.json
```

### 3. Verificar se foi copiado corretamente:
```bash
sudo cat /etc/docker/daemon.json
```

**Deve mostrar:**
```json
{
  "insecure-registries": ["192.168.1.159:5000"]
}
```

### 4. Reiniciar Docker:
```bash
sudo systemctl restart docker
```

### 5. Aguardar Docker reiniciar:
```bash
sleep 5
```

### 6. Iniciar registry novamente:
```bash
docker start registry
```

### 7. Aguardar registry iniciar:
```bash
sleep 2
```

### 8. Fazer login no registry:
```bash
echo 'Loc@c@o2025!Secure' | docker login 192.168.1.159:5000 -u locacao --password-stdin
```

**Deve mostrar:** `Login Succeeded`

### 9. Testar registry:
```bash
curl -u locacao:Loc@c@o2025!Secure http://192.168.1.159:5000/v2/_catalog
```

**Deve retornar:** `{"repositories":[]}`

### 10. Atualizar docker-compose.prod.yml:
```bash
cd /home/seraph/locacao
cp docker-compose.prod.yml docker-compose.prod.yml.backup
```

### 11. Editar docker-compose.prod.yml:
```bash
nano docker-compose.prod.yml
```

**Alterar:**
- Linha do backend: `image: 192.168.1.159:5000/locacao-backend:latest`
- Linha do frontend: `image: 192.168.1.159:5000/locacao-frontend:latest`

**Salvar:** Ctrl+O, Enter, Ctrl+X

### 12. Verificar alterações:
```bash
cat docker-compose.prod.yml | grep "192.168.1.159:5000"
```

**Deve mostrar 2 linhas com as imagens do registry.**

---

## ✅ VERIFICAÇÃO FINAL:

Execute todos estes comandos para confirmar:

```bash
# Registry rodando
docker ps | grep registry

# daemon.json configurado
sudo cat /etc/docker/daemon.json

# Login feito
docker login 192.168.1.159:5000 -u locacao -p 'Loc@c@o2025!Secure'

# Registry responde
curl -u locacao:Loc@c@o2025!Secure http://192.168.1.159:5000/v2/_catalog

# docker-compose atualizado
cat /home/seraph/locacao/docker-compose.prod.yml | grep image:
```

---

## 🎉 SE TUDO ESTIVER OK:

**Copie e cole esta mensagem de volta para o Claude da VM:**

```
✅ Comandos sudo executados com sucesso!

Registry rodando: OK
daemon.json configurado: OK
Login realizado: OK
Registry respondendo: OK
docker-compose.prod.yml atualizado: OK

Registry configurado e pronto para uso!
```

---

## ⚠️ SE HOUVER ERRO:

Copie a saída do comando que deu erro e cole de volta no chat do Claude da VM.

---

**Após executar tudo, me avise aqui que vamos prosseguir com a configuração local!**
