# Script para rodar o sistema offline com SQL Server online
# Uso: .\rodar-offline.ps1

$ErrorActionPreference = "Stop"

Write-Host "=== Rodando SGSB Offline com SQL Server Online ===" -ForegroundColor Cyan
Write-Host ""

# Verificar se está no diretório correto
if (-not (Test-Path "package.json")) {
    Write-Host "Erro: Execute este script dentro do diretório SGSB!" -ForegroundColor Red
    exit 1
}

# Verificar se .env existe
if (-not (Test-Path ".env")) {
    Write-Host "⚠ Arquivo .env não encontrado!" -ForegroundColor Yellow
    Write-Host "Execute primeiro: .\configurar-sql-online.ps1" -ForegroundColor Yellow
    Write-Host ""
    $criar = Read-Host "Deseja criar o .env agora? (S/N)"
    if ($criar -eq "S" -or $criar -eq "s") {
        .\configurar-sql-online.ps1
    } else {
        exit 1
    }
}

# Verificar se node_modules existe
if (-not (Test-Path "node_modules")) {
    Write-Host "Instalando dependências..." -ForegroundColor Yellow
    pnpm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Erro ao instalar dependências!" -ForegroundColor Red
        exit 1
    }
}

# Verificar conexão com SQL Server
Write-Host "Verificando conexão com SQL Server..." -ForegroundColor Yellow
$envContent = Get-Content ".env" -Raw
if ($envContent -match "SQLSERVER_SERVER=(.+)") {
    $server = $matches[1].Trim()
    Write-Host "  Servidor: $server" -ForegroundColor Gray
} else {
    Write-Host "  ⚠ Servidor SQL não configurado no .env" -ForegroundColor Yellow
}

# Executar script SQL (se necessário)
Write-Host ""
Write-Host "⚠ IMPORTANTE: Certifique-se de que a tabela 'caracterizacaoBarragem' existe no banco!" -ForegroundColor Yellow
Write-Host "  Execute o script: sqlserver\caracterizacao_barragem.sql no seu SQL Server" -ForegroundColor Yellow
Write-Host ""

$continuar = Read-Host "Deseja continuar e rodar o sistema? (S/N)"
if ($continuar -ne "S" -and $continuar -ne "s") {
    Write-Host "Operação cancelada." -ForegroundColor Yellow
    exit 0
}

# Rodar em modo desenvolvimento
Write-Host ""
Write-Host "Iniciando servidor em modo desenvolvimento..." -ForegroundColor Green
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "  Backend: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pressione Ctrl+C para parar" -ForegroundColor Yellow
Write-Host ""

pnpm dev




