@echo off
echo 🚀 DEPLOY COMPLETO via Registry Privado
echo ========================================
echo.

set REGISTRY=192.168.1.159:5000
set VM_USER=seraph
set VM_HOST=192.168.1.159
set VM_PATH=/home/seraph/locacao

echo 📋 Configurações:
echo    Registry: %REGISTRY%
echo    VM:       %VM_USER%@%VM_HOST%
echo    Path:     %VM_PATH%
echo.

:: Passo 1: Build
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 🔨 Passo 1/4: Build das imagens locais
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

call npm run docker:build
if %ERRORLEVEL% neq 0 (
    echo ❌ Erro no build - Deploy cancelado
    exit /b 1
)

echo.
echo ✅ Build concluído!
echo.

:: Passo 2: Tag e Push
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 📤 Passo 2/4: Push para Registry Privado
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

call .\scripts\registry-push.bat
if %ERRORLEVEL% neq 0 (
    echo ❌ Erro no push - Deploy cancelado
    exit /b 1
)

echo.
echo ✅ Push concluído!
echo.

:: Passo 3: Pull na VM
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 🔄 Passo 3/4: Pull das imagens na VM
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

ssh %VM_USER%@%VM_HOST% "cd %VM_PATH% && docker-compose -f docker-compose.prod.yml pull"
if %ERRORLEVEL% neq 0 (
    echo ❌ Erro no pull - Deploy cancelado
    echo 💡 Verifique:
    echo    1. VM fez login no registry
    echo    2. docker-compose.prod.yml está atualizado
    exit /b 1
)

echo.
echo ✅ Pull concluído!
echo.

:: Passo 4: Deploy
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 🐋 Passo 4/4: Atualizando containers na VM
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

ssh %VM_USER%@%VM_HOST% "cd %VM_PATH% && docker-compose -f docker-compose.prod.yml up -d"
if %ERRORLEVEL% neq 0 (
    echo ❌ Erro ao atualizar containers
    exit /b 1
)

echo.
echo ✅ Containers atualizados!
echo.

:: Verificar status
echo 🔍 Verificando status dos containers...
ssh %VM_USER%@%VM_HOST% "cd %VM_PATH% && docker-compose -f docker-compose.prod.yml ps"

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 🎉 DEPLOY COMPLETO COM SUCESSO!
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 🌐 Sistema disponível em:
echo    Frontend: http://%VM_HOST%:3000
echo    Backend:  http://%VM_HOST%:8080
echo.
echo 📋 Imagens deployadas:
echo    %REGISTRY%/locacao-backend:latest
echo    %REGISTRY%/locacao-frontend:latest
echo.
echo ✅ Pronto para uso!
echo.
