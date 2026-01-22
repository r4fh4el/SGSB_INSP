# Script para diagnosticar página em branco
# Uso: .\diagnosticar-pagina-branca.ps1

$ErrorActionPreference = "Stop"

Write-Host "=== Diagnóstico: Página em Branco ===" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar build
Write-Host "1️⃣ Verificando build..." -ForegroundColor Yellow
if (Test-Path "dist\public\index.html") {
    Write-Host "   ✅ dist/public/index.html existe" -ForegroundColor Green
    $indexSize = (Get-Item "dist\public\index.html").Length
    Write-Host "   📏 Tamanho: $indexSize bytes" -ForegroundColor Gray
} else {
    Write-Host "   ❌ dist/public/index.html NÃO existe!" -ForegroundColor Red
    Write-Host "   💡 Solução: Execute 'npx --yes pnpm build'" -ForegroundColor Yellow
}

# 2. Verificar arquivos JavaScript
Write-Host ""
Write-Host "2️⃣ Verificando arquivos JavaScript..." -ForegroundColor Yellow
$jsFiles = Get-ChildItem "dist\public" -Filter "*.js" -Recurse -ErrorAction SilentlyContinue
if ($jsFiles) {
    Write-Host "   ✅ Encontrados $($jsFiles.Count) arquivos JavaScript" -ForegroundColor Green
    $jsFiles | Select-Object -First 5 | ForEach-Object {
        Write-Host "      - $($_.Name) ($([math]::Round($_.Length/1KB, 2)) KB)" -ForegroundColor Gray
    }
} else {
    Write-Host "   ❌ Nenhum arquivo JavaScript encontrado!" -ForegroundColor Red
    Write-Host "   💡 Solução: Execute 'npx --yes pnpm build'" -ForegroundColor Yellow
}

# 3. Verificar arquivos CSS
Write-Host ""
Write-Host "3️⃣ Verificando arquivos CSS..." -ForegroundColor Yellow
$cssFiles = Get-ChildItem "dist\public" -Filter "*.css" -Recurse -ErrorAction SilentlyContinue
if ($cssFiles) {
    Write-Host "   ✅ Encontrados $($cssFiles.Count) arquivos CSS" -ForegroundColor Green
    $cssFiles | Select-Object -First 5 | ForEach-Object {
        Write-Host "      - $($_.Name) ($([math]::Round($_.Length/1KB, 2)) KB)" -ForegroundColor Gray
    }
} else {
    Write-Host "   ⚠️  Nenhum arquivo CSS encontrado (pode ser normal se estiver inline)" -ForegroundColor Yellow
}

# 4. Verificar estrutura dist/public
Write-Host ""
Write-Host "4️⃣ Estrutura do diretório dist/public:" -ForegroundColor Yellow
if (Test-Path "dist\public") {
    Get-ChildItem "dist\public" -Recurse -Depth 2 | Select-Object FullName | ForEach-Object {
        $relativePath = $_.FullName.Replace((Get-Location).Path + "\", "")
        Write-Host "   $relativePath" -ForegroundColor Gray
    }
} else {
    Write-Host "   ❌ Diretório dist/public não existe!" -ForegroundColor Red
}

# 5. Verificar modo de execução
Write-Host ""
Write-Host "5️⃣ Verificando modo de execução..." -ForegroundColor Yellow
if (Test-Path ".env") {
    $envContent = Get-Content ".env" -Raw
    if ($envContent -match "NODE_ENV=production") {
        Write-Host "   ⚠️  Modo PRODUÇÃO detectado" -ForegroundColor Yellow
        Write-Host "   💡 Certifique-se de que o build foi feito!" -ForegroundColor Cyan
    } else {
        Write-Host "   ✅ Modo DESENVOLVIMENTO" -ForegroundColor Green
        Write-Host "   💡 Em desenvolvimento, use 'pnpm dev' (não 'pnpm start')" -ForegroundColor Cyan
    }
}

# 6. Soluções
Write-Host ""
Write-Host "🔧 SOLUÇÕES:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Se a página está em branco, tente:" -ForegroundColor White
Write-Host ""
Write-Host "1. Rebuild completo:" -ForegroundColor Yellow
Write-Host "   npx --yes pnpm build" -ForegroundColor White
Write-Host ""
Write-Host "2. Rodar em modo desenvolvimento (recomendado para debug):" -ForegroundColor Yellow
Write-Host "   npx --yes pnpm dev" -ForegroundColor White
Write-Host ""
Write-Host "3. Verificar console do navegador (F12):" -ForegroundColor Yellow
Write-Host "   - Abra o DevTools (F12)" -ForegroundColor White
Write-Host "   - Vá na aba Console" -ForegroundColor White
Write-Host "   - Procure por erros em vermelho" -ForegroundColor White
Write-Host ""
Write-Host "4. Verificar Network no navegador:" -ForegroundColor Yellow
Write-Host "   - Abra o DevTools (F12)" -ForegroundColor White
Write-Host "   - Vá na aba Network" -ForegroundColor White
Write-Host "   - Recarregue a página (F5)" -ForegroundColor White
Write-Host "   - Verifique se arquivos .js e .css estão sendo carregados" -ForegroundColor White
Write-Host ""



