# Script para verificar se o servidor está rodando online
$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  VERIFICAÇÃO SERVIDOR ONLINE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$envPath = Join-Path $scriptPath ".env"

# Ler configurações
if (Test-Path $envPath) {
    $envContent = Get-Content $envPath -Raw
    
    $port = if ($envContent -match "PORT\s*=\s*([^\r\n#]+)") { 
        $matches[1].Trim() 
    } else { 
        "80" 
    }
    
    $host = if ($envContent -match "HOST\s*=\s*([^\r\n#]+)") { 
        $matches[1].Trim() 
    } else { 
        "0.0.0.0" 
    }
    
    $publicIp = if ($envContent -match "PUBLIC_IP\s*=\s*([^\r\n#]+)") { 
        $matches[1].Trim() 
    } else { 
        "72.62.12.84" 
    }
} else {
    $port = "80"
    $host = "0.0.0.0"
    $publicIp = "72.62.12.84"
}

Write-Host "Configurações:" -ForegroundColor Yellow
Write-Host "  Porta: $port" -ForegroundColor White
Write-Host "  Host: $host" -ForegroundColor White
Write-Host "  IP Público: $publicIp" -ForegroundColor White
Write-Host ""

# Verificar processos Node.js
Write-Host "=== Verificando Processos Node.js ===" -ForegroundColor Cyan
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "✓ Processos Node.js encontrados:" -ForegroundColor Green
    $nodeProcesses | ForEach-Object {
        Write-Host "  PID: $($_.Id) - Iniciado: $($_.StartTime)" -ForegroundColor Gray
    }
} else {
    Write-Host "✗ Nenhum processo Node.js encontrado" -ForegroundColor Red
    Write-Host "  O servidor não está rodando!" -ForegroundColor Yellow
}
Write-Host ""

# Verificar portas
Write-Host "=== Verificando Portas ===" -ForegroundColor Cyan

# Porta 80
Write-Host "Porta 80:" -ForegroundColor Yellow
$port80 = netstat -ano | findstr ":80 " | findstr "LISTENING"
if ($port80) {
    Write-Host "  ✓ Porta 80 está em uso" -ForegroundColor Green
    $port80 | ForEach-Object {
        if ($_ -match "LISTENING\s+(\d+)") {
            $pid = $matches[1]
            $proc = Get-Process -Id $pid -ErrorAction SilentlyContinue
            if ($proc) {
                Write-Host "    PID: $pid - Processo: $($proc.ProcessName) - $($proc.Path)" -ForegroundColor Gray
            } else {
                Write-Host "    PID: $pid" -ForegroundColor Gray
            }
        }
    }
} else {
    Write-Host "  ✗ Porta 80 NÃO está em uso" -ForegroundColor Red
    Write-Host "    O servidor não está rodando na porta 80!" -ForegroundColor Yellow
}
Write-Host ""

# Porta 3000
Write-Host "Porta 3000:" -ForegroundColor Yellow
$port3000 = netstat -ano | findstr ":3000 " | findstr "LISTENING"
if ($port3000) {
    Write-Host "  ✓ Porta 3000 está em uso" -ForegroundColor Green
    $port3000 | ForEach-Object {
        if ($_ -match "LISTENING\s+(\d+)") {
            $pid = $matches[1]
            $proc = Get-Process -Id $pid -ErrorAction SilentlyContinue
            if ($proc) {
                Write-Host "    PID: $pid - Processo: $($proc.ProcessName)" -ForegroundColor Gray
            }
        }
    }
} else {
    Write-Host "  ✗ Porta 3000 não está em uso" -ForegroundColor Gray
}
Write-Host ""

# Testar conectividade
Write-Host "=== Testando Conectividade ===" -ForegroundColor Cyan

# Teste localhost:80
Write-Host "Testando localhost:80..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:80/api/health" -Method Get -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
    Write-Host "  ✓ Servidor respondendo em localhost:80" -ForegroundColor Green
    Write-Host "    Status: $($response.StatusCode)" -ForegroundColor Gray
} catch {
    Write-Host "  ✗ Servidor NÃO responde em localhost:80" -ForegroundColor Red
    Write-Host "    Erro: $($_.Exception.Message)" -ForegroundColor Gray
}
Write-Host ""

# Teste IP público:80
Write-Host "Testando $publicIp`:80..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://$publicIp`:80/api/health" -Method Get -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
    Write-Host "  ✓ Servidor respondendo em $publicIp`:80" -ForegroundColor Green
    Write-Host "    Status: $($response.StatusCode)" -ForegroundColor Gray
} catch {
    Write-Host "  ✗ Servidor NÃO responde em $publicIp`:80" -ForegroundColor Red
    Write-Host "    Erro: $($_.Exception.Message)" -ForegroundColor Gray
    Write-Host "    Possíveis causas:" -ForegroundColor Yellow
    Write-Host "      - Servidor não está rodando" -ForegroundColor Gray
    Write-Host "      - Firewall bloqueando" -ForegroundColor Gray
    Write-Host "      - Servidor não está escutando em 0.0.0.0" -ForegroundColor Gray
}
Write-Host ""

# Teste localhost:3000 (caso esteja rodando em outra porta)
Write-Host "Testando localhost:3000..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -Method Get -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
    Write-Host "  ✓ Servidor respondendo em localhost:3000" -ForegroundColor Green
    Write-Host "    Status: $($response.StatusCode)" -ForegroundColor Gray
    Write-Host "    ⚠ Servidor está na porta 3000, mas deveria estar na 80!" -ForegroundColor Yellow
} catch {
    Write-Host "  ✗ Servidor NÃO responde em localhost:3000" -ForegroundColor Gray
}
Write-Host ""

# Resumo e recomendações
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RESUMO E RECOMENDAÇÕES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if (-not $port80) {
    Write-Host "⚠ PROBLEMA: Servidor não está rodando na porta 80" -ForegroundColor Red
    Write-Host ""
    Write-Host "Para iniciar o servidor na porta 80:" -ForegroundColor Yellow
    Write-Host "  1. Certifique-se de que PORT=80 no arquivo .env" -ForegroundColor White
    Write-Host "  2. Certifique-se de que HOST=0.0.0.0 no arquivo .env" -ForegroundColor White
    Write-Host "  3. Execute: npm run dev (ou npm start)" -ForegroundColor White
    Write-Host "  4. Se for Windows, pode precisar executar como Administrador para usar porta 80" -ForegroundColor White
    Write-Host ""
}

if ($nodeProcesses) {
    Write-Host "✓ Processos Node.js encontrados" -ForegroundColor Green
    Write-Host "  Verifique os logs do servidor para ver em qual porta está rodando" -ForegroundColor Gray
} else {
    Write-Host "✗ Nenhum processo Node.js rodando" -ForegroundColor Red
    Write-Host "  Inicie o servidor com: npm run dev" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "URLs de acesso esperadas:" -ForegroundColor Cyan
Write-Host "  Local: http://localhost:80" -ForegroundColor White
Write-Host "  Online: http://$publicIp`:80" -ForegroundColor White
Write-Host ""

