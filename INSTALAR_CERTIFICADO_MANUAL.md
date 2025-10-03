# 🔐 Instalação Manual do Certificado Registry

O certificado precisa ser instalado manualmente para o Docker reconhecer.

---

## 📋 **Método 1: Via Interface Gráfica (Recomendado)**

### **Passo 1: Abrir o certificado**
1. Ir para: `C:\Users\matheus\Documents\Locacao\Locacao\certs\`
2. Clicar duas vezes em `registry.crt`

### **Passo 2: Instalar**
1. Clicar em **"Instalar Certificado..."**
2. Selecionar **"Usuário Atual"**
3. Marcar **"Colocar todos os certificados no repositório a seguir"**
4. Clicar em **"Procurar"**
5. Selecionar **"Autoridades de Certificação Raiz Confiáveis"**
6. Clicar em **"Avançar"** → **"Concluir"**
7. Confirmar o aviso de segurança clicando em **"Sim"**

### **Passo 3: Copiar certificado para Docker**

Abrir **PowerShell como Administrador** e executar:

```powershell
# Criar diretório (Docker Desktop)
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.docker\certs.d\192.168.1.159_5000"

# Copiar certificado
Copy-Item -Path "C:\Users\matheus\Documents\Locacao\Locacao\certs\registry.crt" -Destination "$env:USERPROFILE\.docker\certs.d\192.168.1.159_5000\ca.crt" -Force

# Também copiar com dois pontos (alguns Docker usam)
New-Item -ItemType Directory -Force -Path "$env:ProgramData\docker\certs.d\192.168.1.159_5000"
Copy-Item -Path "C:\Users\matheus\Documents\Locacao\Locacao\certs\registry.crt" -Destination "$env:ProgramData\docker\certs.d\192.168.1.159_5000\ca.crt" -Force
```

### **Passo 4: Reiniciar Docker Desktop**

1. Clicar com botão direito no ícone do Docker na bandeja do sistema
2. Clicar em **"Restart"**
3. Aguardar Docker reiniciar (~30 segundos)

### **Passo 5: Testar login**

```bash
docker login 192.168.1.159:5000 -u locacao -p "Loc@c@o2025!Secure"
```

Deve mostrar: **Login Succeeded**

---

## 📋 **Método 2: Adicionar insecure-registry (Alternativa)**

Se o Método 1 não funcionar, adicionar como insecure-registry:

### **Passo 1: Abrir Docker Desktop Settings**
- **Settings** → **Docker Engine**

### **Passo 2: Adicionar configuração**
```json
{
  "insecure-registries": [
    "192.168.1.159:5000"
  ]
}
```

### **Passo 3: Aplicar e Reiniciar**
- **Apply & Restart**

### **Passo 4: Testar login**
```bash
docker login 192.168.1.159:5000 -u locacao -p "Loc@c@o2025!Secure"
```

---

## ✅ **Verificação**

Após instalar, execute:

```bash
# Testar HTTPS
curl -u locacao:Loc@c@o2025!Secure https://192.168.1.159:5000/v2/_catalog

# Login
docker login 192.168.1.159:5000 -u locacao -p "Loc@c@o2025!Secure"

# Ver certificados instalados
certutil -store -user Root | findstr "192.168.1.159"
```

---

## 🚀 **Após Configurar**

1. **Build:**
   ```bash
   npm run docker:build
   ```

2. **Push:**
   ```bash
   npm run registry:push
   ```

3. **Deploy Completo:**
   ```bash
   npm run registry:deploy
   ```

---

## ⚠️ **Nota Importante**

O Windows pode ter problemas com ":" no nome de diretórios. Por isso criamos duas versões:
- `192.168.1.159_5000` (com underscore)
- Configuração `insecure-registries` como alternativa

Use o método que funcionar melhor!
