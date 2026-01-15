# Script para diagnosticar problema com HIDRO_API_URL
$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DIAGNÓSTICO HIDRO_API_URL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$envPath = Join-Path $scriptPath ".env"

# Verificar se .env existe
if (-not (Test-Path $envPath)) {
    Write-Host "✗ Arquivo .env não encontrado em: $envPath" -ForegroundColor Red
    exit 1
}

Write-Host "Lendo arquivo .env..." -ForegroundColor Yellow
$envContent = Get-Content $envPath -Raw

# Extrair HIDRO_API_URL
$hidroApiUrl = ""
if ($envContent -match "HIDRO_API_URL\s*=\s*([^\r\n#]+)") {
    $hidroApiUrl = $matches[1].Trim()
    
    # Remover comentários no final
    if ($hidroApiUrl -match "^([^#]+)") {
        $hidroApiUrl = $matches[1].Trim()
    }
}

Write-Host ""
Write-Host "=== Configuração no .env ===" -ForegroundColor Cyan
if ([string]::IsNullOrWhiteSpace($hidroApiUrl)) {
    Write-Host "✗ HIDRO_API_URL não encontrada ou vazia!" -ForegroundColor Red
} else {
    Write-Host "✓ HIDRO_API_URL encontrada: $hidroApiUrl" -ForegroundColor Green
    
    # Verificar problemas comuns
    if ($hidroApiUrl -match "/swagger") {
        Write-Host "⚠ PROBLEMA: URL contém /swagger" -ForegroundColor Yellow
        Write-Host "  Remova /swagger da URL" -ForegroundColor Gray
        $hidroApiUrl = $hidroApiUrl -replace "/swagger.*$", ""
        Write-Host "  URL corrigida seria: $hidroApiUrl" -ForegroundColor Green
    }
    
    if ($hidroApiUrl -match "0\.0\.0\.0") {
        Write-Host "⚠ PROBLEMA: URL contém 0.0.0.0" -ForegroundColor Yellow
        Write-Host "  Substitua por localhost ou IP real" -ForegroundColor Gray
        $hidroApiUrl = $hidroApiUrl -replace "0\.0\.0\.0", "localhost"
        Write-Host "  URL corrigida seria: $hidroApiUrl" -ForegroundColor Green
    }
    
    if ($hidroApiUrl.EndsWith("/")) {
        Write-Host "⚠ AVISO: URL termina com /" -ForegroundColor Yellow
        Write-Host "  Removendo barra final..." -ForegroundColor Gray
        $hidroApiUrl = $hidroApiUrl.TrimEnd('/')
    }
}

Write-Host ""
Write-Host "=== Teste de Conectividade ===" -ForegroundColor Cyan

if (-not [string]::IsNullOrWhiteSpace($hidroApiUrl)) {
    $testUrl = $hidroApiUrl.TrimEnd('/') + "/swagger"
    Write-Host "Testando: $testUrl" -ForegroundColor Yellow
    
    try {
        $response = Invoke-WebRequest -Uri $testUrl -Method Get -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        Write-Host "✓ API está acessível!" -ForegroundColor Green
        Write-Host "  Status: $($response.StatusCode)" -ForegroundColor Gray
    } catch {
        Write-Host "✗ API NÃO está acessível" -ForegroundColor Red
        Write-Host "  Erro: $($_.Exception.Message)" -ForegroundColor Gray
        
        if ($_.Exception.Response) {
            $statusCode = $_.Exception.Response.StatusCode.value__
            Write-Host "  Status HTTP: $statusCode" -ForegroundColor Gray
        }
    }
} else {
    Write-Host "⚠ Não é possível testar: HIDRO_API_URL não configurada" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Verificando Processos Node.js ===" -ForegroundColor Cyan
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "✓ Processos Node.js encontrados:" -ForegroundColor Green
    $nodeProcesses | ForEach-Object {
        Write-Host "  PID: $($_.Id) - Iniciado: $($_.StartTime)" -ForegroundColor Gray
    }
    Write-Host ""
    Write-Host "⚠ IMPORTANTE: Se você alterou o .env, REINICIE o servidor!" -ForegroundColor Yellow
    Write-Host "  O servidor precisa ser reiniciado para carregar as novas variáveis" -ForegroundColor Gray
} else {
    Write-Host "✗ Nenhum processo Node.js encontrado" -ForegroundColor Red
    Write-Host "  O servidor não está rodando!" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SOLUÇÃO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ([string]::IsNullOrWhiteSpace($hidroApiUrl)) {
    Write-Host "1. Adicione HIDRO_API_URL no arquivo .env:" -ForegroundColor Yellow
    Write-Host "   HIDRO_API_URL=http://72.60.57.220:5204" -ForegroundColor White
} else {
    Write-Host "1. Verifique se a URL está correta no .env:" -ForegroundColor Yellow
    Write-Host "   HIDRO_API_URL=$hidroApiUrl" -ForegroundColor White
    
    if ($hidroApiUrl -match "/swagger") {
        Write-Host ""
        Write-Host "2. REMOVA /swagger da URL:" -ForegroundColor Red
        Write-Host "   De: HIDRO_API_URL=http://72.60.57.220:5204/swagger/" -ForegroundColor Gray
        Write-Host "   Para: HIDRO_API_URL=http://72.60.57.220:5204" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "3. REINICIE o servidor Node.js:" -ForegroundColor Yellow
Write-Host "   # Se estiver usando PM2:" -ForegroundColor Gray
Write-Host "   pm2 restart all" -ForegroundColor White
Write-Host ""
Write-Host "   # Ou pare e inicie novamente:" -ForegroundColor Gray
Write-Host "   npm run build" -ForegroundColor White
Write-Host "   npm start" -ForegroundColor White
Write-Host ""

