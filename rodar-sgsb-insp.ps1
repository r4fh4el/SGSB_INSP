# Script completo para rodar o SGSB_INSP
# Uso: .\rodar-sgsb-insp.ps1

$ErrorActionPreference = "Stop"

Write-Host "=== Diagnóstico e Execução SGSB_INSP ===" -ForegroundColor Cyan
Write-Host ""

# Verificar se está no diretório correto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Erro: Execute este script dentro do diretório SGSB_INSP!" -ForegroundColor Red
    Write-Host "   Diretório atual: $(Get-Location)" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Diretório correto: $(Get-Location)" -ForegroundColor Green
Write-Host ""

# ============================================
# 1. Verificar Node.js
# ============================================
Write-Host "📦 Verificando Node.js..." -ForegroundColor Yellow
if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVersion = node --version
    Write-Host "   ✅ Node.js instalado: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "   ❌ Node.js não encontrado!" -ForegroundColor Red
    Write-Host "   Instale Node.js de: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# ============================================
# 2. Verificar/Instalar pnpm
# ============================================
Write-Host ""
Write-Host "📦 Verificando pnpm..." -ForegroundColor Yellow
$pnpmCmd = $null

# Tentar encontrar pnpm no PATH
if (Get-Command pnpm -ErrorAction SilentlyContinue) {
    $pnpmCmd = "pnpm"
    $pnpmVersion = pnpm --version
    Write-Host "   ✅ pnpm instalado: $pnpmVersion" -ForegroundColor Green
} else {
    # Tentar via npx
    Write-Host "   ⚠️  pnpm não encontrado no PATH. Tentando via npx..." -ForegroundColor Yellow
    try {
        $npxVersion = npx --yes pnpm --version 2>&1
        if ($LASTEXITCODE -eq 0 -or $npxVersion -match "^\d+\.\d+") {
            $pnpmCmd = "npx --yes pnpm"
            Write-Host "   ✅ pnpm disponível via npx: $npxVersion" -ForegroundColor Green
        } else {
            throw "pnpm não encontrado"
        }
    } catch {
        Write-Host "   ⚠️  Instalando pnpm globalmente..." -ForegroundColor Yellow
        try {
            npm install -g pnpm
            if ($LASTEXITCODE -eq 0) {
                $pnpmCmd = "pnpm"
                Write-Host "   ✅ pnpm instalado com sucesso!" -ForegroundColor Green
            } else {
                Write-Host "   ❌ Erro ao instalar pnpm. Usando npx como fallback..." -ForegroundColor Yellow
                $pnpmCmd = "npx --yes pnpm"
            }
        } catch {
            Write-Host "   ⚠️  Usando npx como fallback..." -ForegroundColor Yellow
            $pnpmCmd = "npx --yes pnpm"
        }
    }
}

# Definir função para executar pnpm
function Invoke-Pnpm {
    param([string]$Arguments)
    Invoke-Expression "$pnpmCmd $Arguments"
}

# ============================================
# 3. Verificar arquivo .env
# ============================================
Write-Host ""
Write-Host "⚙️  Verificando arquivo .env..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "   ✅ Arquivo .env encontrado" -ForegroundColor Green
    
    # Verificar se tem configurações essenciais
    $envContent = Get-Content ".env" -Raw
    $hasServer = $envContent -match "SQLSERVER_SERVER"
    $hasDatabase = $envContent -match "SQLSERVER_DATABASE"
    
    if (-not $hasServer -or -not $hasDatabase) {
        Write-Host "   ⚠️  Arquivo .env pode estar incompleto" -ForegroundColor Yellow
        Write-Host "   Verifique se tem SQLSERVER_SERVER e SQLSERVER_DATABASE configurados" -ForegroundColor Yellow
    } else {
        Write-Host "   ✅ Configurações básicas encontradas" -ForegroundColor Green
    }
} else {
    Write-Host "   ⚠️  Arquivo .env não encontrado!" -ForegroundColor Yellow
    if (Test-Path "env.example.txt") {
        Write-Host "   📝 Criando .env a partir de env.example.txt..." -ForegroundColor Yellow
        Copy-Item "env.example.txt" ".env"
        Write-Host "   ✅ Arquivo .env criado. CONFIGURE AS VARIÁVEIS ANTES DE CONTINUAR!" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "   Execute: .\configurar-sql-online.ps1 para configurar" -ForegroundColor Cyan
        exit 1
    } else {
        Write-Host "   ❌ env.example.txt também não encontrado!" -ForegroundColor Red
        exit 1
    }
}

