@echo off
echo 💾 Preparando arquivos para transferir via USB...
echo.

:: Detectar drives USB
echo 🔍 Procurando drives USB...
wmic logicaldisk where drivetype=2 get DeviceID, VolumeName

echo.
set /p USB_DRIVE="Digite a letra do drive USB (ex: E): "

:: Verificar se o drive existe
if not exist "%USB_DRIVE%:\" (
    echo ❌ Drive %USB_DRIVE%: não encontrado!
    exit /b 1
)

:: Criar pasta no USB
echo 📁 Criando pasta docker-images no USB...
if not exist "%USB_DRIVE%:\docker-images" mkdir "%USB_DRIVE%:\docker-images"

:: Copiar arquivos
echo 📋 Copiando arquivos para USB...
copy locacao-backend.tar "%USB_DRIVE%:\docker-images\"
copy locacao-frontend.tar "%USB_DRIVE%:\docker-images\"

echo.
echo ✅ Arquivos copiados para %USB_DRIVE%:\docker-images\
echo.
echo 📝 INSTRUÇÕES:
echo.
echo 1. Remova o USB com segurança
echo 2. Conecte na VM
echo 3. Na VM execute:
echo    sudo mkdir -p /mnt/usb
echo    sudo mount /dev/sdb1 /mnt/usb  (ou sdc1, conforme o USB)
echo    cp /mnt/usb/docker-images/*.tar ~/
echo    cd ~/Locacao
echo    ./scripts/deploy-vm.sh
echo.
echo ✅ Pronto para transferir!