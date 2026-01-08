# Script para configurar conexão com SQL Server Online
# Uso: .\configurar-sql-online.ps1

Write-Host "=== Configuração de SQL Server Online ===" -ForegroundColor Cyan
Write-Host ""

# Solicitar informações do SQL Server
$server = Read-Host "Digite o servidor SQL Server (ex: seu-servidor.database.windows.net ou IP,porta)"
$database = Read-Host "Digite o nome do banco de dados (ex: sgsb)"
$autenticacao = Read-Host "Tipo de autenticação (1=SQL Server, 2=Windows/Trusted) [1]"
if ([string]::IsNullOrWhiteSpace($autenticacao)) { $autenticacao = "1" }

$user = ""
$password = ""

if ($autenticacao -eq "1") {
    $user = Read-Host "Usuário SQL Server"
    $password = Read-Host "Senha" -AsSecureString
    $passwordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))
} else {
    $user = Read-Host "Usuário Windows (opcional)"
}

$port = Read-Host "Porta (deixe em branco para padrão 1433)"

# Criar conteúdo do .env
$envContent = @"
# ============================================
# CONFIGURAÇÃO DO BANCO DE DADOS SQL SERVER ONLINE
# ============================================
# Configurado em: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

# SQL Server Online
SQLSERVER_SERVER=$server
SQLSERVER_DATABASE=$database
SQLSERVER_PORT=$port
SQLSERVER_TRUSTED_CONNECTION=$($autenticacao -eq "2")
"@

if ($autenticacao -eq "1" -and $user) {
    $envContent += "`nSQLSERVER_USER=$user"
    $envContent += "`nSQLSERVER_PASSWORD=$passwordPlain"
}

$envContent += @"

# ============================================
# OUTRAS CONFIGURAÇÕES
# ============================================

# Ambiente
NODE_ENV=development

# Servidor
PORT=3000
HOST=localhost

# OAuth (opcional)
# OAUTH_SERVER_URL=https://seu-servidor-oauth.com
# VITE_APP_ID=seu-app-id
# JWT_SECRET=sua-chave-secreta-jwt
# OWNER_OPEN_ID=id-do-proprietario

# Forge API (opcional)
# BUILT_IN_FORGE_API_URL=https://api.forge.com
# BUILT_IN_FORGE_API_KEY=sua-api-key
"@

# Salvar arquivo .env
$envContent | Out-File -FilePath ".env" -Encoding UTF8 -Force

Write-Host ""
Write-Host "✓ Arquivo .env criado/atualizado com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "Configuração:" -ForegroundColor Yellow
Write-Host "  Servidor: $server"
Write-Host "  Banco: $database"
Write-Host "  Autenticação: $(if ($autenticacao -eq "1") { "SQL Server" } else { "Windows/Trusted" })"
if ($port) {
    Write-Host "  Porta: $port"
}
Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor Cyan
Write-Host "  1. Execute o script SQL: sqlserver\caracterizacao_barragem.sql"
Write-Host "  2. Execute: pnpm install (se necessário)"
Write-Host "  3. Execute: pnpm dev"
Write-Host ""




