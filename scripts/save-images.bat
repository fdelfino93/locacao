@echo off
echo 💾 Salvando imagens Docker para transferir para VM...

echo.
echo 🧹 Limpando arquivos .tar antigos...
if exist locacao-backend.tar (
    del /F /Q locacao-backend.tar
    echo ✓ locacao-backend.tar antigo removido
)
if exist locacao-frontend.tar (
    del /F /Q locacao-frontend.tar
    echo ✓ locacao-frontend.tar antigo removido
)

echo.
echo 📦 Exportando Backend...
docker save locacao-backend:latest -o locacao-backend.tar
if %ERRORLEVEL% neq 0 (
    echo ❌ Erro ao exportar backend
    exit /b 1
)

echo.
echo 📦 Exportando Frontend...
docker save locacao-frontend:latest -o locacao-frontend.tar
if %ERRORLEVEL% neq 0 (
    echo ❌ Erro ao exportar frontend
    exit /b 1
)

echo.
echo ✅ Imagens exportadas com sucesso!
echo.
echo 📁 Arquivos criados:
echo   - locacao-backend.tar
echo   - locacao-frontend.tar
echo.
echo 📤 Próximos passos:
echo   1. Copie os arquivos .tar para a VM
echo   2. Execute na VM: docker load -i locacao-backend.tar
echo   3. Execute na VM: docker load -i locacao-frontend.tar
echo   4. Execute na VM: docker-compose -f docker-compose.prod.yml up -d