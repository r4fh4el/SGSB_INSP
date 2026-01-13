# Script rápido para rodar SGSB_INSP (com tratamento de porta ocupada)
# Uso: .\rodar-agora.ps1

$ErrorActionPreference = "Stop"

Write-Host "=== Rodando SGSB_INSP ===" -ForegroundColor Cyan
Write-Host ""

# Verificar se está no diretório correto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Erro: Execute este script dentro do diretório SGSB_INSP!" -ForegroundColor Red
    exit 1
}

# Verificar porta 3000
Write-Host "🔍 Verificando porta 3000..." -ForegroundColor Yellow
$portInUse = netstat -ano | findstr ":3000" | findstr "LISTENING"
if ($portInUse) {
    Write-Host "   ⚠️  Porta 3000 está em uso!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   Opções:" -ForegroundColor Cyan
    Write-Host "   1. Liberar porta 3000 (recomendado)" -ForegroundColor White
    Write-Host "   2. Usar outra porta (mudar no .env)" -ForegroundColor White
    Write-Host ""
    $opcao = Read-Host "Escolha (1 ou 2)"
    
    if ($opcao -eq "1") {
        Write-Host ""
        Write-Host "🛑 Encerrando processos Node.js na porta 3000..." -ForegroundColor Yellow
        $pids = @()
        netstat -ano | findstr ":3000" | ForEach-Object {
            if ($_ -match '\s+(\d+)\s*$') {
                $pid = $matches[1]
                if ($pid -notin $pids) {
                    $pids += $pid
                }
            }
        }
        
        foreach ($pid in $pids) {
            try {
                $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
                if ($process -and $process.ProcessName -eq "node") {
                    Write-Host "   Encerrando processo $pid..." -ForegroundColor Gray
                    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                }
            } catch {}
        }
        Start-Sleep -Seconds 2
        Write-Host "   ✅ Processos encerrados" -ForegroundColor Green
    } elseif ($opcao -eq "2") {
        Write-Host ""
        Write-Host "📝 Editando .env para usar porta 3001..." -ForegroundColor Yellow
        if (Test-Path ".env") {
            $envContent = Get-Content ".env" -Raw
            if ($envContent -match "PORT=\d+") {
                $envContent = $envContent -replace "PORT=\d+", "PORT=3001"
            } else {
                $envContent += "`nPORT=3001"
            }
            $envContent | Out-File -FilePath ".env" -Encoding UTF8 -Force
            Write-Host "   ✅ Porta alterada para 3001" -ForegroundColor Green
            Write-Host "   🌐 Sistema estará disponível em: http://localhost:3001" -ForegroundColor Cyan
        }
    }
}

Write-Host ""
Write-Host "🚀 Iniciando sistema..." -ForegroundColor Green
Write-Host ""

# Verificar se precisa compilar (produção)
$envContent = Get-Content ".env" -Raw -ErrorAction SilentlyContinue
$isProduction = $envContent -match "NODE_ENV=production"

if ($isProduction) {
    if (-not (Test-Path "dist/index.js")) {
        Write-Host "🔨 Compilando projeto..." -ForegroundColor Yellow
        npx --yes pnpm build
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Erro ao compilar!" -ForegroundColor Red
            exit 1
        }
    }
    Write-Host "▶️  Iniciando em modo PRODUÇÃO..." -ForegroundColor Cyan
    npx --yes pnpm start
} else {
    Write-Host "▶️  Iniciando em modo DESENVOLVIMENTO..." -ForegroundColor Cyan
    npx --yes pnpm dev
}

