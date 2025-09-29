@echo off
echo 📡 Iniciando servidor HTTP para compartilhar arquivos .tar...
echo.
echo 🌐 Servidor rodando em: http://192.168.1.100:8000
echo.
echo 📁 Arquivos disponíveis:
echo   - http://192.168.1.100:8000/locacao-backend.tar
echo   - http://192.168.1.100:8000/locacao-frontend.tar
echo.
echo ⚠️  IMPORTANTE: Deixe esta janela aberta enquanto a VM baixa os arquivos!
echo.
echo 🛑 Para parar: Pressione CTRL+C
echo.
echo ==========================================
echo.

python -m http.server 8000