# Teste de integracao com SGSB-WEB

$sgsbWebUrl = "http://72.60.57.220:8080"
$endpoint = "/API/BuscarCalculosAutomaticosPorBarragem"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TESTE DE INTEGRACAO SGSB-WEB" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "URL Base: $sgsbWebUrl" -ForegroundColor Yellow
Write-Host "Endpoint: $endpoint" -ForegroundColor Yellow
Write-Host ""

# Testar diferentes barragemIds
$barragemIds = @(1, 2, 3)

foreach ($barragemId in $barragemIds) {
    Write-Host "Testando barragemId=$barragemId..." -ForegroundColor Yellow
    $url = "${sgsbWebUrl}${endpoint}?barragemId=${barragemId}"
    
    try {
        $response = Invoke-WebRequest -Uri $url -TimeoutSec 10 -UseBasicParsing
        Write-Host "  OK Status: $($response.StatusCode)" -ForegroundColor Green
        
        $content = $response.Content | ConvertFrom-Json
        Write-Host "  Resposta recebida:" -ForegroundColor Gray
        
        if ($content.indiceCaracterizacao) {
            Write-Host "    - Indice Caracterizacao: Sim" -ForegroundColor Green
        } else {
            Write-Host "    - Indice Caracterizacao: Nao" -ForegroundColor Yellow
        }
        
        if ($content.tempoConcentracao) {
            Write-Host "    - Tempo Concentracao: Sim" -ForegroundColor Green
        } else {
            Write-Host "    - Tempo Concentracao: Nao" -ForegroundColor Yellow
        }
        
        if ($content.vazaoPico) {
            Write-Host "    - Vazao Pico: Sim" -ForegroundColor Green
        } else {
            Write-Host "    - Vazao Pico: Nao" -ForegroundColor Yellow
        }
        
    } catch {
        Write-Host "  ERRO: $_" -ForegroundColor Red
        if ($_.Exception.Response) {
            $statusCode = $_.Exception.Response.StatusCode.value__
            Write-Host "    Status Code: $statusCode" -ForegroundColor Red
            
            if ($statusCode -eq 404) {
                Write-Host "    Possivel causa: Endpoint nao encontrado ou barragem nao existe" -ForegroundColor Yellow
            } elseif ($statusCode -eq 500) {
                Write-Host "    Possivel causa: Erro no servidor SGSB-WEB" -ForegroundColor Yellow
            }
        }
    }
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CONFIGURACAO ATUAL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
$envContent = Get-Content "E:\SGSB-master\SGSB_INSP\.env" -Raw
if ($envContent -match "VITE_SGSB_FINAL_API_URL=([^\r\n]+)") {
    Write-Host "VITE_SGSB_FINAL_API_URL: $($matches[1])" -ForegroundColor White
} else {
    Write-Host "VITE_SGSB_FINAL_API_URL: NAO CONFIGURADO" -ForegroundColor Red
}

if ($envContent -match "HIDRO_API_URL=([^\r\n]+)") {
    Write-Host "HIDRO_API_URL: $($matches[1])" -ForegroundColor White
} else {
    Write-Host "HIDRO_API_URL: NAO CONFIGURADO" -ForegroundColor Red
}
Write-Host ""
Write-Host "IMPORTANTE: Apos alterar VITE_SGSB_FINAL_API_URL, voce precisa:" -ForegroundColor Yellow
Write-Host "  1. Recompilar o frontend: npm run build" -ForegroundColor White
Write-Host "  2. Reiniciar o servidor: npx --yes pnpm start" -ForegroundColor White
Write-Host ""

