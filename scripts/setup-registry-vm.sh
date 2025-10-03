#!/bin/bash
# 🔐 Script de Setup do Registry Privado na VM
# Execute este script NA VM (192.168.1.159) via SSH

echo "🚀 Configurando Docker Registry Privado..."
echo ""

# Verificar se está rodando como seraph
if [ "$USER" != "seraph" ]; then
    echo "❌ Este script deve ser executado pelo usuário seraph"
    exit 1
fi

# Criar diretórios
echo "📁 Criando diretórios..."
cd /home/seraph
mkdir -p registry/auth
mkdir -p registry/data
cd registry

# Verificar se htpasswd está instalado
if ! command -v htpasswd &> /dev/null; then
    echo "📦 Instalando apache2-utils..."
    sudo apt-get update
    sudo apt-get install -y apache2-utils
fi

# Criar arquivo de autenticação
echo "🔐 Criando credenciais de autenticação..."
htpasswd -Bbn locacao 'Loc@c@o2025!Secure' > auth/htpasswd

echo "✅ Arquivo htpasswd criado:"
cat auth/htpasswd
echo ""

# Parar registry se já existir
if [ "$(docker ps -aq -f name=registry)" ]; then
    echo "🛑 Parando registry existente..."
    docker stop registry 2>/dev/null
    docker rm registry 2>/dev/null
fi

# Criar registry com autenticação
echo "🐋 Criando Docker Registry..."
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

echo ""
echo "⏳ Aguardando registry iniciar..."
sleep 3

# Verificar se está rodando
if [ "$(docker ps -q -f name=registry)" ]; then
    echo "✅ Registry rodando com sucesso!"
    docker ps | grep registry
else
    echo "❌ Erro ao iniciar registry"
    docker logs registry
    exit 1
fi

# Configurar Docker daemon para aceitar registry HTTP
echo ""
echo "🔧 Configurando Docker daemon..."

DAEMON_JSON="/etc/docker/daemon.json"

if [ -f "$DAEMON_JSON" ]; then
    # Fazer backup
    sudo cp $DAEMON_JSON ${DAEMON_JSON}.backup
    echo "💾 Backup criado: ${DAEMON_JSON}.backup"
fi

# Criar/atualizar daemon.json
sudo tee $DAEMON_JSON > /dev/null <<EOF
{
  "insecure-registries": ["192.168.1.159:5000"]
}
EOF

echo "✅ daemon.json configurado"

# Reiniciar Docker
echo ""
echo "🔄 Reiniciando Docker..."
sudo systemctl restart docker

echo "⏳ Aguardando Docker reiniciar..."
sleep 5

# Reiniciar registry após restart do Docker
docker start registry 2>/dev/null
sleep 2

# Fazer login no registry
echo ""
echo "🔐 Fazendo login no registry..."
echo 'Loc@c@o2025!Secure' | docker login 192.168.1.159:5000 -u locacao --password-stdin

if [ $? -eq 0 ]; then
    echo "✅ Login realizado com sucesso!"
else
    echo "❌ Erro ao fazer login"
    exit 1
fi

# Configurar firewall (se UFW estiver ativo)
if command -v ufw &> /dev/null; then
    if sudo ufw status | grep -q "Status: active"; then
        echo ""
        echo "🔥 Configurando firewall..."
        sudo ufw allow from 192.168.1.0/24 to any port 5000
        echo "✅ Porta 5000 liberada para rede local"
    fi
fi

# Testar registry
echo ""
echo "🧪 Testando registry..."
RESPONSE=$(curl -s -u locacao:Loc@c@o2025!Secure http://192.168.1.159:5000/v2/_catalog)

if [[ "$RESPONSE" == *"repositories"* ]]; then
    echo "✅ Registry respondendo corretamente!"
    echo "📋 Catálogo atual: $RESPONSE"
else
    echo "⚠️ Registry pode não estar respondendo corretamente"
    echo "Resposta: $RESPONSE"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 SETUP COMPLETO!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Informações do Registry:"
echo "   URL:      192.168.1.159:5000"
echo "   Usuário:  locacao"
echo "   Senha:    Loc@c@o2025!Secure"
echo ""
echo "🔍 Comandos úteis:"
echo "   Ver status:   docker ps | grep registry"
echo "   Ver logs:     docker logs -f registry"
echo "   Reiniciar:    docker restart registry"
echo "   Catálogo:     curl -u locacao:Loc@c@o2025!Secure http://192.168.1.159:5000/v2/_catalog"
echo ""
echo "✅ Próximo passo: Configurar sua máquina local (Windows)"
echo "   Consulte: DEPLOY_REGISTRY.md (PARTE 2)"
echo ""
