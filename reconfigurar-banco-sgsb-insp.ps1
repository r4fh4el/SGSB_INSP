# ============================================================================
# SCRIPT PARA RECONFIGURAR BANCO DE DADOS SGSB_INSP
# Cria banco sgsb_insp, tabelas e insere dados de teste
# ============================================================================

param(
    [string]$SqlServer = "108.181.193.92,15000",
    [string]$SqlUser = "sa",
    [string]$SqlPassword = "SenhaNova@123"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RECONFIGURAÇÃO DO BANCO SGSB_INSP" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se sqlcmd está disponível
try {
    $sqlcmdVersion = sqlcmd -? 2>&1 | Select-String "Version"
    Write-Host "✓ SQLCMD encontrado" -ForegroundColor Green
} catch {
    Write-Host "✗ Erro: SQLCMD não encontrado. Instale o SQL Server Command Line Utilities." -ForegroundColor Red
    exit 1
}

# Caminhos dos scripts
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$scriptCriarBanco = Join-Path $scriptDir "sqlserver\criar-banco-sgsb-insp.sql"
$scriptSeed = Join-Path $scriptDir "sqlserver\seed-dados-teste.sql"

# Verificar se os scripts existem
if (-not (Test-Path $scriptCriarBanco)) {
    Write-Host "✗ Erro: Script não encontrado: $scriptCriarBanco" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $scriptSeed)) {
    Write-Host "✗ Erro: Script não encontrado: $scriptSeed" -ForegroundColor Red
    exit 1
}

Write-Host "Passo 1/3: Criando banco de dados e tabelas..." -ForegroundColor Yellow
Write-Host ""

try {
    $result1 = sqlcmd -S $SqlServer -U $SqlUser -P $SqlPassword -i $scriptCriarBanco -b
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Banco de dados e tabelas criados com sucesso!" -ForegroundColor Green
    } else {
        Write-Host "✗ Erro ao criar banco de dados" -ForegroundColor Red
        Write-Host $result1
        exit 1
    }
} catch {
    Write-Host "✗ Erro ao executar script de criação:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    exit 1
}

Write-Host ""
Write-Host "Passo 2/3: Inserindo dados de teste..." -ForegroundColor Yellow
Write-Host ""

try {
    $result2 = sqlcmd -S $SqlServer -U $SqlUser -P $SqlPassword -i $scriptSeed -b
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Dados de teste inseridos com sucesso!" -ForegroundColor Green
    } else {
        Write-Host "⚠ Aviso: Alguns dados podem não ter sido inseridos (podem já existir)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠ Aviso: Erro ao inserir dados de teste (podem já existir):" -ForegroundColor Yellow
    Write-Host $_.Exception.Message
}

Write-Host ""
Write-Host "Passo 3/3: Atualizando configuração do sistema..." -ForegroundColor Yellow
Write-Host ""

# Atualizar arquivo .env
$envFile = Join-Path $scriptDir ".env"
$envExample = Join-Path $scriptDir "env.example.txt"

if (-not (Test-Path $envFile)) {
    if (Test-Path $envExample) {
        Copy-Item $envExample $envFile
        Write-Host "✓ Arquivo .env criado a partir do exemplo" -ForegroundColor Green
    } else {
        Write-Host "⚠ Arquivo .env não encontrado. Crie manualmente." -ForegroundColor Yellow
    }
}

# Atualizar DATABASE no .env se existir
if (Test-Path $envFile) {
    $envContent = Get-Content $envFile -Raw
    
    # Atualizar SQLSERVER_DATABASE
    if ($envContent -match "SQLSERVER_DATABASE=") {
        $envContent = $envContent -replace "SQLSERVER_DATABASE=.+", "SQLSERVER_DATABASE=sgsb_insp"
        Set-Content $envFile $envContent
        Write-Host "✓ Arquivo .env atualizado: SQLSERVER_DATABASE=sgsb_insp" -ForegroundColor Green
    } else {
        # Adicionar se não existir
        Add-Content $envFile "`nSQLSERVER_DATABASE=sgsb_insp"
        Write-Host "✓ SQLSERVER_DATABASE=sgsb_insp adicionado ao .env" -ForegroundColor Green
    }
    
    # Garantir que outras configurações estão presentes
    if ($envContent -notmatch "SQLSERVER_SERVER=") {
        Add-Content $envFile "SQLSERVER_SERVER=$SqlServer"
    }
    if ($envContent -notmatch "SQLSERVER_USER=") {
        Add-Content $envFile "SQLSERVER_USER=$SqlUser"
    }
    if ($envContent -notmatch "SQLSERVER_PASSWORD=") {
        Add-Content $envFile "SQLSERVER_PASSWORD=$SqlPassword"
    }
    if ($envContent -notmatch "SQLSERVER_TRUSTED_CONNECTION=") {
        Add-Content $envFile "SQLSERVER_TRUSTED_CONNECTION=false"
    }
    if ($envContent -notmatch "SQLSERVER_ODBC_DRIVER=") {
        Add-Content $envFile "SQLSERVER_ODBC_DRIVER=ODBC Driver 17 for SQL Server"
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RECONFIGURAÇÃO CONCLUÍDA!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor Yellow
Write-Host "1. Verifique o arquivo .env na pasta SGSB/"
Write-Host "2. Teste a conexão com: pnpm dev"
Write-Host "3. Acesse o sistema e verifique os dados cadastrados"
Write-Host ""
Write-Host "Banco de dados: sgsb_insp" -ForegroundColor Cyan
Write-Host "Servidor: $SqlServer" -ForegroundColor Cyan
Write-Host ""




