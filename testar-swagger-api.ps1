# Script para testar o Swagger da API HIDRO
$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Teste do Swagger - API HIDRO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Carregar variáveis do .env
$envPath = Join-Path $PSScriptRoot ".env"
if (Test-Path $envPath) {
    $envContent = Get-Content $envPath -Raw
    if ($envContent -match "HIDRO_API_URL\s*=\s*([^\r\n]+)") {
        $apiUrl = $matches[1].Trim()
        # Remover comentários
        if ($apiUrl -match "^([^#]+)") {
            $apiUrl = $matches[1].Trim()
        }
        # Substituir 0.0.0.0 por localhost
        if ($apiUrl -match "0\.0\.0\.0") {
            $apiUrl = $apiUrl -replace "0\.0\.0\.0", "localhost"
            Write-Host "⚠️  URL contém 0.0.0.0, usando: $apiUrl" -ForegroundColor Yellow
        }
    } else {
        Write-Host "⚠️  HIDRO_API_URL não encontrada no .env" -ForegroundColor Yellow
        $apiUrl = Read-Host "Digite a URL da API (ex: http://localhost:5204)"
    }
} else {
    Write-Host "⚠️  Arquivo .env não encontrado" -ForegroundColor Yellow
    $apiUrl = Read-Host "Digite a URL da API (ex: http://localhost:5204)"
}

if ([string]::IsNullOrWhiteSpace($apiUrl)) {
    $apiUrl = "http://localhost:5204"
    Write-Host "Usando URL padrão: $apiUrl" -ForegroundColor Gray
}

Write-Host ""
Write-Host "URL da API: $apiUrl" -ForegroundColor White
Write-Host ""

# URLs para testar
$swaggerUrl = "$apiUrl/swagger"
$swaggerJsonUrl = "$apiUrl/swagger/v1/swagger.json"
$calculosUrl = "$apiUrl/API/BuscarCalculosAutomaticosPorBarragem?barragemId=1"
$healthUrl = "$apiUrl/api/health"

# Teste 1: Swagger UI
Write-Host "=== Teste 1: Swagger UI ===" -ForegroundColor Cyan
Write-Host "URL: $swaggerUrl" -ForegroundColor Gray
try {
    $response = Invoke-WebRequest -Uri $swaggerUrl -Method Get -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ Swagger UI está acessível!" -ForegroundColor Green
        Write-Host "  Status: $($response.StatusCode)" -ForegroundColor Gray
        Write-Host "  Abra no navegador: $swaggerUrl" -ForegroundColor Yellow
    }
} catch {
    Write-Host "✗ Erro ao acessar Swagger UI" -ForegroundColor Red
    Write-Host "  Erro: $($_.Exception.Message)" -ForegroundColor Gray
    if ($_.Exception.Response) {
        Write-Host "  Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Gray
    }
}
Write-Host ""

# Teste 2: Swagger JSON
Write-Host "=== Teste 2: Swagger JSON (Definição da API) ===" -ForegroundColor Cyan
Write-Host "URL: $swaggerJsonUrl" -ForegroundColor Gray
try {
    $response = Invoke-RestMethod -Uri $swaggerJsonUrl -Method Get -TimeoutSec 10 -ErrorAction Stop
    Write-Host "✓ Swagger JSON carregado com sucesso!" -ForegroundColor Green
    Write-Host "  Título: $($response.info.title)" -ForegroundColor Gray
    Write-Host "  Versão: $($response.info.version)" -ForegroundColor Gray
    Write-Host "  Endpoints encontrados: $($response.paths.PSObject.Properties.Count)" -ForegroundColor Gray
    
    Write-Host ""
    Write-Host "  Principais endpoints:" -ForegroundColor Yellow
    $endpointCount = 0
    foreach ($path in $response.paths.PSObject.Properties) {
        if ($endpointCount -lt 10) {
            $methods = $path.Value.PSObject.Properties.Name -join ", "
            Write-Host "    $($path.Name) [$methods]" -ForegroundColor Gray
            $endpointCount++
        }
    }
    if ($response.paths.PSObject.Properties.Count -gt 10) {
        Write-Host "    ... e mais $($response.paths.PSObject.Properties.Count - 10) endpoints" -ForegroundColor Gray
    }
} catch {
    Write-Host "✗ Erro ao carregar Swagger JSON" -ForegroundColor Red
    Write-Host "  Erro: $($_.Exception.Message)" -ForegroundColor Gray
}
Write-Host ""

# Teste 3: Endpoint de Cálculos
Write-Host "=== Teste 3: Endpoint de Cálculos ===" -ForegroundColor Cyan
Write-Host "URL: $calculosUrl" -ForegroundColor Gray
try {
    $response = Invoke-RestMethod -Uri $calculosUrl -Method Get -TimeoutSec 10 -ErrorAction Stop
    Write-Host "✓ Endpoint de cálculos está funcionando!" -ForegroundColor Green
    if ($response -is [Array]) {
        Write-Host "  Retornou $($response.Count) itens" -ForegroundColor Gray
    } elseif ($response -is [PSCustomObject]) {
        Write-Host "  Retornou objeto com propriedades: $($response.PSObject.Properties.Name -join ', ')" -ForegroundColor Gray
    }
} catch {
    Write-Host "✗ Erro ao acessar endpoint de cálculos" -ForegroundColor Red
    Write-Host "  Erro: $($_.Exception.Message)" -ForegroundColor Gray
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "  Status: $statusCode" -ForegroundColor Gray
        
        # Tentar ler o corpo da resposta de erro
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "  Resposta: $responseBody" -ForegroundColor Gray
        } catch {
            # Ignorar se não conseguir ler
        }
    }
}
Write-Host ""

# Teste 4: Health Check (se existir)
Write-Host "=== Teste 4: Health Check ===" -ForegroundColor Cyan
Write-Host "URL: $healthUrl" -ForegroundColor Gray
try {
    $response = Invoke-RestMethod -Uri $healthUrl -Method Get -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✓ Health check OK!" -ForegroundColor Green
    Write-Host "  Resposta: $($response | ConvertTo-Json -Compress)" -ForegroundColor Gray
} catch {
    Write-Host "⚠ Health check não disponível (normal se não estiver implementado)" -ForegroundColor Yellow
}
Write-Host ""

# Resumo
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Resumo" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "URL Base: $apiUrl" -ForegroundColor White
Write-Host "Swagger UI: $swaggerUrl" -ForegroundColor Yellow
Write-Host ""
Write-Host "Para abrir o Swagger no navegador:" -ForegroundColor Cyan
Write-Host "  Start-Process '$swaggerUrl'" -ForegroundColor Gray
Write-Host ""
Write-Host "Ou copie e cole no navegador:" -ForegroundColor Cyan
Write-Host "  $swaggerUrl" -ForegroundColor White
Write-Host ""



