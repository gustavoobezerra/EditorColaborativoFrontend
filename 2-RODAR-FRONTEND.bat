@echo off
title Frontend - Editor Colaborativo
color 0B

echo ============================================
echo    FRONTEND - EDITOR COLABORATIVO
echo ============================================
echo.
echo Instalando dependencias (caso necessario)...
cd /d "%~dp0frontend"
call npm install

echo.
echo Iniciando servidor frontend com npx...
echo Aguarde alguns segundos...
echo.
call npx vite

pause
