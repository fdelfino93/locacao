@echo off
echo 📁 Compartilhando arquivos .tar via rede...
echo.

:: Criar pasta compartilhada
if not exist "docker-images" mkdir docker-images

:: Copiar arquivos para pasta compartilhada
echo 📋 Copiando arquivos...
copy locacao-backend.tar docker-images\
copy locacao-frontend.tar docker-images\

echo.
echo ✅ Arquivos prontos em: %cd%\docker-images
echo.
echo 📝 INSTRUÇÕES PARA A VM:
echo.
echo 1. Na VM, monte o compartilhamento:
echo    sudo mkdir -p /mnt/windows
echo    sudo mount -t cifs //192.168.1.SEU_IP/docker-images /mnt/windows -o username=SEU_USUARIO
echo.
echo 2. Copie os arquivos:
echo    cp /mnt/windows/*.tar ~/
echo.
echo 3. Execute o deploy:
echo    cd ~/Locacao
echo    ./scripts/deploy-vm.sh
echo.
echo 🌐 Substitua SEU_IP pelo IP da sua máquina Windows!