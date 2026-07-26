@echo off
title SimBio Cs-137 - Simulador Biocinético
echo.
echo  =====================================================
echo   SimBio Cs-137 - Simulador Biocinético de Césio-137
echo  =====================================================
echo.
echo  Abrindo o simulador no navegador padrão...
echo.

:: Abrir o index.html da pasta 'arquivos' no navegador padrão
start "" "%~dp0arquivos\index.html"

echo  O simulador foi aberto com sucesso!
echo  Você pode fechar esta janela.
echo.
timeout /t 4 >nul
