#!/bin/bash
# Script para executar na VM (Linux)

echo "🚀 Iniciando deploy na VM..."

# Verificar se os arquivos tar existem
if [ ! -f "locacao-backend.tar" ]; then
    echo "❌ Arquivo locacao-backend.tar não encontrado"
    exit 1
fi

if [ ! -f "locacao-frontend.tar" ]; then
    echo "❌ Arquivo locacao-frontend.tar não encontrado"
    exit 1
fi

echo ""
echo "🛑 Parando containers existentes..."
docker-compose -f docker-compose.prod.yml down

echo ""
echo "📦 Carregando imagem do Backend..."
docker load -i locacao-backend.tar

echo ""
echo "📦 Carregando imagem do Frontend..."
docker load -i locacao-frontend.tar

echo ""
echo "🔄 Iniciando containers em produção..."
docker-compose -f docker-compose.prod.yml up -d

echo ""
echo "⏳ Aguardando containers iniciarem..."
sleep 10

echo ""
echo "🩺 Verificando status dos containers..."
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "✅ Deploy concluído!"
echo ""
echo "🌐 Aplicação disponível em:"
echo "  - Frontend: http://192.168.1.159:3000"
echo "  - Backend API: http://192.168.1.159:8080"
echo "  - Health Check: http://192.168.1.159:8080/api/health"
echo ""
echo "📋 Comandos úteis:"
echo "  - Ver logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "  - Reiniciar: docker-compose -f docker-compose.prod.yml restart"
echo "  - Parar: docker-compose -f docker-compose.prod.yml down"