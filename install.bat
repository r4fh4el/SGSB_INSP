@echo off
REM ============================================
REM Script de Instalação Rápida - SGSB (Windows)
REM ============================================

echo 🚀 Iniciando instalação do SGSB...
echo.

REM Verificar Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js não encontrado!
    echo    Instale Node.js 18+ em: https://nodejs.org
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo ✅ Node.js encontrado: %NODE_VERSION%

REM Verificar npm
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm não encontrado!
    exit /b 1
)

for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
echo ✅ npm encontrado: %NPM_VERSION%
echo.

REM Instalar dependências
echo 📦 Instalando dependências...
call npm install

if %errorlevel% neq 0 (
    echo ❌ Erro ao instalar dependências!
    exit /b 1
)

echo ✅ Dependências instaladas!
echo.

REM Verificar se .env existe
if not exist .env (
    echo ⚙️  Criando arquivo .env...
    if exist env.example.txt (
        copy env.example.txt .env >nul
        echo ✅ Arquivo .env criado a partir de env.example.txt
        echo ⚠️  IMPORTANTE: Edite o arquivo .env com suas configurações!
    ) else (
        echo ⚠️  Arquivo env.example.txt não encontrado!
        echo    Crie manualmente o arquivo .env
    )
) else (
    echo ✅ Arquivo .env já existe
)

echo.
echo 🔨 Fazendo build do projeto...
call npm run build

if %errorlevel% neq 0 (
    echo ❌ Erro no build!
    exit /b 1
)

echo ✅ Build concluído!
echo.
echo ============================================
echo ✅ Instalação concluída!
echo ============================================
echo.
echo 📝 Próximos passos:
echo    1. Edite o arquivo .env com suas configurações
echo    2. Configure o SQL Server (veja CONFIGURAR_SQL_ONLINE.md)
echo    3. Execute: npm start
echo.
echo 📚 Documentação:
echo    - COMO_RODAR_ONLINE.md - Guia completo
echo    - CONFIGURAR_SQL_ONLINE.md - Configurar SQL Server
echo.

pause


