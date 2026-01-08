# Script para configurar conexão SQL Server online
# Uso: .\configurar-sql-online.ps1

$ErrorActionPreference = "Stop"

Write-Host "=== Configuração SQL Server Online ===" -ForegroundColor Cyan
Write-Host ""

# Verificar se está no diretório correto
if (-not (Test-Path "package.json")) {
    Write-Host "Erro: Execute este script dentro do diretório SGSB_INSP_SQL!" -ForegroundColor Red
    exit 1
}

Write-Host "Este script configurará o arquivo .env para conexão com SQL Server online" -ForegroundColor Yellow
Write-Host ""

# Solicitar informações
$server = Read-Host "Servidor SQL Server (ex: servidor.dominio.com ou IP)"
$database = Read-Host "Nome do banco de dados [sgsb]"
if ([string]::IsNullOrWhiteSpace($database)) { $database = "sgsb" }

$authType = Read-Host "Tipo de autenticação: (W)indows ou (S)QL Server [W]"
if ([string]::IsNullOrWhiteSpace($authType)) { $authType = "W" }

$user = ""
$password = ""

if ($authType -eq "S" -or $authType -eq "s") {
    $user = Read-Host "Usuário SQL Server"
    $password = Read-Host "Senha" -AsSecureString
    $password = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
    )
}

# Criar conteúdo do .env
$envContent = @"
# SQL Server Configuration
SQLSERVER_SERVER=$server
SQLSERVER_DATABASE=$database
"@

if ($authType -eq "S" -or $authType -eq "s") {
    $envContent += @"

SQLSERVER_USER=$user
SQLSERVER_PASSWORD=$password
SQLSERVER_TRUSTED_CONNECTION=false
"@
} else {
    $envContent += @"

SQLSERVER_TRUSTED_CONNECTION=true
"@
}

$envContent += @"

SQLSERVER_ODBC_DRIVER=ODBC Driver 17 for SQL Server

# OAuth (se necessário)
OAUTH_SERVER_URL=
VITE_APP_ID=
JWT_SECRET=
OWNER_OPEN_ID=

# Forge API (se necessário)
BUILT_IN_FORGE_API_URL=
BUILT_IN_FORGE_API_KEY=
"@

# Salvar arquivo .env
$envContent | Out-File -FilePath ".env" -Encoding UTF8 -NoNewline

Write-Host ""
Write-Host "✅ Arquivo .env criado com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "Configuração:" -ForegroundColor Cyan
Write-Host "  Servidor: $server" -ForegroundColor White
Write-Host "  Banco: $database" -ForegroundColor White
Write-Host "  Autenticação: $(if ($authType -eq 'S' -or $authType -eq 's') { 'SQL Server' } else { 'Windows' })" -ForegroundColor White
Write-Host ""
Write-Host "Agora você pode rodar: .\iniciar-sistema.ps1" -ForegroundColor Yellow




