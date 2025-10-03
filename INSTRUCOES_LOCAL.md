# 🤖 INSTRUÇÕES PARA O CLAUDE LOCAL (Sua Máquina Windows)

**⚠️ AGUARDE O CLAUDE DA VM CONFIRMAR QUE O REGISTRY ESTÁ CONFIGURADO ANTES DE CONTINUAR!**

---

## ✅ Pré-requisito:

O Claude da VM deve ter respondido:
> "✅ Registry configurado com sucesso! Registry rodando na porta 5000 com autenticação ativa."

---

## 📋 Configuração na Máquina Local:

### **Passo 1: Configurar Docker Desktop**

1. Abrir **Docker Desktop**
2. Clicar no ⚙️ ícone de **Settings** (canto superior direito)
3. Ir em **Docker Engine** (menu lateral esquerdo)
4. No editor JSON, adicionar ou modificar para incluir:

```json
{
  "builder": {
    "gc": {
      "defaultKeepStorage": "20GB",
      "enabled": true
    }
  },
  "experimental": false,
  "insecure-registries": [
    "192.168.1.159:5000"
  ]
}
```

**⚠️ IMPORTANTE:** Se já existir conteúdo no JSON, apenas adicione a linha `"insecure-registries": ["192.168.1.159:5000"]` dentro do objeto principal.

5. Clicar em **Apply & Restart**
6. Aguardar Docker reiniciar (~30 segundos)

### **Passo 2: Verificar conectividade com a VM**

Abrir PowerShell ou CMD e testar:

```bash
ping 192.168.1.159
```

Deve responder com sucesso.

### **Passo 3: Testar acesso ao registry**

```bash
curl -u locacao:Loc@c@o2025!Secure http://192.168.1.159:5000/v2/_catalog
```

**Deve retornar:** `{"repositories":[]}`

Se der erro "curl não reconhecido", use:
```bash
Invoke-WebRequest -Uri http://192.168.1.159:5000/v2/_catalog -Headers @{Authorization=("Basic " + [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("locacao:Loc@c@o2025!Secure")))}
```

### **Passo 4: Fazer login no registry**

```bash
npm run registry:login
```

**Deve mostrar:**
- ✅ Login realizado com sucesso!
- {"repositories":[]}
- 🎉 CONECTADO AO REGISTRY!

### **Passo 5: Testar build local**

```bash
npm run docker:build
```

Aguardar build completar (~3 minutos).

### **Passo 6: Testar push para registry**

```bash
npm run registry:push
```

**Deve mostrar:**
- 🏷️ Tag Backend/Frontend para registry...
- 📤 Enviando Backend/Frontend para registry...
- ✅ Push completo!

### **Passo 7: Verificar imagens no registry**

```bash
curl -u locacao:Loc@c@o2025!Secure http://192.168.1.159:5000/v2/_catalog
```

**Deve retornar:**
```json
{"repositories":["locacao-backend","locacao-frontend"]}
```

### **Passo 8: Primeiro deploy completo**

```bash
npm run registry:deploy
```

**Isso vai:**
1. ✅ Build das imagens (~3 min)
2. ✅ Push para registry (~1 min)
3. ✅ Pull na VM (~30 seg)
4. ✅ Reiniciar containers

**Total: ~4-5 minutos**

### **Passo 9: Verificar sistema rodando**

Abrir navegador e acessar:
- Frontend: http://192.168.1.159:3000
- Backend: http://192.168.1.159:8080/api/health

---

## ✅ **Checklist de Verificação:**

- [ ] Docker Desktop configurado com insecure-registries
- [ ] Docker Desktop reiniciado
- [ ] Ping para VM funciona
- [ ] Registry responde (curl com catálogo)
- [ ] Login no registry bem-sucedido
- [ ] Build local funciona
- [ ] Push para registry funciona
- [ ] Imagens aparecem no catálogo
- [ ] Deploy completo executa sem erros
- [ ] Sistema acessível em http://192.168.1.159:3000

---

## 🚀 **Próximos Deploys (Dia-a-Dia):**

Após configuração inicial, para deploy basta:

```bash
npm run registry:deploy
```

Pronto! Sistema atualizado em ~3 minutos! 🎉

---

## 📊 **Comandos Úteis:**

```bash
# Login no registry
npm run registry:login

# Build local
npm run docker:build

# Push para registry
npm run registry:push

# Deploy completo
npm run registry:deploy

# Ver catálogo de imagens
curl -u locacao:Loc@c@o2025!Secure http://192.168.1.159:5000/v2/_catalog

# Ver tags de uma imagem
curl -u locacao:Loc@c@o2025!Secure http://192.168.1.159:5000/v2/locacao-backend/tags/list
```

---

## ⚠️ **Troubleshooting:**

### Erro: "unauthorized: authentication required"
```bash
npm run registry:login
```

### Erro: "http: server gave HTTP response to HTTPS client"
Verificar se `insecure-registries` está configurado no Docker Desktop e reiniciou.

### Erro: "connection refused"
1. Verificar se VM está acessível: `ping 192.168.1.159`
2. Pedir ao Claude da VM: `docker ps | grep registry`

### Erro no push: "denied: requested access to the resource is denied"
```bash
npm run registry:login
```

---

## 🎉 **Se tudo estiver OK, você terá:**

- ✅ Registry privado configurado
- ✅ Deploy automatizado em 1 comando
- ✅ Sistema profissional e seguro
- ✅ Versionamento de imagens
- ✅ Rollback fácil quando necessário

**Tempo de deploy: ~3 minutos! 🚀**
