@echo off
echo 🚀 DEPLOY COMPLETO PARA VM - Automatizado
echo ========================================
echo.

echo 🔨 Passo 1/3: Build das imagens...
call npm run docker:build
if %ERRORLEVEL% neq 0 (
    echo ❌ Falha no build - Deploy cancelado
    exit /b 1
)

echo.
echo 💾 Passo 2/3: Salvando imagens em .tar...
call npm run docker:save
if %ERRORLEVEL% neq 0 (
    echo ❌ Falha no save - Deploy cancelado
    exit /b 1
)

echo.
echo 📤 Passo 3/3: Upload e deploy na VM...
call npm run docker:upload
if %ERRORLEVEL% neq 0 (
    echo ❌ Falha no upload - Deploy cancelado
    exit /b 1
)

echo.
echo 🎉 ========================================
echo    DEPLOY COMPLETO REALIZADO COM SUCESSO!
echo ========================================
echo.
echo 🌐 Acesse o sistema:
echo   Frontend: http://192.168.1.159:3000
echo   Backend:  http://192.168.1.159:8080
echo.
echo ✨ Pronto para uso!