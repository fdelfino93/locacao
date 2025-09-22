@echo off
echo 🚀 Iniciando ambiente de desenvolvimento com Docker...

echo.
echo 🛑 Parando containers existentes...
docker-compose -f docker-compose.dev.yml down

echo.
echo 🔄 Iniciando containers em modo desenvolvimento...
docker-compose -f docker-compose.dev.yml up --build

echo.
echo 🌐 Aplicação disponível em:
echo   - Frontend: http://localhost:3000
echo   - Backend API: http://localhost:8080
echo   - Health Check: http://localhost:8080/api/health