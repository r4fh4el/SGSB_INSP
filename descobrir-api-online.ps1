# Script para descobrir a API do SGSB_INSP online
$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DESCOBRINDO API DO SGSB_INSP ONLINE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$ip = "72.62.12.84"
$portas = @(3000, 80, 5173)

Write-Host "Testando IP: $ip" -ForegroundColor Yellow
Write-Host "Portas a testar: $($portas -join ', ')" -ForegroundColor Yellow
Write-Host ""

$apiEncontrada = $false

foreach ($porta in $portas) {
    Write-Host "Testando porta $porta..." -ForegroundColor Gray
    
    # Testar Health Check
    try {
        $url = "http://${ip}:${porta}/api/health"
        $response = Invoke-WebRequest -Uri $url -Method GET -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        
        if ($response.StatusCode -eq 200) {
            Write-Host ""
            Write-Host "✓ API ENCONTRADA!" -ForegroundColor Green
            Write-Host "========================================" -ForegroundColor Green
            Write-Host "  Porta: $porta" -ForegroundColor White
            Write-Host "  IP: $ip" -ForegroundColor White
            Write-Host ""
            Write-Host "URLs disponíveis:" -ForegroundColor Yellow
            Write-Host "  🌐 Frontend:    http://${ip}:${porta}" -ForegroundColor White
            Write-Host "  🔌 API tRPC:    http://${ip}:${porta}/api/trpc" -ForegroundColor White
            Write-Host "  ❤️  Health:      http://${ip}:${porta}/api/health" -ForegroundColor White
            Write-Host ""
            
            # Tentar obter resposta do health
            try {
                $health = Invoke-RestMethod -Uri $url -Method GET -TimeoutSec 5
                Write-Host "Status da API:" -ForegroundColor Yellow
                Write-Host "  Status: $($health.status)" -ForegroundColor White
                if ($health.timestamp) {
                    Write-Host "  Timestamp: $($health.timestamp)" -ForegroundColor White
                }
            } catch {
                Write-Host "  (Não foi possível obter detalhes)" -ForegroundColor Gray
            }
            
            Write-Host ""
            Write-Host "Endpoints tRPC disponíveis:" -ForegroundColor Yellow
            Write-Host "  - barragens.list" -ForegroundColor Gray
            Write-Host "  - questionarios.list" -ForegroundColor Gray
            Write-Host "  - instrumentos.list" -ForegroundColor Gray
            Write-Host "  - checklists.list" -ForegroundColor Gray
            Write-Host "  - E muitos outros..." -ForegroundColor Gray
            Write-Host ""
            Write-Host "========================================" -ForegroundColor Green
            
            $apiEncontrada = $true
            break
        }
    } catch {
        # Porta não respondeu, continuar
        Write-Host "  ✗ Porta $porta não respondeu" -ForegroundColor DarkGray
    }
}

if (-not $apiEncontrada) {
    Write-Host ""
    Write-Host "✗ API não encontrada nas portas testadas" -ForegroundColor Red
    Write-Host ""
    Write-Host "Verifique:" -ForegroundColor Yellow
    Write-Host "  1. Se o servidor está rodando" -ForegroundColor White
    Write-Host "  2. Se o firewall permite conexões" -ForegroundColor White
    Write-Host "  3. Se o IP está correto: $ip" -ForegroundColor White
    Write-Host "  4. Execute no servidor: pm2 status" -ForegroundColor White
}

Write-Host ""

