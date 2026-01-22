# Script PowerShell para fazer push do SGSB_INSP para o Git
$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PUSH SGSB_INSP PARA GIT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Verificar se é um repositório Git
if (-not (Test-Path ".git")) {
    Write-Host "✗ Este diretório não é um repositório Git!" -ForegroundColor Red
    Write-Host "  Execute: git init" -ForegroundColor Yellow
    exit 1
}

# Verificar status
Write-Host "Verificando status do Git..." -ForegroundColor Yellow
$status = git status --porcelain

if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host "✓ Nenhuma alteração para commitar" -ForegroundColor Green
    Write-Host ""
    Write-Host "Deseja fazer push mesmo assim? (S/N)" -ForegroundColor Yellow
    $response = Read-Host
    if ($response -ne "S" -and $response -ne "s") {
        exit 0
    }
} else {
    Write-Host "Alterações encontradas:" -ForegroundColor Yellow
    git status --short
    Write-Host ""
}

# Verificar se .env está sendo commitado (aviso)
if ($status -match "\.env$") {
    Write-Host "⚠ AVISO: Arquivo .env detectado!" -ForegroundColor Red
    Write-Host "  Arquivos .env não devem ser commitados!" -ForegroundColor Yellow
    Write-Host "  Deseja continuar mesmo assim? (S/N)" -ForegroundColor Yellow
    $response = Read-Host
    if ($response -ne "S" -and $response -ne "s") {
        Write-Host "Cancelado. Adicione .env ao .gitignore" -ForegroundColor Yellow
        exit 1
    }
}

# Adicionar arquivos
Write-Host ""
Write-Host "Adicionando arquivos..." -ForegroundColor Yellow
git add .
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Arquivos adicionados" -ForegroundColor Green
} else {
    Write-Host "✗ Erro ao adicionar arquivos" -ForegroundColor Red
    exit 1
}

# Fazer commit
Write-Host ""
$commitMessage = Read-Host "Digite a mensagem do commit (ou Enter para usar padrão)"
if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    $commitMessage = "Atualização: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
}

Write-Host "Fazendo commit..." -ForegroundColor Yellow
git commit -m $commitMessage
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Commit realizado: $commitMessage" -ForegroundColor Green
} else {
    Write-Host "✗ Erro ao fazer commit" -ForegroundColor Red
    exit 1
}

# Verificar branch atual
$branch = git branch --show-current
Write-Host ""
Write-Host "Branch atual: $branch" -ForegroundColor Cyan

# Fazer push
Write-Host ""
Write-Host "Enviando para o Git..." -ForegroundColor Yellow
git push origin $branch

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "✓ PUSH REALIZADO COM SUCESSO!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Branch: $branch" -ForegroundColor White
    Write-Host "Mensagem: $commitMessage" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "✗ Erro ao fazer push" -ForegroundColor Red
    Write-Host "  Verifique se o remote está configurado:" -ForegroundColor Yellow
    Write-Host "    git remote -v" -ForegroundColor Gray
    Write-Host "  Ou configure o remote:" -ForegroundColor Yellow
    Write-Host "    git remote add origin <URL_DO_REPOSITORIO>" -ForegroundColor Gray
    exit 1
}



