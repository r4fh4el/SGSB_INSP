# Script para iniciar o sistema SGSB (Frontend + Backend integrados)
# Uso: .\iniciar-sistema.ps1

$ErrorActionPreference = "Stop"

Write-Host "=== Iniciando Sistema SGSB ===" -ForegroundColor Cyan
Write-Host ""

# Verificar se está no diretório correto
if (-not (Test-Path "package.json")) {
    Write-Host "Erro: Execute este script dentro do diretório SGSB!" -ForegroundColor Red
    exit 1
}

# Matar processos Node.js antigos
Write-Host "Encerrando processos Node.js antigos..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -eq "node"} | ForEach-Object {
    try {
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
        Write-Host "  Processo $($_.Id) encerrado" -ForegroundColor Gray
    } catch {}
}
Start-Sleep -Seconds 2

# Verificar se .env existe
if (-not (Test-Path ".env")) {
    Write-Host "⚠ Arquivo .env não encontrado!" -ForegroundColor Yellow
    Write-Host "Execute primeiro: .\configurar-sql-online.ps1" -ForegroundColor Yellow
    exit 1
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

Write-Host ""
Write-Host "✅ Iniciando servidor..." -ForegroundColor Green
Write-Host ""
Write-Host "📌 O sistema integra Frontend e Backend em uma única porta" -ForegroundColor Cyan
Write-Host "   O servidor tentará usar a porta 80, ou 3000 como fallback" -ForegroundColor Gray
Write-Host ""
Write-Host "🌐 Acesse o sistema em:" -ForegroundColor Yellow
Write-Host "   http://localhost (se porta 80)" -ForegroundColor White
Write-Host "   ou http://localhost:3000 (se porta 3000)" -ForegroundColor White
Write-Host ""
Write-Host "Pressione Ctrl+C para parar" -ForegroundColor Yellow
Write-Host ""
Write-Host "─" * 50 -ForegroundColor Gray
Write-Host ""

# Iniciar o sistema
pnpm dev




