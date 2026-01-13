# Script para configurar o sistema para pular o login
# Uso: .\configurar-sem-login.ps1

$ErrorActionPreference = "Stop"

Write-Host "=== Configurando Sistema para Pular Login ===" -ForegroundColor Cyan
Write-Host ""

# Verificar se .env existe
if (-not (Test-Path ".env")) {
    Write-Host "❌ Arquivo .env não encontrado!" -ForegroundColor Red
    Write-Host "💡 Criando .env a partir de env.example.txt..." -ForegroundColor Yellow
    
    if (Test-Path "env.example.txt") {
        Copy-Item "env.example.txt" ".env"
        Write-Host "✅ Arquivo .env criado" -ForegroundColor Green
    } else {
        Write-Host "❌ env.example.txt também não encontrado!" -ForegroundColor Red
        exit 1
    }
}

Write-Host "📝 Adicionando configurações para pular autenticação..." -ForegroundColor Yellow

# Ler conteúdo atual do .env
$envContent = Get-Content ".env" -Raw

# Verificar e adicionar SKIP_AUTH (backend)
if ($envContent -notmatch "SKIP_AUTH") {
    $envContent = $envContent + [Environment]::NewLine + "# Skip authentication (backend)" + [Environment]::NewLine + "SKIP_AUTH=true" + [Environment]::NewLine
    Write-Host "   OK SKIP_AUTH=true adicionado" -ForegroundColor Green
} else {
    # Atualizar se já existir
    $envContent = $envContent -replace "SKIP_AUTH\s*=\s*.*", "SKIP_AUTH=true"
    Write-Host "   OK SKIP_AUTH atualizado para true" -ForegroundColor Green
}

# Verificar e adicionar VITE_SKIP_AUTH (frontend)
if ($envContent -notmatch "VITE_SKIP_AUTH") {
    $envContent = $envContent + [Environment]::NewLine + "# Skip authentication (frontend)" + [Environment]::NewLine + "VITE_SKIP_AUTH=true" + [Environment]::NewLine
    Write-Host "   OK VITE_SKIP_AUTH=true adicionado" -ForegroundColor Green
} else {
    # Atualizar se já existir
    $envContent = $envContent -replace "VITE_SKIP_AUTH\s*=\s*.*", "VITE_SKIP_AUTH=true"
    Write-Host "   OK VITE_SKIP_AUTH atualizado para true" -ForegroundColor Green
}

# Verificar e adicionar VITE_OFFLINE_AUTH (alternativa)
if ($envContent -notmatch "VITE_OFFLINE_AUTH") {
    $envContent = $envContent + [Environment]::NewLine + "# Offline authentication (alternative)" + [Environment]::NewLine + "VITE_OFFLINE_AUTH=true" + [Environment]::NewLine
    Write-Host "   OK VITE_OFFLINE_AUTH=true adicionado" -ForegroundColor Green
} else {
    # Atualizar se já existir
    $envContent = $envContent -replace "VITE_OFFLINE_AUTH\s*=\s*.*", "VITE_OFFLINE_AUTH=true"
    Write-Host "   OK VITE_OFFLINE_AUTH atualizado para true" -ForegroundColor Green
}

# Salvar arquivo .env
$envContent | Out-File -FilePath ".env" -Encoding UTF8 -Force

Write-Host ""
Write-Host "✅ Configuração concluída!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Variáveis adicionadas:" -ForegroundColor Cyan
Write-Host "   - SKIP_AUTH=true (backend)" -ForegroundColor White
Write-Host "   - VITE_SKIP_AUTH=true (frontend)" -ForegroundColor White
Write-Host "   - VITE_OFFLINE_AUTH=true (alternativa)" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Próximos passos:" -ForegroundColor Yellow
Write-Host "   1. Reinicie o servidor (pare com Ctrl+C e rode novamente)" -ForegroundColor White
Write-Host "   2. Acesse http://localhost:3000" -ForegroundColor White
Write-Host "   3. O sistema deve ir direto para o menu, sem pedir login" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  IMPORTANTE: Se ainda pedir login, limpe o cache do navegador (Ctrl+Shift+Delete)" -ForegroundColor Yellow
Write-Host ""

