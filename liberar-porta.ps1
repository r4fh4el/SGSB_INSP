# Script para liberar a porta 3000 (ou outra porta)
# Uso: .\liberar-porta.ps1 [porta]

param(
    [int]$Porta = 3000
)

Write-Host "=== Liberando Porta $Porta ===" -ForegroundColor Cyan
Write-Host ""

# Encontrar processos usando a porta
Write-Host "🔍 Procurando processos na porta $Porta..." -ForegroundColor Yellow

$connections = netstat -ano | Select-String ":$Porta"
$pids = @()

if ($connections) {
    foreach ($line in $connections) {
        if ($line -match '\s+(\d+)\s*$') {
            $pid = $matches[1]
            if ($pid -notin $pids) {
                $pids += $pid
            }
        }
    }
    
    if ($pids.Count -gt 0) {
        Write-Host "   ⚠️  Encontrados processos usando a porta $Porta:" -ForegroundColor Yellow
        foreach ($pid in $pids) {
            $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
            if ($process) {
                Write-Host "   - PID: $pid | Nome: $($process.ProcessName) | Caminho: $($process.Path)" -ForegroundColor Gray
            } else {
                Write-Host "   - PID: $pid (processo não encontrado)" -ForegroundColor Gray
            }
        }
        
        Write-Host ""
        $confirm = Read-Host "Deseja encerrar esses processos? (S/N)"
        if ($confirm -eq "S" -or $confirm -eq "s") {
            foreach ($pid in $pids) {
                try {
                    $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
                    if ($process) {
                        Write-Host "   Encerrando processo $pid ($($process.ProcessName))..." -ForegroundColor Yellow
                        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                        Write-Host "   ✅ Processo $pid encerrado" -ForegroundColor Green
                    }
                } catch {
                    Write-Host "   ⚠️  Não foi possível encerrar processo $pid: $_" -ForegroundColor Yellow
                }
            }
            Start-Sleep -Seconds 2
            Write-Host ""
            Write-Host "✅ Porta $Porta liberada!" -ForegroundColor Green
        } else {
            Write-Host "   Operação cancelada." -ForegroundColor Yellow
            Write-Host ""
            Write-Host "💡 Alternativa: Mude a porta no arquivo .env:" -ForegroundColor Cyan
            Write-Host "   PORT=3001" -ForegroundColor White
        }
    } else {
        Write-Host "   ✅ Nenhum processo encontrado na porta $Porta" -ForegroundColor Green
    }
} else {
    Write-Host "   ✅ Porta $Porta está livre" -ForegroundColor Green
}

Write-Host ""



