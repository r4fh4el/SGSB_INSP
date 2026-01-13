# Script de Diagnostico de Acesso ao SGSB_INSP

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DIAGNOSTICO DE ACESSO - SGSB_INSP" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar se o servidor esta rodando
Write-Host "1. Verificando se o servidor esta rodando..." -ForegroundColor Yellow
$nodeProcesses = Get-Process | Where-Object {$_.ProcessName -eq "node"}
if ($nodeProcesses) {
    Write-Host "   OK Servidor Node.js esta rodando" -ForegroundColor Green
    $nodeProcesses | ForEach-Object {
        Write-Host "      - PID: $($_.Id) | Iniciado: $($_.StartTime)" -ForegroundColor Gray
    }
} else {
    Write-Host "   ERRO Servidor Node.js NAO esta rodando" -ForegroundColor Red
    Write-Host "   Execute: cd SGSB_INSP; npx --yes pnpm start" -ForegroundColor Yellow
    exit 1
}

# 2. Verificar health check
Write-Host ""
Write-Host "2. Testando health check..." -ForegroundColor Yellow
try {
    $health = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -TimeoutSec 3 -UseBasicParsing
    Write-Host "   OK Health check: $($health.StatusCode)" -ForegroundColor Green
    Write-Host "   Resposta: $($health.Content)" -ForegroundColor Gray
} catch {
    Write-Host "   ERRO Health check FALHOU: $_" -ForegroundColor Red
    exit 1
}

# 3. Verificar se a pagina principal carrega
Write-Host ""
Write-Host "3. Testando carregamento da pagina principal..." -ForegroundColor Yellow
try {
    $page = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5 -UseBasicParsing
    Write-Host "   OK Pagina carregada: $($page.StatusCode)" -ForegroundColor Green
    Write-Host "   Tamanho: $($page.Content.Length) bytes" -ForegroundColor Gray
    
    # Verificar se e HTML
    if ($page.Content -match "<!doctype html>") {
        Write-Host "   OK HTML valido detectado" -ForegroundColor Green
    } else {
        Write-Host "   AVISO HTML pode estar incompleto" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ERRO Erro ao carregar pagina: $_" -ForegroundColor Red
    exit 1
}

# 4. Verificar se os arquivos JavaScript carregam
Write-Host ""
Write-Host "4. Verificando arquivos JavaScript..." -ForegroundColor Yellow
$jsFiles = @(
    "/assets/index-CajcmY3t.js",
    "/assets/index-CUpN61Z3.js",
    "/assets/index-BymrzjJu.css"
)

foreach ($file in $jsFiles) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000$file" -TimeoutSec 5 -UseBasicParsing
        Write-Host "   OK $file - $($response.StatusCode) ($($response.Content.Length) bytes)" -ForegroundColor Green
    } catch {
        Write-Host "   ERRO $file - ERRO: $_" -ForegroundColor Red
    }
}

# 5. Verificar configuracoes do .env
Write-Host ""
Write-Host "5. Verificando configuracoes do .env..." -ForegroundColor Yellow
$envPath = "E:\SGSB-master\SGSB_INSP\.env"
if (Test-Path $envPath) {
    $envContent = Get-Content $envPath -Raw
    
    # Verificar HOST
    if ($envContent -match "HOST=0\.0\.0\.0") {
        Write-Host "   OK HOST=0.0.0.0 (aceita conexoes de qualquer IP)" -ForegroundColor Green
    } elseif ($envContent -match "HOST=localhost") {
        Write-Host "   AVISO HOST=localhost (aceita apenas conexoes locais)" -ForegroundColor Yellow
    } else {
        Write-Host "   AVISO HOST nao configurado (usando padrao)" -ForegroundColor Yellow
    }
    
    # Verificar PORT
    if ($envContent -match "PORT=(\d+)") {
        $port = $matches[1]
        Write-Host "   OK PORT=$port" -ForegroundColor Green
    } else {
        Write-Host "   AVISO PORT nao configurado (usando padrao)" -ForegroundColor Yellow
    }
    
    # Verificar SKIP_AUTH
    if ($envContent -match "SKIP_AUTH=true") {
        Write-Host "   OK SKIP_AUTH=true (autenticacao desabilitada)" -ForegroundColor Green
    } else {
        Write-Host "   AVISO SKIP_AUTH nao esta como true" -ForegroundColor Yellow
    }
    
    # Verificar NODE_ENV
    if ($envContent -match "NODE_ENV=production") {
        Write-Host "   OK NODE_ENV=production (modo producao)" -ForegroundColor Green
    } elseif ($envContent -match "NODE_ENV=development") {
        Write-Host "   AVISO NODE_ENV=development (modo desenvolvimento)" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ERRO Arquivo .env nao encontrado!" -ForegroundColor Red
}

# 6. Verificar build
Write-Host ""
Write-Host "6. Verificando build..." -ForegroundColor Yellow
$buildFiles = @(
    "E:\SGSB-master\SGSB_INSP\dist\index.js",
    "E:\SGSB-master\SGSB_INSP\dist\public\index.html",
    "E:\SGSB-master\SGSB_INSP\dist\public\assets\index-CajcmY3t.js"
)

foreach ($file in $buildFiles) {
    if (Test-Path $file) {
        $size = (Get-Item $file).Length
        Write-Host "   OK $(Split-Path $file -Leaf) - $size bytes" -ForegroundColor Green
    } else {
        Write-Host "   ERRO $(Split-Path $file -Leaf) - NAO ENCONTRADO" -ForegroundColor Red
    }
}

# 7. Informacoes de acesso
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  INFORMACOES DE ACESSO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "URLs para acessar o sistema:" -ForegroundColor Yellow
Write-Host "   Local:    http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Se voce nao consegue acessar:" -ForegroundColor Yellow
Write-Host "   1. Verifique se esta usando a URL correta" -ForegroundColor White
Write-Host "   2. Abra o console do navegador (F12) e veja se ha erros" -ForegroundColor White
Write-Host "   3. Limpe o cache do navegador (Ctrl+Shift+Delete)" -ForegroundColor White
Write-Host "   4. Tente em modo anonimo/privado" -ForegroundColor White
Write-Host "   5. Verifique o firewall do Windows" -ForegroundColor White
Write-Host ""
