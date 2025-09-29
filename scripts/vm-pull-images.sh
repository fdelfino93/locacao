#!/bin/bash
# Script para rodar NA VM (192.168.1.159)
# Baixa os arquivos .tar da máquina de desenvolvimento

echo "🚀 Deploy automático - Baixando imagens da máquina de desenvolvimento..."
echo "=========================================================================="
echo ""

# Configurações
DEV_MACHINE="192.168.1.100:8000"
BACKEND_URL="http://${DEV_MACHINE}/locacao-backend.tar"
FRONTEND_URL="http://${DEV_MACHINE}/locacao-frontend.tar"

# Ir para diretório do projeto
cd /home/matheus/Locacao || { echo "❌ Erro: Diretório não encontrado"; exit 1; }

echo "📥 1/4 - Baixando Backend (139 MB)..."
curl -# -o locacao-backend.tar "${BACKEND_URL}" || { echo "❌ Erro ao baixar backend"; exit 1; }
echo "✅ Backend baixado!"
echo ""

echo "📥 2/4 - Baixando Frontend (146 MB)..."
curl -# -o locacao-frontend.tar "${FRONTEND_URL}" || { echo "❌ Erro ao baixar frontend"; exit 1; }
echo "✅ Frontend baixado!"
echo ""

echo "🛑 3/4 - Parando containers atuais..."
docker-compose -f docker-compose.prod.yml down
echo "✅ Containers parados!"
echo ""

echo "📦 4/4 - Carregando novas imagens..."
docker load -i locacao-backend.tar
docker load -i locacao-frontend.tar
echo "✅ Imagens carregadas!"
echo ""

echo "🚀 Subindo containers com novas imagens..."
docker-compose -f docker-compose.prod.yml up -d
echo ""

echo "✅ Deploy concluído com sucesso!"
echo ""
echo "🔍 Verificando status dos containers..."
docker-compose -f docker-compose.prod.yml ps
echo ""

echo "🌐 URLs de acesso:"
echo "  Frontend: http://192.168.1.159:3000"
echo "  Backend:  http://192.168.1.159:8080"
echo ""

echo "🧹 Limpando arquivos .tar..."
rm -f locacao-backend.tar locacao-frontend.tar
echo "✅ Limpeza concluída!"
echo ""

echo "=========================================================================="
echo "🎉 Sistema atualizado e rodando!"
echo "=========================================================================="