@echo off
echo 🔨 Iniciando build das imagens Docker...

echo.
echo 📦 Buildando Backend...
docker build -t locacao-backend:latest .
if %ERRORLEVEL% neq 0 (
    echo ❌ Erro no build do backend
    exit /b 1
)

echo.
echo 📦 Buildando Frontend...
docker build -t locacao-frontend:latest ./frontend
if %ERRORLEVEL% neq 0 (
    echo ❌ Erro no build do frontend
    exit /b 1
)

echo.
echo ✅ Build concluído com sucesso!
echo.
echo 🏷️ Imagens criadas:
echo   - locacao-backend:latest
echo   - locacao-frontend:latest
echo.
echo 🚀 Para testar localmente: npm run docker:dev
echo 📤 Para enviar para VM: npm run docker:save