# ============================================
# 4. Verificar/Instalar dependências
# ============================================
Write-Host ""
Write-Host "📦 Verificando dependências..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "   ⚠️  node_modules não encontrado. Instalando dependências..." -ForegroundColor Yellow
    Write-Host "   Isso pode levar alguns minutos..." -ForegroundColor Gray
    Invoke-Pnpm "install"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   ❌ Erro ao instalar dependências!" -ForegroundColor Red
        exit 1
    }
    Write-Host "   ✅ Dependências instaladas!" -ForegroundColor Green
} else {
    Write-Host "   ✅ node_modules encontrado" -ForegroundColor Green
    
    # Verificar se precisa atualizar
    $packageJson = Get-Content "package.json" | ConvertFrom-Json
    $packageLockExists = Test-Path "pnpm-lock.yaml"
    
    if (-not $packageLockExists) {
        Write-Host "   ⚠️  pnpm-lock.yaml não encontrado. Reinstalando dependências..." -ForegroundColor Yellow
        Invoke-Pnpm "install"
    }
}

# ============================================
# 5. Verificar se precisa compilar (produção)
# ============================================
Write-Host ""
Write-Host "🔨 Verificando build..." -ForegroundColor Yellow
$envContent = Get-Content ".env" -Raw
$isProduction = $envContent -match "NODE_ENV=production"

if ($isProduction -and -not (Test-Path "dist/index.js")) {
    Write-Host "   ⚠️  Modo produção detectado mas dist/index.js não encontrado" -ForegroundColor Yellow
    Write-Host "   Compilando projeto..." -ForegroundColor Yellow
    Invoke-Pnpm "build"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   ❌ Erro ao compilar projeto!" -ForegroundColor Red
        exit 1
    }
    Write-Host "   ✅ Projeto compilado!" -ForegroundColor Green
} else {
    Write-Host "   ✅ Build verificado" -ForegroundColor Green
}

# ============================================
# 6. Matar processos antigos (opcional)
# ============================================
Write-Host ""
Write-Host "🛑 Verificando processos Node.js antigos..." -ForegroundColor Yellow
$nodeProcesses = Get-Process | Where-Object {$_.ProcessName -eq "node"} | Where-Object {
    $_.Path -like "*SGSB_INSP*" -or $_.CommandLine -like "*SGSB_INSP*"
}
if ($nodeProcesses) {
    Write-Host "   ⚠️  Encontrados processos Node.js relacionados. Encerrando..." -ForegroundColor Yellow
    $nodeProcesses | ForEach-Object {
        try {
            Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
            Write-Host "   Processo $($_.Id) encerrado" -ForegroundColor Gray
        } catch {}
    }
    Start-Sleep -Seconds 2
} else {
    Write-Host "   ✅ Nenhum processo antigo encontrado" -ForegroundColor Green
}

# ============================================
# 7. Iniciar o sistema
# ============================================
Write-Host ""
Write-Host "🚀 Iniciando SGSB_INSP..." -ForegroundColor Green
Write-Host ""

# Determinar modo de execução
if ($isProduction) {
    Write-Host "   Modo: PRODUÇÃO" -ForegroundColor Cyan
    Write-Host "   Comando: pnpm start" -ForegroundColor Gray
    Write-Host ""
    Write-Host "🌐 URLs de acesso:" -ForegroundColor Yellow
    $port = if ($envContent -match "PORT=(\d+)") { $matches[1] } else { "80" }
    $hostValue = if ($envContent -match "HOST=([^\r\n]+)") { $matches[1].Trim() } else { "localhost" }
    Write-Host "   http://$hostValue`:$port" -ForegroundColor White
    Write-Host ""
    Write-Host "Pressione Ctrl+C para parar" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "─" * 60 -ForegroundColor Gray
    Write-Host ""
    
    Invoke-Pnpm "start"
} else {
    Write-Host "   Modo: DESENVOLVIMENTO" -ForegroundColor Cyan
    Write-Host "   Comando: pnpm dev" -ForegroundColor Gray
    Write-Host ""
    Write-Host "🌐 URLs de acesso:" -ForegroundColor Yellow
    Write-Host "   Frontend: http://localhost:5173" -ForegroundColor White
    Write-Host "   Backend: http://localhost:3000" -ForegroundColor White
    Write-Host ""
    Write-Host "Pressione Ctrl+C para parar" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "─" * 60 -ForegroundColor Gray
    Write-Host ""
    
    Invoke-Pnpm "dev"
}

