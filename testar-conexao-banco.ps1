# Script para testar conexao com SQL Server

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TESTE DE CONEXAO SQL SERVER" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Ler configuracoes do .env
$envPath = "E:\SGSB-master\SGSB_INSP\.env"
if (-not (Test-Path $envPath)) {
    Write-Host "ERRO: Arquivo .env nao encontrado!" -ForegroundColor Red
    exit 1
}

$envContent = Get-Content $envPath -Raw

# Extrair configuracoes
$server = if ($envContent -match "SQLSERVER_SERVER=([^\r\n]+)") { $matches[1] } else { "" }
$port = if ($envContent -match "SQLSERVER_PORT=([^\r\n]+)") { $matches[1] } else { "" }
$database = if ($envContent -match "SQLSERVER_DATABASE=([^\r\n]+)") { $matches[1] } else { "" }
$user = if ($envContent -match "SQLSERVER_USER=([^\r\n]+)") { $matches[1] } else { "" }
$password = if ($envContent -match "SQLSERVER_PASSWORD=([^\r\n]+)") { $matches[1] } else { "" }
$driver = if ($envContent -match "SQLSERVER_DRIVER=([^\r\n]+)") { $matches[1] } else { "msnodesqlv8" }
$odbcDriver = if ($envContent -match "SQLSERVER_ODBC_DRIVER=([^\r\n]+)") { $matches[1] } else { "ODBC Driver 17 for SQL Server" }

Write-Host "Configuracoes encontradas:" -ForegroundColor Yellow
Write-Host "  Servidor: $server" -ForegroundColor White
Write-Host "  Porta: $port" -ForegroundColor White
Write-Host "  Banco: $database" -ForegroundColor White
Write-Host "  Usuario: $user" -ForegroundColor White
Write-Host "  Driver: $driver" -ForegroundColor White
Write-Host "  ODBC Driver: $odbcDriver" -ForegroundColor White
Write-Host ""

# Testar conectividade de rede
Write-Host "1. Testando conectividade de rede..." -ForegroundColor Yellow
if ($server -match "^([^,]+)") {
    $ip = $matches[1]
    Write-Host "   Testando ping para $ip..." -ForegroundColor Gray
    $ping = Test-Connection -ComputerName $ip -Count 2 -Quiet
    if ($ping) {
        Write-Host "   OK Servidor responde ao ping" -ForegroundColor Green
    } else {
        Write-Host "   ERRO Servidor nao responde ao ping" -ForegroundColor Red
        Write-Host "   AVISO: Isso pode ser normal se o firewall bloqueia ICMP" -ForegroundColor Yellow
    }
} else {
    Write-Host "   AVISO: Nao foi possivel extrair IP do servidor" -ForegroundColor Yellow
}

# Testar porta
Write-Host ""
Write-Host "2. Testando porta $port..." -ForegroundColor Yellow
if ($server -match "^([^,]+)") {
    $ip = $matches[1]
    try {
        $tcpClient = New-Object System.Net.Sockets.TcpClient
        $connect = $tcpClient.BeginConnect($ip, $port, $null, $null)
        $wait = $connect.AsyncWaitHandle.WaitOne(3000, $false)
        if ($wait) {
            $tcpClient.EndConnect($connect)
            Write-Host "   OK Porta $port esta acessivel" -ForegroundColor Green
            $tcpClient.Close()
        } else {
            Write-Host "   ERRO Porta $port nao esta acessivel (timeout)" -ForegroundColor Red
        }
    } catch {
        Write-Host "   ERRO Nao foi possivel conectar na porta $port : $_" -ForegroundColor Red
    }
}

# Verificar se o driver ODBC esta instalado
Write-Host ""
Write-Host "3. Verificando driver ODBC..." -ForegroundColor Yellow
$odbcDrivers = Get-OdbcDriver | Where-Object { $_.Name -like "*SQL Server*" }
if ($odbcDrivers) {
    Write-Host "   OK Drivers ODBC encontrados:" -ForegroundColor Green
    $odbcDrivers | ForEach-Object {
        Write-Host "      - $($_.Name)" -ForegroundColor Gray
    }
    
    $foundDriver = $odbcDrivers | Where-Object { $_.Name -eq $odbcDriver }
    if ($foundDriver) {
        Write-Host "   OK Driver '$odbcDriver' esta instalado" -ForegroundColor Green
    } else {
        Write-Host "   AVISO Driver '$odbcDriver' nao encontrado" -ForegroundColor Yellow
        Write-Host "   Drivers disponiveis:" -ForegroundColor Yellow
        $odbcDrivers | ForEach-Object {
            Write-Host "      - $($_.Name)" -ForegroundColor Gray
        }
    }
} else {
    Write-Host "   ERRO Nenhum driver ODBC para SQL Server encontrado" -ForegroundColor Red
    Write-Host "   Instale o ODBC Driver 17 for SQL Server" -ForegroundColor Yellow
}

# Verificar logs do servidor
Write-Host ""
Write-Host "4. Verificando logs do servidor..." -ForegroundColor Yellow
$nodeProcesses = Get-Process | Where-Object {$_.ProcessName -eq "node"}
if ($nodeProcesses) {
    Write-Host "   OK Servidor esta rodando" -ForegroundColor Green
    Write-Host "   AVISO: Verifique o terminal onde o servidor esta rodando para ver erros de conexao" -ForegroundColor Yellow
    Write-Host "   Procure por mensagens como:" -ForegroundColor Gray
    Write-Host "      - [SQL Server] Failed to connect" -ForegroundColor Gray
    Write-Host "      - [SQL Server] Connection pool error" -ForegroundColor Gray
} else {
    Write-Host "   AVISO Servidor nao esta rodando" -ForegroundColor Yellow
}

# Resumo
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RESUMO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Se houver problemas de conexao:" -ForegroundColor Yellow
Write-Host "   1. Verifique se o servidor SQL esta online" -ForegroundColor White
Write-Host "   2. Verifique se a porta $port esta aberta no firewall" -ForegroundColor White
Write-Host "   3. Verifique se as credenciais estao corretas" -ForegroundColor White
Write-Host "   4. Verifique se o banco de dados '$database' existe" -ForegroundColor White
Write-Host "   5. Verifique os logs do servidor Node.js" -ForegroundColor White
Write-Host "   6. Teste a conexao com SQL Server Management Studio" -ForegroundColor White
Write-Host ""

