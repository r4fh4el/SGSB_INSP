# Script completo para testar banco de dados SQL Server
$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TESTE COMPLETO - BANCO DE DADOS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Obter caminho do script
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$envPath = Join-Path $scriptPath ".env"

# Verificar se .env existe
if (-not (Test-Path $envPath)) {
    Write-Host "ERRO: Arquivo .env não encontrado em: $envPath" -ForegroundColor Red
    Write-Host ""
    Write-Host "Criando arquivo .env a partir do env.example.txt..." -ForegroundColor Yellow
    $examplePath = Join-Path $scriptPath "env.example.txt"
    if (Test-Path $examplePath) {
        Copy-Item $examplePath $envPath
        Write-Host "✓ Arquivo .env criado! Configure as variáveis antes de continuar." -ForegroundColor Green
        exit 1
    } else {
        Write-Host "ERRO: env.example.txt não encontrado!" -ForegroundColor Red
        exit 1
    }
}

# Ler configurações do .env
Write-Host "Lendo configurações do .env..." -ForegroundColor Yellow
$envContent = Get-Content $envPath -Raw

# Extrair configurações
$server = if ($envContent -match "SQLSERVER_SERVER\s*=\s*([^\r\n#]+)") { 
    $matches[1].Trim() 
} else { 
    "" 
}

$port = if ($envContent -match "SQLSERVER_PORT\s*=\s*([^\r\n#]+)") { 
    $matches[1].Trim() 
} else { 
    "" 
}

$database = if ($envContent -match "SQLSERVER_DATABASE\s*=\s*([^\r\n#]+)") { 
    $matches[1].Trim() 
} else { 
    "" 
}

$user = if ($envContent -match "SQLSERVER_USER\s*=\s*([^\r\n#]+)") { 
    $matches[1].Trim() 
} else { 
    "" 
}

$password = if ($envContent -match "SQLSERVER_PASSWORD\s*=\s*([^\r\n#]+)") { 
    $matches[1].Trim() 
} else { 
    "" 
}

$trustedConnection = if ($envContent -match "SQLSERVER_TRUSTED_CONNECTION\s*=\s*([^\r\n#]+)") { 
    $matches[1].Trim().ToLower() -eq "true"
} else { 
    $false
}

$odbcDriver = if ($envContent -match "SQLSERVER_ODBC_DRIVER\s*=\s*([^\r\n#]+)") { 
    $matches[1].Trim() 
} else { 
    "ODBC Driver 17 for SQL Server"
}

# Extrair IP e porta do formato IP,porta
$serverIp = $server
$serverPort = $port
if ($server -match "^([^,]+),([0-9]+)$") {
    $serverIp = $matches[1].Trim()
    $serverPort = $matches[2].Trim()
}

if ([string]::IsNullOrWhiteSpace($serverPort) -and $server -match ",([0-9]+)") {
    $serverPort = $matches[1]
}

if ([string]::IsNullOrWhiteSpace($serverPort)) {
    $serverPort = "1433"  # Porta padrão do SQL Server
}

# Mostrar configurações encontradas
Write-Host "=== Configurações Encontradas ===" -ForegroundColor Cyan
Write-Host "Servidor: $server" -ForegroundColor White
Write-Host "IP: $serverIp" -ForegroundColor White
Write-Host "Porta: $serverPort" -ForegroundColor White
Write-Host "Banco: $database" -ForegroundColor White
Write-Host "Usuário: $user" -ForegroundColor White
Write-Host "Autenticação: $(if ($trustedConnection) { 'Windows' } else { 'SQL Server' })" -ForegroundColor White
Write-Host "ODBC Driver: $odbcDriver" -ForegroundColor White
Write-Host ""

# Verificar se configurações essenciais estão presentes
$errors = @()
if ([string]::IsNullOrWhiteSpace($server)) {
    $errors += "SQLSERVER_SERVER não configurado"
}
if ([string]::IsNullOrWhiteSpace($database)) {
    $errors += "SQLSERVER_DATABASE não configurado"
}
if (-not $trustedConnection -and [string]::IsNullOrWhiteSpace($user)) {
    $errors += "SQLSERVER_USER não configurado (necessário quando TRUSTED_CONNECTION=false)"
}
if (-not $trustedConnection -and [string]::IsNullOrWhiteSpace($password)) {
    $errors += "SQLSERVER_PASSWORD não configurado (necessário quando TRUSTED_CONNECTION=false)"
}

