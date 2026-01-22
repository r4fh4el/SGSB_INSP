# Script rápido para rodar o SGSB_INSP
# Uso: .\rodar-agora.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SGSB_INSP - Iniciando Sistema" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se está no diretório correto
if (-not (Test-Path "package.json")) {
    Write-Host "ERRO: Execute este script dentro do diretório SGSB_INSP" -ForegroundColor Red
    exit 1
}

# Verificar .env
if (-not (Test-Path ".env")) {
    Write-Host "AVISO: Arquivo .env não encontrado!" -ForegroundColor Yellow
    if (Test-Path "env.example.txt") {
        Write-Host "Criando .env a partir de env.example.txt..." -ForegroundColor Yellow
        Copy-Item "env.example.txt" ".env"
        Write-Host "Configure o arquivo .env antes de continuar!" -ForegroundColor Yellow
        exit 1
    }
}

# Verificar dependências
if (-not (Test-Path "node_modules")) {
    Write-Host "Instalando dependências..." -ForegroundColor Yellow
    pnpm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERRO ao instalar dependências!" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "Iniciando sistema em modo DESENVOLVIMENTO..." -ForegroundColor Green
Write-Host ""
Write-Host "URLs de acesso:" -ForegroundColor Yellow
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "  Backend:  http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Pressione Ctrl+C para parar" -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Iniciar
pnpm dev
