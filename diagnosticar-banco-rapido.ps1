# Diagnostico rapido do banco de dados

Write-Host "Diagnostico Rapido - SQL Server" -ForegroundColor Cyan
Write-Host ""

# Verificar configuracoes
$envContent = Get-Content "E:\SGSB-master\SGSB_INSP\.env" -Raw

$server = if ($envContent -match "SQLSERVER_SERVER=([^\r\n]+)") { $matches[1] } else { "" }
$port = if ($envContent -match "SQLSERVER_PORT=([^\r\n]+)") { $matches[1] } else { "" }
$database = if ($envContent -match "SQLSERVER_DATABASE=([^\r\n]+)") { $matches[1] } else { "" }

Write-Host "Configuracao atual:" -ForegroundColor Yellow
Write-Host "  Servidor: $server" -ForegroundColor White
Write-Host "  Porta: $port" -ForegroundColor White
Write-Host "  Banco: $database" -ForegroundColor White
Write-Host ""

# Testar porta rapidamente
Write-Host "Testando porta $port..." -ForegroundColor Yellow
$ip = if ($server -match "^([^,]+)") { $matches[1] } else { $server }

try {
    $tcpClient = New-Object System.Net.Sockets.TcpClient
    $connect = $tcpClient.BeginConnect($ip, $port, $null, $null)
    $wait = $connect.AsyncWaitHandle.WaitOne(2000, $false)
    if ($wait) {
        $tcpClient.EndConnect($connect)
        Write-Host "  OK Porta acessivel" -ForegroundColor Green
        $tcpClient.Close()
    } else {
        Write-Host "  ERRO Porta nao acessivel (timeout)" -ForegroundColor Red
        Write-Host ""
        Write-Host "POSSIVEIS SOLUCOES:" -ForegroundColor Yellow
        Write-Host "  1. Verifique se o servidor SQL esta online" -ForegroundColor White
        Write-Host "  2. Verifique se a porta $port esta aberta no firewall" -ForegroundColor White
        Write-Host "  3. Verifique se o IP $ip esta correto" -ForegroundColor White
        Write-Host "  4. Teste a conexao com SQL Server Management Studio" -ForegroundColor White
    }
} catch {
    Write-Host "  ERRO: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "Verificando logs do servidor..." -ForegroundColor Yellow
$nodeProcesses = Get-Process | Where-Object {$_.ProcessName -eq "node"}
if ($nodeProcesses) {
    Write-Host "  Servidor esta rodando" -ForegroundColor Green
    Write-Host "  Verifique o terminal do servidor para ver erros de conexao" -ForegroundColor Yellow
} else {
    Write-Host "  Servidor nao esta rodando" -ForegroundColor Red
}

