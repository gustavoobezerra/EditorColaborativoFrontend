@echo off
title Backend - Editor Colaborativo
color 0A

echo ============================================
echo    BACKEND - EDITOR COLABORATIVO
echo ============================================
echo.
echo Instalando dependencias (caso necessario)...
cd /d "%~dp0backend"
call npm install

echo.
echo Iniciando servidor backend...
echo.
call node src/server.js

pause
