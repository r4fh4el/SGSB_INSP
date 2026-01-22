# Script para executar o script SQL de criação das tabelas do questionário
# Uso: .\executar-script-questionario.ps1

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Executando Script SQL - Questionário" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se o arquivo .env existe
$envPath = Join-Path $PSScriptRoot ".env"
if (-not (Test-Path $envPath)) {
    Write-Host "ERRO: Arquivo .env não encontrado em $envPath" -ForegroundColor Red
    Write-Host "Crie o arquivo .env com as configurações do banco de dados" -ForegroundColor Yellow
    exit 1
}

# Ler variáveis do .env
$envContent = Get-Content $envPath -Raw

# Extrair configurações do banco
$server = if ($envContent -match "SQLSERVER_SERVER\s*=\s*([^\r\n#]+)") { 
    $matches[1].Trim() 
} else { 
    Write-Host "ERRO: SQLSERVER_SERVER não encontrado no .env" -ForegroundColor Red
    exit 1
}

$database = if ($envContent -match "SQLSERVER_DATABASE\s*=\s*([^\r\n#]+)") { 
    $matches[1].Trim() 
} else { 
    Write-Host "ERRO: SQLSERVER_DATABASE não encontrado no .env" -ForegroundColor Red
    exit 1
}

$user = if ($envContent -match "SQLSERVER_USER\s*=\s*([^\r\n#]+)") { 
    $matches[1].Trim() 
} else { 
    $null
}

$password = if ($envContent -match "SQLSERVER_PASSWORD\s*=\s*([^\r\n#]+)") { 
    $matches[1].Trim() 
} else { 
    $null
}

$trustedConnection = if ($envContent -match "SQLSERVER_TRUSTED_CONNECTION\s*=\s*([^\r\n#]+)") { 
    ($matches[1].Trim() -eq "true") 
} else { 
    $true
}

Write-Host "Configurações do banco:" -ForegroundColor Yellow
Write-Host "  Servidor: $server" -ForegroundColor White
Write-Host "  Banco: $database" -ForegroundColor White
Write-Host "  Autenticação: $(if ($trustedConnection) { 'Windows' } else { 'SQL Server' })" -ForegroundColor White
Write-Host ""

# Caminho do script SQL
$scriptPath = Join-Path $PSScriptRoot "criar-tabela-questionario.sql"

if (-not (Test-Path $scriptPath)) {
    Write-Host "ERRO: Script SQL não encontrado: $scriptPath" -ForegroundColor Red
    exit 1
}

# Verificar se sqlcmd está disponível
$sqlcmdPath = Get-Command sqlcmd -ErrorAction SilentlyContinue
if (-not $sqlcmdPath) {
    Write-Host "ERRO: sqlcmd não encontrado no PATH" -ForegroundColor Red
    Write-Host "Instale o SQL Server Command Line Utilities ou use o SQL Server Management Studio" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Alternativa: Execute o script manualmente no SSMS ou Azure Data Studio" -ForegroundColor Yellow
    Write-Host "  Arquivo: $scriptPath" -ForegroundColor White
    exit 1
}

Write-Host "Executando script SQL..." -ForegroundColor Green
Write-Host ""

try {
    if ($trustedConnection -and -not $user) {
        # Autenticação Windows
        $result = & sqlcmd -S $server -d $database -E -i $scriptPath -b
        $exitCode = $LASTEXITCODE
    } else {
        # Autenticação SQL Server
        if (-not $user -or -not $password) {
            Write-Host "ERRO: SQLSERVER_USER e SQLSERVER_PASSWORD são necessários para autenticação SQL Server" -ForegroundColor Red
            exit 1
        }
        $result = & sqlcmd -S $server -d $database -U $user -P $password -i $scriptPath -b
        $exitCode = $LASTEXITCODE
    }
    
    if ($exitCode -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "  Script executado com sucesso!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Tabelas criadas:" -ForegroundColor Yellow
        Write-Host "  - questionarios" -ForegroundColor White
        Write-Host "  - questionarioItens" -ForegroundColor White
        Write-Host "  - questionarioComentariosSecoes" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "ERRO: Script falhou com código de saída $exitCode" -ForegroundColor Red
        Write-Host ""
        Write-Host "Saída:" -ForegroundColor Yellow
        $result | ForEach-Object { Write-Host $_ }
        exit $exitCode
    }
} catch {
    Write-Host ""
    Write-Host "ERRO ao executar script: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Verifique:" -ForegroundColor Yellow
    Write-Host "  1. Conexão com o servidor SQL Server" -ForegroundColor White
    Write-Host "  2. Credenciais de acesso" -ForegroundColor White
    Write-Host "  3. Permissões no banco de dados" -ForegroundColor White
    Write-Host "  4. Se o banco '$database' existe" -ForegroundColor White
    exit 1
}

