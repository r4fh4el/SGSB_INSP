# Script para rodar o sistema offline com SQL Server online
# Banco: SGSB (INSP)
# Uso: .\rodar-offline-online-db.ps1

$ErrorActionPreference = "Stop"

Write-Host "=== Rodando SGSB Offline com SQL Server Online ===" -ForegroundColor Cyan
Write-Host "Banco de dados: SGSB (INSP)" -ForegroundColor Yellow
Write-Host ""

# Verificar se está no diretório correto
if (-not (Test-Path "package.json")) {
    Write-Host "Erro: Execute este script dentro do diretório SGSB!" -ForegroundColor Red
    exit 1
}

# Matar processos Node.js antigos
Write-Host "Encerrando processos Node.js antigos..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -eq "node"} | ForEach-Object {
    try {
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
        Write-Host "  Processo $($_.Id) encerrado" -ForegroundColor Gray
    } catch {}
}
Start-Sleep -Seconds 2

# Verificar se .env existe
if (-not (Test-Path ".env")) {
    Write-Host "⚠ Arquivo .env não encontrado!" -ForegroundColor Yellow
    Write-Host "Criando .env com configuração padrão..." -ForegroundColor Yellow
    Write-Host ""
    
    # Criar .env básico
    $envContent = @"
# Configuração SQL Server Online - Banco SGSB (INSP)
SQLSERVER_SERVER=108.181.193.92,15000
SQLSERVER_DATABASE=sgsb
SQLSERVER_USER=sa
SQLSERVER_PASSWORD=SenhaNova@123
SQLSERVER_TRUSTED_CONNECTION=false
SQLSERVER_ODBC_DRIVER=ODBC Driver 17 for SQL Server

# Ambiente
NODE_ENV=development
"@
    
    $envContent | Out-File -FilePath ".env" -Encoding UTF8 -NoNewline
    Write-Host "✅ Arquivo .env criado!" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠ IMPORTANTE: Verifique se as credenciais estão corretas!" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host "✅ Arquivo .env encontrado" -ForegroundColor Green
    
    # Verificar configuração do banco
    $envContent = Get-Content ".env" -Raw
    if ($envContent -match "SQLSERVER_DATABASE=(.+)") {
        $dbName = $matches[1].Trim()
        Write-Host "  Banco configurado: $dbName" -ForegroundColor Gray
        if ($dbName -ne "sgsb") {
            Write-Host "  ⚠ Atenção: Banco configurado como '$dbName', mas deveria ser 'sgsb' (INSP)" -ForegroundColor Yellow
        }
    }
    Write-Host ""
}

# Verificar se node_modules existe
if (-not (Test-Path "node_modules")) {
    Write-Host "Instalando dependências..." -ForegroundColor Yellow
    pnpm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Erro ao instalar dependências!" -ForegroundColor Red
        exit 1
    }
    Write-Host ""
}

# Mostrar configuração atual
Write-Host "=== Configuração Atual ===" -ForegroundColor Cyan
$envContent = Get-Content ".env" -Raw
if ($envContent -match "SQLSERVER_SERVER=(.+)") {
    $server = $matches[1].Trim()
    Write-Host "  Servidor: $server" -ForegroundColor White
}
if ($envContent -match "SQLSERVER_DATABASE=(.+)") {
    $database = $matches[1].Trim()
    Write-Host "  Banco: $database" -ForegroundColor White
}
Write-Host ""

# Verificar se tabela existe (opcional)
Write-Host "⚠ Lembrete: Certifique-se de que a tabela 'caracterizacaoBarragem' existe no banco SGSB" -ForegroundColor Yellow
Write-Host ""

# Rodar em modo desenvolvimento
Write-Host "=== Iniciando Sistema ===" -ForegroundColor Green
Write-Host ""
Write-Host "📌 Sistema rodando OFFLINE (localhost)" -ForegroundColor Cyan
Write-Host "📌 Conectado ao SQL Server ONLINE" -ForegroundColor Cyan
Write-Host "📌 Banco: SGSB (INSP)" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 Acesse o sistema em:" -ForegroundColor Yellow
Write-Host "   http://localhost (se porta 80)" -ForegroundColor White
Write-Host "   ou http://localhost:3000 (se porta 3000)" -ForegroundColor White
Write-Host ""
Write-Host "Pressione Ctrl+C para parar" -ForegroundColor Yellow
Write-Host ""
Write-Host "─" * 50 -ForegroundColor Gray
Write-Host ""

# Iniciar o sistema
pnpm dev




