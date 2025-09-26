@echo off
REM Script para executar o job de acréscimos diário
REM Configurado para ser executado via Task Scheduler do Windows

echo ========================================
echo  JOB AUTOMATICO DE ACRESCIMOS DIARIO
echo ========================================
echo.

REM Definir diretório do projeto
cd /d "C:\Users\matheus\Documents\Locacao\Locacao"

REM Ativar ambiente virtual se existir
if exist venv\Scripts\activate.bat (
    echo Ativando ambiente virtual...
    call venv\Scripts\activate.bat
)

REM Executar o job
echo Executando job de acrescimos...
python job_acrescimos_diario.py

REM Verificar resultado
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Job executado com sucesso!
) else (
    echo.
    echo ❌ Job falhou com erro %ERRORLEVEL%
)

echo.
echo Pressione qualquer tecla para fechar...
pause >nul