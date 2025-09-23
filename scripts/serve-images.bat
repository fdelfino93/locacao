@echo off
echo 🌐 Iniciando servidor HTTP para transferir imagens...
echo.

:: Verificar se Python está instalado
python --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ Python não encontrado! Instale Python primeiro.
    exit /b 1
)

:: Criar pasta para servir
if not exist "docker-serve" mkdir docker-serve
copy locacao-backend.tar docker-serve\
copy locacao-frontend.tar docker-serve\

echo ✅ Servidor HTTP iniciando na porta 8888...
echo.
echo 📋 INSTRUÇÕES PARA A VM:
echo.
echo Na VM execute:
echo   wget http://SEU_IP:8888/locacao-backend.tar
echo   wget http://SEU_IP:8888/locacao-frontend.tar
echo   cd ~/Locacao
echo   ./scripts/deploy-vm.sh
echo.
echo 🌐 Substitua SEU_IP pelo IP da sua máquina Windows!
echo 🛑 Pressione Ctrl+C para parar o servidor depois da transferência.
echo.

:: Iniciar servidor Python
cd docker-serve
python -m http.server 8888