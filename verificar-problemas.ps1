# Script para verificar problemas do servidor
# Uso: .\verificar-problemas.ps1

$ErrorActionPreference = "Continue"

Write-Host "=== Verificando Problemas do Servidor ===" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar se servidor está rodando
Write-Host "1. Verificando processos Node.js..." -ForegroundColor Yellow
$nodeProcesses = Get-Process | Where-Object {$_.ProcessName -eq "node"} | Where-Object {
    $_.Path -like "*nodejs*"
}
if ($nodeProcesses) {
    Write-Host "   OK Servidor Node.js rodando (PID: $($nodeProcesses.Id -join ', '))" -ForegroundColor Green
} else {
    Write-Host "   ERRO Nenhum processo Node.js encontrado!" -ForegroundColor Red
    Write-Host "   Solucao: Execute 'npx --yes pnpm start'" -ForegroundColor Yellow
}

# 2. Verificar porta
Write-Host ""
Write-Host "2. Verificando porta 3000..." -ForegroundColor Yellow
$port3000 = netstat -ano | findstr ":3000" | findstr "LISTENING"
if ($port3000) {
    Write-Host "   OK Porta 3000 esta em uso" -ForegroundColor Green
} else {
    Write-Host "   ERRO Porta 3000 nao esta em uso!" -ForegroundColor Red
    Write-Host "   Solucao: O servidor pode ter parado" -ForegroundColor Yellow
}

# 3. Verificar .env
Write-Host ""
Write-Host "3. Verificando arquivo .env..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "   OK Arquivo .env existe" -ForegroundColor Green
    
    $envContent = Get-Content ".env" -Raw
    $hasSkipAuth = $envContent -match "SKIP_AUTH\s*=\s*true"
    $hasViteSkipAuth = $envContent -match "VITE_SKIP_AUTH\s*=\s*true"
    $hasOfflineAuth = $envContent -match "VITE_OFFLINE_AUTH\s*=\s*true"
    
    if ($hasSkipAuth) {
        Write-Host "   OK SKIP_AUTH=true configurado" -ForegroundColor Green
    } else {
        Write-Host "   AVISO SKIP_AUTH nao esta como true" -ForegroundColor Yellow
    }
    
    if ($hasViteSkipAuth) {
        Write-Host "   OK VITE_SKIP_AUTH=true configurado" -ForegroundColor Green
    } else {
        Write-Host "   AVISO VITE_SKIP_AUTH nao esta como true" -ForegroundColor Yellow
    }
    
    # Verificar SQL Server
    $hasSqlServer = $envContent -match "SQLSERVER_SERVER"
    if ($hasSqlServer) {
        Write-Host "   OK SQLSERVER_SERVER configurado" -ForegroundColor Green
    } else {
        Write-Host "   ERRO SQLSERVER_SERVER nao configurado!" -ForegroundColor Red
    }
} else {
    Write-Host "   ERRO Arquivo .env nao existe!" -ForegroundColor Red
}

# 4. Verificar build
Write-Host ""
Write-Host "4. Verificando build..." -ForegroundColor Yellow
if (Test-Path "dist\public\index.html") {
    Write-Host "   OK Build existe (dist/public/index.html)" -ForegroundColor Green
} else {
    Write-Host "   ERRO Build nao encontrado!" -ForegroundColor Red
    Write-Host "   Solucao: Execute 'npx --yes pnpm build'" -ForegroundColor Yellow
}

# 5. Verificar node_modules
Write-Host ""
Write-Host "5. Verificando dependencias..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "   OK node_modules existe" -ForegroundColor Green
} else {
    Write-Host "   ERRO node_modules nao existe!" -ForegroundColor Red
    Write-Host "   Solucao: Execute 'npx --yes pnpm install'" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Solucoes Comuns ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Se o servidor parou:" -ForegroundColor White
Write-Host "1. Verifique os logs do terminal onde o servidor estava rodando" -ForegroundColor Gray
Write-Host "2. Procure por erros em vermelho" -ForegroundColor Gray
Write-Host "3. Verifique se o banco de dados esta acessivel" -ForegroundColor Gray
Write-Host "4. Tente reiniciar o servidor:" -ForegroundColor Gray
Write-Host "   npx --yes pnpm start" -ForegroundColor White
Write-Host ""
Write-Host "Se a pagina parou de carregar:" -ForegroundColor White
Write-Host "1. Abra o console do navegador (F12)" -ForegroundColor Gray
Write-Host "2. Vá na aba Console e procure erros" -ForegroundColor Gray
Write-Host "3. Vá na aba Network e verifique se arquivos estao carregando" -ForegroundColor Gray
Write-Host "4. Limpe o cache do navegador (Ctrl+Shift+Delete)" -ForegroundColor Gray
Write-Host ""

