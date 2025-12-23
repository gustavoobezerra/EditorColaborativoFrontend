@echo off
chcp 65001 > nul
cls
echo ====================================
echo   👤 CRIAR USUÁRIO DE TESTE
echo ====================================
echo.
echo Este script vai criar um usuário de teste
echo no banco de dados MongoDB.
echo.
echo Credenciais que serão criadas:
echo   Email: gustavo@teste.com
echo   Senha: senha123
echo.
echo Pressione qualquer tecla para continuar...
pause > nul

cd backend
echo.
echo Criando usuário...
echo.
call npm run create-user

echo.
echo ====================================
echo Processo finalizado!
echo ====================================
echo.
echo Use estas credenciais para fazer login:
echo   Email: gustavo@teste.com
echo   Senha: senha123
echo.
pause
