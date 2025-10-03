# 🔐 Configurar Registry HTTPS - Máquina Local Windows

**⚠️ AGUARDE o Claude da VM confirmar que o Registry HTTPS está configurado e enviar o certificado!**

---

## 📋 Pré-requisito:

O Claude da VM deve ter enviado o **certificado auto-assinado** (domain.crt).

---

## 🔧 Configuração na Máquina Local:

### **Passo 1: Salvar certificado da VM**

1. Criar arquivo `domain.crt` na pasta do projeto:
   ```bash
   # No PowerShell ou CMD, na pasta do projeto
   cd C:\Users\matheus\Documents\Locacao\Locacao
   notepad certs\registry.crt
   ```

2. Colar o conteúdo do certificado que a VM enviou (de `-----BEGIN CERTIFICATE-----` até `-----END CERTIFICATE-----`)

3. Salvar e fechar

### **Passo 2: Instalar certificado no Windows**

**Opção A - Via PowerShell (Recomendado):**
```powershell
# Executar PowerShell como Administrador
$cert = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2("C:\Users\matheus\Documents\Locacao\Locacao\certs\registry.crt")
$store = New-Object System.Security.Cryptography.X509Certificates.X509Store("Root","CurrentUser")
$store.Open("ReadWrite")
$store.Add($cert)
$store.Close()
```

**Opção B - Via Interface Gráfica:**
1. Clicar duas vezes no arquivo `registry.crt`
2. Clicar em **"Instalar Certificado..."**
3. Escolher **"Usuário Atual"**
4. Selecionar **"Colocar todos os certificados no repositório a seguir"**
5. Clicar em **"Procurar"** e selecionar **"Autoridades de Certificação Raiz Confiáveis"**
6. Clicar em **"Avançar"** e **"Concluir"**
7. Confirmar a instalação

### **Passo 3: Adicionar certificado ao Docker Desktop**

1. Criar diretório para certificados do Docker:
   ```bash
   mkdir %USERPROFILE%\.docker\certs.d\192.168.1.159:5000
   ```

2. Copiar certificado:
   ```bash
   copy C:\Users\matheus\Documents\Locacao\Locacao\certs\registry.crt %USERPROFILE%\.docker\certs.d\192.168.1.159:5000\ca.crt
   ```

### **Passo 4: Reiniciar Docker Desktop**

1. Abrir Docker Desktop
2. Clicar em **Settings** → **General**
3. Desmarcar e marcar novamente qualquer opção (para forçar refresh)
4. Clicar em **Apply & Restart**
5. Aguardar Docker reiniciar

### **Passo 5: Testar conectividade HTTPS**

```bash
# Testar com curl (se tiver instalado)
curl -u locacao:Loc@c@o2025!Secure https://192.168.1.159:5000/v2/_catalog

# Ou com PowerShell
$credential = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("locacao:Loc@c@o2025!Secure"))
Invoke-RestMethod -Uri https://192.168.1.159:5000/v2/_catalog -Headers @{Authorization="Basic $credential"}
```

Deve retornar: `{"repositories":[]}`

### **Passo 6: Fazer login no registry**

```bash
docker login 192.168.1.159:5000 -u locacao -p Loc@c@o2025!Secure
```

Deve mostrar: `Login Succeeded`

### **Passo 7: Atualizar scripts de push**

Verificar se os scripts estão usando HTTPS (já estão corretos, apenas confirmar):
```bash
# Ver configuração
type scripts\registry-push.bat | findstr REGISTRY
```

Deve mostrar: `set REGISTRY=192.168.1.159:5000`

### **Passo 8: Testar build e push**

```bash
# Build
npm run docker:build

# Push
npm run registry:push
```

### **Passo 9: Verificar imagens no registry**

```bash
curl -u locacao:Loc@c@o2025!Secure https://192.168.1.159:5000/v2/_catalog
```

Deve retornar: `{"repositories":["locacao-backend","locacao-frontend"]}`

### **Passo 10: Primeiro deploy completo**

```bash
npm run registry:deploy
```

Aguardar conclusão (~4 minutos na primeira vez).

### **Passo 11: Verificar sistema rodando**

Abrir navegador:
- Frontend: http://192.168.1.159:3000
- Backend: http://192.168.1.159:8080/api/health

---

## ✅ Checklist de Verificação:

- [ ] Certificado salvo em `certs\registry.crt`
- [ ] Certificado instalado no Windows (Autoridades Raiz Confiáveis)
- [ ] Certificado copiado para Docker (`%USERPROFILE%\.docker\certs.d\192.168.1.159:5000\ca.crt`)
- [ ] Docker Desktop reiniciado
- [ ] HTTPS funciona (curl/PowerShell)
- [ ] Login no registry bem-sucedido
- [ ] Build funciona
- [ ] Push funciona
- [ ] Imagens aparecem no catálogo
- [ ] Deploy completo executa sem erros
- [ ] Sistema acessível em http://192.168.1.159:3000

---

## 🚀 Próximos Deploys:

Após configuração, deploy sempre será:
```bash
npm run registry:deploy
```

Pronto em ~3 minutos! 🎉

---

## 🔐 Segurança HTTPS vs HTTP:

| Aspecto | HTTP Insecure | HTTPS Auto-Assinado |
|---------|---------------|---------------------|
| Criptografia | ❌ Texto plano | ✅ TLS 1.2+ |
| MITM Protection | ❌ Vulnerável | ✅ Protegido |
| Configuração Docker | insecure-registries | Certificado confiável |
| Boas práticas | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| Complexidade | Simples | Média |

---

## ⚠️ Troubleshooting:

### Erro: "x509: certificate signed by unknown authority"
- Certificado não instalado corretamente
- Reinstalar seguindo Passo 2

### Erro: "connection refused" ou "timeout"
- Firewall bloqueando porta 5000
- VM: `sudo ufw allow 5000/tcp`

### Erro: "unauthorized: authentication required"
```bash
docker login 192.168.1.159:5000 -u locacao -p Loc@c@o2025!Secure
```

### Certificado não reconhecido pelo Docker
1. Verificar localização: `%USERPROFILE%\.docker\certs.d\192.168.1.159:5000\ca.crt`
2. Verificar nome do arquivo: deve ser `ca.crt` (não `registry.crt`)
3. Reiniciar Docker Desktop

---

## 🎉 Resultado Final:

✅ **Registry privado com HTTPS**
✅ **Autenticação por senha**
✅ **Tráfego criptografado**
✅ **Deploy automatizado**
✅ **Versionamento de imagens**
✅ **Rollback disponível**

**Sistema profissional e seguro! 🚀**
