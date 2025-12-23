@echo off
title INICIAR PROJETO COMPLETO
color 0E

echo ============================================
echo    EDITOR COLABORATIVO
echo    Por: Gustavo Bezerra
echo ============================================
echo.
echo Este script vai abrir 2 janelas:
echo 1. Backend (servidor Node.js)
echo 2. Frontend (interface React)
echo.
echo Aguarde ambas as janelas iniciarem completamente!
echo.
pause

echo.
echo Instalando dependencias do Backend...
cd /d "%~dp0backend"
call npm install
echo.

echo Instalando dependencias do Frontend...
cd /d "%~dp0frontend"
call npm install
echo.

echo.
echo Iniciando Backend...
start "Backend - Editor Colaborativo" cmd /k "cd /d "%~dp0backend" && node src/server.js"

timeout /t 5 /nobreak >nul

echo Iniciando Frontend...
start "Frontend - Editor Colaborativo" cmd /k "cd /d "%~dp0frontend" && npx vite"

timeout /t 3 /nobreak >nul

echo.
echo ============================================
echo    PROJETO INICIADO!
echo ============================================
echo.
echo Aguarde alguns segundos e acesse:
echo.
echo    http://localhost:5173
echo.
echo Copie e cole esta URL no seu navegador!
echo.
echo ============================================
echo.
echo Pressione qualquer tecla para sair
echo (As janelas do backend/frontend continuarao rodando)
pause >nul
