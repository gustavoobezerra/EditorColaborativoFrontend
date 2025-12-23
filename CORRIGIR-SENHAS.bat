@echo off
chcp 65001 > nul
cls
echo ====================================
echo   🔐 CRIPTOGRAFAR SENHAS - MongoDB
echo ====================================
echo.
echo Este script vai criptografar todas as senhas
echo em texto plano no banco de dados MongoDB.
echo.
echo Pressione qualquer tecla para continuar...
pause > nul

cd backend
echo.
echo Executando script de criptografia...
echo.
call npm run hash-passwords

echo.
echo ====================================
echo Processo finalizado!
echo ====================================
echo.
pause