if ($errors.Count -gt 0) {
    Write-Host "ERROS DE CONFIGURAÇÃO:" -ForegroundColor Red
    foreach ($error in $errors) {
        Write-Host "  ✗ $error" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "Configure essas variáveis no arquivo .env antes de continuar." -ForegroundColor Yellow
    exit 1
}

# Teste 1: Conectividade de Rede
Write-Host "=== Teste 1: Conectividade de Rede ===" -ForegroundColor Cyan
Write-Host "Testando ping para $serverIp..." -ForegroundColor Yellow
try {
    $ping = Test-Connection -ComputerName $serverIp -Count 2 -Quiet -ErrorAction Stop
    if ($ping) {
        Write-Host "✓ Servidor responde ao ping" -ForegroundColor Green
    } else {
        Write-Host "⚠ Servidor não responde ao ping (pode ser normal se firewall bloqueia ICMP)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠ Erro ao fazer ping: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "  (Isso pode ser normal se o firewall bloqueia ICMP)" -ForegroundColor Gray
}
Write-Host ""

# Teste 2: Porta TCP
Write-Host "=== Teste 2: Porta TCP ===" -ForegroundColor Cyan
Write-Host "Testando porta $serverPort em $serverIp..." -ForegroundColor Yellow
try {
    $tcpClient = New-Object System.Net.Sockets.TcpClient
    $connect = $tcpClient.BeginConnect($serverIp, [int]$serverPort, $null, $null)
    $wait = $connect.AsyncWaitHandle.WaitOne(5000, $false)
    if ($wait) {
        $tcpClient.EndConnect($connect)
        Write-Host "✓ Porta $serverPort está acessível" -ForegroundColor Green
        $tcpClient.Close()
    } else {
        Write-Host "✗ Porta $serverPort NÃO está acessível (timeout)" -ForegroundColor Red
        Write-Host "  Possíveis causas:" -ForegroundColor Yellow
        Write-Host "    - Firewall bloqueando a porta" -ForegroundColor Gray
        Write-Host "    - SQL Server não está rodando" -ForegroundColor Gray
        Write-Host "    - Porta incorreta" -ForegroundColor Gray
    }
} catch {
    Write-Host "✗ Erro ao conectar na porta $serverPort : $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Teste 3: Driver ODBC
Write-Host "=== Teste 3: Driver ODBC ===" -ForegroundColor Cyan
Write-Host "Verificando drivers ODBC instalados..." -ForegroundColor Yellow
try {
    $odbcDrivers = Get-OdbcDriver | Where-Object { $_.Name -like "*SQL Server*" }
    if ($odbcDrivers) {
        Write-Host "✓ Drivers ODBC encontrados:" -ForegroundColor Green
        $odbcDrivers | ForEach-Object {
            Write-Host "    - $($_.Name)" -ForegroundColor Gray
        }
        
        $foundDriver = $odbcDrivers | Where-Object { $_.Name -eq $odbcDriver }
        if ($foundDriver) {
            Write-Host "✓ Driver '$odbcDriver' está instalado" -ForegroundColor Green
        } else {
            Write-Host "⚠ Driver '$odbcDriver' não encontrado" -ForegroundColor Yellow
            Write-Host "  Use um dos drivers disponíveis acima" -ForegroundColor Gray
        }
    } else {
        Write-Host "✗ Nenhum driver ODBC para SQL Server encontrado" -ForegroundColor Red
        Write-Host "  Instale o ODBC Driver 17 for SQL Server:" -ForegroundColor Yellow
        Write-Host "    https://docs.microsoft.com/en-us/sql/connect/odbc/download-odbc-driver-for-sql-server" -ForegroundColor Gray
    }
} catch {
    Write-Host "⚠ Erro ao verificar drivers ODBC: $($_.Exception.Message)" -ForegroundColor Yellow
}
Write-Host ""

# Teste 4: Conexão com SQL Server (usando Node.js)
Write-Host "=== Teste 4: Conexão com SQL Server ===" -ForegroundColor Cyan
Write-Host "Testando conexão usando Node.js..." -ForegroundColor Yellow

$testScript = @"
require('dotenv').config();
const sql = require('mssql/msnodesqlv8.js');

const serverInput = process.env.SQLSERVER_SERVER || '$server';
const database = process.env.SQLSERVER_DATABASE || '$database';
const user = process.env.SQLSERVER_USER || '$user';
const password = process.env.SQLSERVER_PASSWORD || '$password';
const trustedConnection = (process.env.SQLSERVER_TRUSTED_CONNECTION || 'false') === 'true';
const odbcDriver = process.env.SQLSERVER_ODBC_DRIVER || '$odbcDriver';

// Detectar formato IP,porta
let serverPart = serverInput;
if (serverInput.includes(',') && !serverInput.includes('\\')) {
    serverPart = serverInput;
} else if (serverInput.includes('\\')) {
    const [host, instance] = serverInput.split('\\');
    serverPart = \`\${host}\\SQLEXPRESS\`;
}

const config = {
    connectionString: \`Server=\${serverPart};Database=\${database};Driver={\${odbcDriver}};Encrypt=Yes;TrustServerCertificate=Yes;\${trustedConnection ? 'Trusted_Connection=Yes;' : \`Uid=\${user};Pwd=\${password};\`}\`,
    options: {}
};

console.log('Tentando conectar...');
console.log('Servidor:', serverPart);
console.log('Banco:', database);

const pool = new sql.ConnectionPool(config);

pool.connect()
    .then(() => {
        console.log('✓ CONEXÃO ESTABELECIDA COM SUCESSO!');
        
        // Testar query simples
        return pool.request().query('SELECT @@VERSION AS Version, DB_NAME() AS DatabaseName, USER_NAME() AS UserName');
    })
    .then((result) => {
        console.log('✓ Query de teste executada com sucesso!');
        console.log('Versão SQL Server:', result.recordset[0].Version.split('\n')[0]);
        console.log('Banco conectado:', result.recordset[0].DatabaseName);
        console.log('Usuário:', result.recordset[0].UserName);
        
        // Listar tabelas
        return pool.request().query(\`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_TYPE = 'BASE TABLE'
            ORDER BY TABLE_NAME
        \`);
    })
    .then((result) => {
        console.log('✓ Tabelas encontradas:', result.recordset.length);
        if (result.recordset.length > 0) {
            console.log('Primeiras 10 tabelas:');
            result.recordset.slice(0, 10).forEach(row => {
                console.log('  -', row.TABLE_NAME);
            });
            if (result.recordset.length > 10) {
                console.log('  ... e mais', result.recordset.length - 10, 'tabelas');
            }
        } else {
            console.log('⚠ Nenhuma tabela encontrada no banco de dados');
        }
        
        return pool.close();
    })
    .then(() => {
        console.log('✓ Conexão fechada');
        process.exit(0);
    })
    .catch((error) => {
        console.error('✗ ERRO NA CONEXÃO:');
        console.error('Tipo:', error.name);
        console.error('Mensagem:', error.message);
        
        if (error.code) {
            console.error('Código:', error.code);
        }
        
        if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
            console.error('💡 Timeout: Verifique se o servidor está online e a porta está acessível');
        } else if (error.message.includes('Login failed') || error.message.includes('authentication')) {
            console.error('💡 Autenticação falhou: Verifique usuário e senha');
        } else if (error.message.includes('Cannot open database')) {
            console.error('💡 Banco de dados não encontrado: Verifique se o banco existe');
        } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
            console.error('💡 Servidor não encontrado: Verifique o IP/hostname');
        }
        
        process.exit(1);
    });
"@

$testScriptPath = Join-Path $scriptPath "test-banco-temp.js"
$testScript | Out-File -FilePath $testScriptPath -Encoding UTF8

try {
    Push-Location $scriptPath
    $output = node $testScriptPath 2>&1
    $exitCode = $LASTEXITCODE
    
    Write-Host $output
    
    if ($exitCode -eq 0) {
        Write-Host ""
        Write-Host "✓ TODOS OS TESTES PASSARAM!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "✗ TESTES FALHARAM" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Erro ao executar teste: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "  Certifique-se de que o Node.js está instalado e as dependências estão instaladas (npm install)" -ForegroundColor Yellow
} finally {
    Pop-Location
    if (Test-Path $testScriptPath) {
        Remove-Item $testScriptPath -Force
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RESUMO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Se houver problemas:" -ForegroundColor Yellow
Write-Host "  1. Verifique se o SQL Server está online" -ForegroundColor White
Write-Host "  2. Verifique se a porta $serverPort está aberta no firewall" -ForegroundColor White
Write-Host "  3. Verifique se as credenciais estão corretas" -ForegroundColor White
Write-Host "  4. Verifique se o banco '$database' existe" -ForegroundColor White
Write-Host "  5. Teste a conexão com SQL Server Management Studio" -ForegroundColor White
Write-Host "  6. Verifique os logs do servidor Node.js" -ForegroundColor White
Write-Host ""

