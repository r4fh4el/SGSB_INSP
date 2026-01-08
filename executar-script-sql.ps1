# Script para executar o script SQL no banco de dados
# Uso: .\executar-script-sql.ps1

$ErrorActionPreference = "Stop"

Write-Host "=== Executando Script SQL no Banco de Dados ===" -ForegroundColor Cyan
Write-Host ""

# Ler configurações do .env
$envFile = Get-Content ".env" -Raw
$server = ""
$database = ""
$user = ""
$password = ""

if ($envFile -match "SQLSERVER_SERVER=([^\r\n]+)") {
    $server = $matches[1].Trim()
}
if ($envFile -match "SQLSERVER_DATABASE=([^\r\n]+)") {
    $database = $matches[1].Trim()
}
if ($envFile -match "SQLSERVER_USER=([^\r\n]+)") {
    $user = $matches[1].Trim()
}
if ($envFile -match "SQLSERVER_PASSWORD=([^\r\n]+)") {
    $password = $matches[1].Trim()
}

if (-not $server -or -not $database) {
    Write-Host "Erro: Configurações do SQL Server não encontradas no .env" -ForegroundColor Red
    exit 1
}

Write-Host "Configuração:" -ForegroundColor Yellow
Write-Host "  Servidor: $server"
Write-Host "  Banco: $database"
Write-Host ""

# Verificar se sqlcmd está disponível
$sqlcmdPath = Get-Command sqlcmd -ErrorAction SilentlyContinue

if ($sqlcmdPath) {
    Write-Host "Executando script SQL via sqlcmd..." -ForegroundColor Green
    
    $scriptPath = "sqlserver\caracterizacao_barragem.sql"
    if (-not (Test-Path $scriptPath)) {
        Write-Host "Erro: Script não encontrado em $scriptPath" -ForegroundColor Red
        exit 1
    }
    
    if ($user -and $password) {
        $command = "sqlcmd -S `"$server`" -d `"$database`" -U `"$user`" -P `"$password`" -i `"$scriptPath`""
    } else {
        $command = "sqlcmd -S `"$server`" -d `"$database`" -E -i `"$scriptPath`""
    }
    
    Write-Host "Executando: $command" -ForegroundColor Gray
    Invoke-Expression $command
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✓ Script executado com sucesso!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "⚠ Erro ao executar script. Verifique as credenciais e conexão." -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠ sqlcmd não encontrado no sistema." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Opções:" -ForegroundColor Cyan
    Write-Host "  1. Instalar SQL Server Command Line Utilities" -ForegroundColor White
    Write-Host "  2. Executar manualmente no SQL Server Management Studio:" -ForegroundColor White
    Write-Host "     - Abra SSMS" -ForegroundColor Gray
    Write-Host "     - Conecte ao servidor: $server" -ForegroundColor Gray
    Write-Host "     - Abra o arquivo: sqlserver\caracterizacao_barragem.sql" -ForegroundColor Gray
    Write-Host "     - Execute o script" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  3. Ou copie e cole o conteudo do script no Azure Data Studio" -ForegroundColor White
}

