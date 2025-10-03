@echo off
echo 🔐 Login no Registry Privado
echo ============================
echo.

set REGISTRY=192.168.1.159:5000
set USERNAME=locacao
set PASSWORD=Loc@c@o2025!Secure

echo 📋 Registry: %REGISTRY%
echo 👤 Usuário: %USERNAME%
echo.

echo 🔑 Fazendo login...
echo %PASSWORD% | docker login %REGISTRY% -u %USERNAME% --password-stdin

if %ERRORLEVEL% neq 0 (
    echo.
    echo ❌ Erro ao fazer login!
    echo.
    echo 💡 Possíveis causas:
    echo    1. Registry não está rodando na VM
    echo    2. Firewall bloqueando porta 5000
    echo    3. Docker não configurado para insecure-registry
    echo.
    echo 🔧 Solução:
    echo    1. Na VM: docker ps ^| grep registry
    echo    2. Configurar Docker Desktop ^(Settings ^> Docker Engine^):
    echo       {
    echo         "insecure-registries": ["%REGISTRY%"]
    echo       }
    echo    3. Reiniciar Docker Desktop
    exit /b 1
)

echo.
echo ✅ Login realizado com sucesso!
echo.
echo 🧪 Testando conectividade...
curl -s -u %USERNAME%:%PASSWORD% http://%REGISTRY%/v2/_catalog

echo.
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 🎉 CONECTADO AO REGISTRY!
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo ✅ Credenciais salvas no Docker
echo 📍 Localização: %%USERPROFILE%%\.docker\config.json
echo.
echo 🚀 Próximos passos:
echo    npm run docker:build         # Build das imagens
echo    npm run docker:push          # Push para registry
echo.
