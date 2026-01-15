# Script para verificar e corrigir HIDRO_API_URL
$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Verificação HIDRO_API_URL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$envPath = Join-Path $PSScriptRoot ".env"

# Verificar se o arquivo .env existe
if (-not (Test-Path $envPath)) {
    Write-Host "ERRO: Arquivo .env não encontrado em: $envPath" -ForegroundColor Red
    Write-Host ""
    Write-Host "Criando arquivo .env a partir do env.example.txt..." -ForegroundColor Yellow
    
    $examplePath = Join-Path $PSScriptRoot "env.example.txt"
    if (Test-Path $examplePath) {
        Copy-Item $examplePath $envPath
        Write-Host "✓ Arquivo .env criado!" -ForegroundColor Green
    } else {
        Write-Host "ERRO: env.example.txt não encontrado!" -ForegroundColor Red
        exit 1
    }
}

# Ler o conteúdo do .env
Write-Host "Lendo arquivo .env..." -ForegroundColor Yellow
$envContent = Get-Content $envPath -Raw -ErrorAction SilentlyContinue

if (-not $envContent) {
    Write-Host "ERRO: Não foi possível ler o arquivo .env" -ForegroundColor Red
    exit 1
}

# Verificar se HIDRO_API_URL existe
Write-Host ""
Write-Host "=== Verificação HIDRO_API_URL ===" -ForegroundColor Cyan

$hasHidroApiUrl = $envContent -match "HIDRO_API_URL\s*="
$hidroApiUrlValue = ""

if ($hasHidroApiUrl) {
    if ($envContent -match "HIDRO_API_URL\s*=\s*([^\r\n]+)") {
        $hidroApiUrlValue = $matches[1].Trim()
        
        # Remover comentários no final da linha
        if ($hidroApiUrlValue -match "^([^#]+)") {
            $hidroApiUrlValue = $matches[1].Trim()
        }
        
        Write-Host "✓ HIDRO_API_URL encontrada: $hidroApiUrlValue" -ForegroundColor Green
        
        # Verificar se está vazia ou comentada
        if ([string]::IsNullOrWhiteSpace($hidroApiUrlValue) -or $hidroApiUrlValue -eq "" -or $hidroApiUrlValue.StartsWith("#")) {
            Write-Host "⚠ HIDRO_API_URL está vazia ou comentada!" -ForegroundColor Yellow
            $hasHidroApiUrl = $false
        }
    }
} else {
    Write-Host "✗ HIDRO_API_URL não encontrada no arquivo .env" -ForegroundColor Red
}

# Se não existe ou está vazia, perguntar ao usuário
if (-not $hasHidroApiUrl -or [string]::IsNullOrWhiteSpace($hidroApiUrlValue)) {
    Write-Host ""
    Write-Host "=== Configuração Necessária ===" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "A variável HIDRO_API_URL precisa ser configurada." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Opções:" -ForegroundColor Cyan
    Write-Host "  1. Local (localhost): http://localhost:5204" -ForegroundColor Gray
    Write-Host "  2. Servidor remoto: http://SEU_IP:5204" -ForegroundColor Gray
    Write-Host "  3. Servidor específico: http://72.60.57.220:5204" -ForegroundColor Gray
    Write-Host ""
    
    $input = Read-Host "Digite a URL da API HIDRO (ou pressione Enter para usar http://localhost:5204)"
    
    if ([string]::IsNullOrWhiteSpace($input)) {
        $hidroApiUrlValue = "http://localhost:5204"
    } else {
        $hidroApiUrlValue = $input.Trim()
    }
    
    # Adicionar ou atualizar HIDRO_API_URL no .env
    Write-Host ""
    Write-Host "Atualizando arquivo .env..." -ForegroundColor Yellow
    
    # Se já existe, substituir
    if ($envContent -match "HIDRO_API_URL\s*=.*") {
        $envContent = $envContent -replace "HIDRO_API_URL\s*=.*", "HIDRO_API_URL=$hidroApiUrlValue"
    } else {
        # Adicionar no final da seção de integração
        if ($envContent -match "# Integração com SGSB-HIDRO") {
            $envContent = $envContent -replace "(# Integração com SGSB-HIDRO[^\r\n]*)", "`$1`r`nHIDRO_API_URL=$hidroApiUrlValue"
        } else {
            # Adicionar no final do arquivo
            $envContent = $envContent.TrimEnd() + "`r`n`r`n# Integração com SGSB-HIDRO`r`nHIDRO_API_URL=$hidroApiUrlValue`r`n"
        }
    }
    
    # Salvar o arquivo
    Set-Content -Path $envPath -Value $envContent -NoNewline
    Write-Host "✓ Arquivo .env atualizado!" -ForegroundColor Green
}

# Verificar se a API está acessível
Write-Host ""
Write-Host "=== Teste de Conectividade ===" -ForegroundColor Cyan

try {
    $testUrl = $hidroApiUrlValue.TrimEnd('/') + "/swagger"
    Write-Host "Testando conexão com: $testUrl" -ForegroundColor Yellow
    
    $response = Invoke-WebRequest -Uri $testUrl -Method Get -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ API está acessível e respondendo!" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠ Não foi possível conectar à API em: $hidroApiUrlValue" -ForegroundColor Yellow
    Write-Host "  Certifique-se de que a WebAPI está rodando." -ForegroundColor Gray
    Write-Host "  Erro: $($_.Exception.Message)" -ForegroundColor Gray
}

# Resumo
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Resumo" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "HIDRO_API_URL: $hidroApiUrlValue" -ForegroundColor White
Write-Host ""
Write-Host "IMPORTANTE:" -ForegroundColor Yellow
Write-Host "  Após alterar o .env, você precisa REINICIAR o servidor Node.js!" -ForegroundColor Yellow
Write-Host ""
Write-Host "Para reiniciar:" -ForegroundColor Cyan
Write-Host "  1. Pare o servidor atual (Ctrl+C)" -ForegroundColor Gray
Write-Host "  2. Execute novamente: npm run dev (ou o comando que você usa)" -ForegroundColor Gray
Write-Host ""

