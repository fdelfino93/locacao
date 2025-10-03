@echo off
echo 🚀 Push de Imagens para Registry Privado
echo ========================================
echo.

set REGISTRY=192.168.1.159:5000
set BACKEND_IMAGE=locacao-backend
set FRONTEND_IMAGE=locacao-frontend

echo 📋 Configurações:
echo    Registry: %REGISTRY%
echo    Backend:  %BACKEND_IMAGE%
echo    Frontend: %FRONTEND_IMAGE%
echo.

:: Verificar se as imagens locais existem
echo 🔍 Verificando imagens locais...
docker images | findstr %BACKEND_IMAGE% >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ Imagem %BACKEND_IMAGE% não encontrada!
    echo 💡 Execute primeiro: npm run docker:build
    exit /b 1
)

docker images | findstr %FRONTEND_IMAGE% >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ Imagem %FRONTEND_IMAGE% não encontrada!
    echo 💡 Execute primeiro: npm run docker:build
    exit /b 1
)

echo ✅ Imagens locais encontradas!
echo.

:: Tag Backend
echo 🏷️  Tag Backend para registry...
docker tag %BACKEND_IMAGE%:latest %REGISTRY%/%BACKEND_IMAGE%:latest
if %ERRORLEVEL% neq 0 (
    echo ❌ Erro ao criar tag do backend
    exit /b 1
)
echo ✅ Backend tagged: %REGISTRY%/%BACKEND_IMAGE%:latest

:: Tag Frontend
echo 🏷️  Tag Frontend para registry...
docker tag %FRONTEND_IMAGE%:latest %REGISTRY%/%FRONTEND_IMAGE%:latest
if %ERRORLEVEL% neq 0 (
    echo ❌ Erro ao criar tag do frontend
    exit /b 1
)
echo ✅ Frontend tagged: %REGISTRY%/%FRONTEND_IMAGE%:latest
echo.

:: Push Backend
echo 📤 Enviando Backend para registry...
docker push %REGISTRY%/%BACKEND_IMAGE%:latest
if %ERRORLEVEL% neq 0 (
    echo ❌ Erro ao enviar backend
    echo 💡 Verifique:
    echo    1. Registry está rodando: docker ps ^| grep registry
    echo    2. Você fez login: docker login %REGISTRY%
    exit /b 1
)
echo ✅ Backend enviado com sucesso!
echo.

:: Push Frontend
echo 📤 Enviando Frontend para registry...
docker push %REGISTRY%/%FRONTEND_IMAGE%:latest
if %ERRORLEVEL% neq 0 (
    echo ❌ Erro ao enviar frontend
    exit /b 1
)
echo ✅ Frontend enviado com sucesso!
echo.

echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 🎉 PUSH COMPLETO!
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 📋 Imagens no Registry:
echo    %REGISTRY%/%BACKEND_IMAGE%:latest
echo    %REGISTRY%/%FRONTEND_IMAGE%:latest
echo.
echo 🔍 Verificar catálogo:
echo    curl -u locacao:Loc@c@o2025!Secure http://%REGISTRY%/v2/_catalog
echo.
echo ✅ Próximo passo: Deploy na VM
echo    npm run docker:pull-vm
echo.
