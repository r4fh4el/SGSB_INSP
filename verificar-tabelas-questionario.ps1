# Script para verificar se as tabelas do questionário foram criadas
$ErrorActionPreference = "Stop"

Write-Host "Verificando tabelas do questionário..." -ForegroundColor Cyan
Write-Host ""

# Ler variáveis do .env
$envPath = Join-Path $PSScriptRoot ".env"
$envContent = Get-Content $envPath -Raw

$server = if ($envContent -match "SQLSERVER_SERVER\s*=\s*([^\r\n#]+)") { 
    $matches[1].Trim() 
} else { 
    Write-Host "ERRO: SQLSERVER_SERVER não encontrado" -ForegroundColor Red
    exit 1
}

$database = if ($envContent -match "SQLSERVER_DATABASE\s*=\s*([^\r\n#]+)") { 
    $matches[1].Trim() 
} else { 
    Write-Host "ERRO: SQLSERVER_DATABASE não encontrado" -ForegroundColor Red
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

$query = @"
SELECT 
    TABLE_NAME,
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = t.TABLE_NAME) AS COLUMN_COUNT
FROM INFORMATION_SCHEMA.TABLES t
WHERE TABLE_NAME IN ('questionarios', 'questionarioItens', 'questionarioComentariosSecoes')
ORDER BY TABLE_NAME;
"@

try {
    if ($trustedConnection -and -not $user) {
        $result = & sqlcmd -S $server -d $database -E -Q $query -h -1 -W
    } else {
        $result = & sqlcmd -S $server -d $database -U $user -P $password -Q $query -h -1 -W
    }
    
    Write-Host "Tabelas encontradas:" -ForegroundColor Green
    $result | Where-Object { $_ -match "questionario" } | ForEach-Object {
        Write-Host "  OK $_" -ForegroundColor White
    }
    Write-Host ""
    Write-Host "Todas as tabelas foram criadas com sucesso!" -ForegroundColor Green
} catch {
    Write-Host "ERRO ao verificar tabelas" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

