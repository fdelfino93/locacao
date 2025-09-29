# 🚀 DEPLOY MANUAL PARA VM

## 📋 Método: VM Puxa os Arquivos

### **🖥️ NA SUA MÁQUINA (192.168.1.100)**

#### 1️⃣ Gerar e servir os arquivos:

```bash
# Build e exportar imagens
npm run docker:build
npm run docker:save

# Iniciar servidor HTTP (DEIXE ABERTO!)
npm run docker:serve
```

Você verá:
```
📡 Iniciando servidor HTTP para compartilhar arquivos .tar...

🌐 Servidor rodando em: http://192.168.1.100:8000

📁 Arquivos disponíveis:
  - http://192.168.1.100:8000/locacao-backend.tar
  - http://192.168.1.100:8000/locacao-frontend.tar

⚠️  IMPORTANTE: Deixe esta janela aberta enquanto a VM baixa os arquivos!
```

---

### **☁️ NA VM (192.168.1.159)**

#### 2️⃣ Baixar e fazer deploy:

```bash
# Método 1: Script automático (RECOMENDADO)
cd /home/matheus/Locacao
bash <(curl -s http://192.168.1.100:8000/scripts/vm-pull-images.sh)
```

OU

```bash
# Método 2: Comandos manuais
cd /home/matheus/Locacao

# Baixar arquivos
curl -# -o locacao-backend.tar http://192.168.1.100:8000/locacao-backend.tar
curl -# -o locacao-frontend.tar http://192.168.1.100:8000/locacao-frontend.tar

# Parar containers
docker-compose -f docker-compose.prod.yml down

# Carregar imagens
docker load -i locacao-backend.tar
docker load -i locacao-frontend.tar

# Subir containers
docker-compose -f docker-compose.prod.yml up -d

# Limpar
rm locacao-backend.tar locacao-frontend.tar
```

---

### **3️⃣ NA SUA MÁQUINA - Parar servidor**

Depois que a VM terminar de baixar:
- Pressione `CTRL+C` na janela do servidor HTTP
- Pode fechar a janela

---

## ✅ VERIFICAÇÃO

Acesse no navegador:
- **Frontend:** http://192.168.1.159:3000
- **Backend:** http://192.168.1.159:8080/docs

---

## 🔧 TROUBLESHOOTING

### Erro: "Connection refused"
- ✅ Verifique se o servidor HTTP está rodando na sua máquina
- ✅ Teste: abra http://192.168.1.100:8000 no seu navegador
- ✅ Verifique firewall do Windows

### Erro: "No such file"
- ✅ Rode `npm run docker:save` antes de servir
- ✅ Verifique se os arquivos .tar existem na pasta raiz

### Deploy não atualiza
```bash
# Na VM - forçar recriação dos containers
docker-compose -f docker-compose.prod.yml up -d --force-recreate
```

---

## 📊 TAMANHOS

- Backend: ~139 MB
- Frontend: ~146 MB
- **Total: ~285 MB**
- Tempo estimado download (rede local): ~30 segundos

---

## 🎯 FLUXO COMPLETO

```
Sua Máquina                           VM
─────────────                    ─────────
1. npm run docker:build
2. npm run docker:save
3. npm run docker:serve     →    4. curl download
   (HTTP Server)                 5. docker load
                                 6. docker-compose up
7. CTRL+C (parar)                ✅ Deploy concluído!
```