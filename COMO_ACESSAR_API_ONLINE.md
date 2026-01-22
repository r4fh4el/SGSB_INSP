# 🌐 Como Acessar a API do SGSB_INSP Online

## 🔍 Encontrar a URL da API

### 1. Verificar IP Público do Servidor

O sistema está configurado para usar:
- **IP Público:** `72.62.12.84` (conforme código)
- **Porta:** `3000` (desenvolvimento) ou `80` (produção)

### 2. URLs da API

#### API tRPC Base:
```
http://72.62.12.84:3000/api/trpc
```
OU
```
http://72.62.12.84:80/api/trpc
```

#### Health Check:
```
http://72.62.12.84:3000/api/health
```
OU
```
http://72.62.12.84:80/api/health
```

---

## 🧪 Como Testar a API

### 1. Health Check (Mais Simples)

```bash
# PowerShell:
Invoke-WebRequest -Uri "http://72.62.12.84:3000/api/health" -UseBasicParsing

# OU curl:
curl http://72.62.12.84:3000/api/health
```

**Resposta esperada:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### 2. Testar Endpoint tRPC (via POST)

Como tRPC usa POST, você precisa fazer uma requisição POST:

```bash
# PowerShell - Listar barragens
$body = @{} | ConvertTo-Json
Invoke-RestMethod -Uri "http://72.62.12.84:3000/api/trpc/barragens.list" -Method POST -Body $body -ContentType "application/json"
```

### 3. Via Navegador (GET em /api/trpc)

Agora com a correção, você pode acessar:
```
http://72.62.12.84:3000/api/trpc
```

E verá uma mensagem útil com os routers disponíveis.

---

## 📋 Endpoints Disponíveis

### Routers Principais:

1. **Barragens:**
   - `barragens.list`
   - `barragens.getById`
   - `barragens.create`
   - `barragens.update`
   - `barragens.delete`

2. **Questionários:**
   - `questionarios.list`
   - `questionarios.getById`
   - `questionarios.create`
   - `questionarios.update`
   - `questionarios.delete`

3. **Instrumentos:**
   - `instrumentos.list`
   - `instrumentos.getById`
   - `instrumentos.leituras`
   - `instrumentos.create`

4. **Checklists:**
   - `checklists.list`
   - `checklists.getById`
   - `checklists.create`

5. **E muitos outros...**

---

## 🔧 Verificar Qual Porta Está Rodando

### No Servidor (via SSH):

```bash
# Ver processos Node.js
ps aux | grep node

# Ver portas em uso
netstat -tulpn | grep :3000
netstat -tulpn | grep :80

# OU
lsof -i :3000
lsof -i :80
```

### Via PM2:

```bash
pm2 status
pm2 logs sgsb-insp --lines 50
```

Os logs mostrarão:
```
🚀 Server running on http://0.0.0.0:3000/
📱 Local access: http://localhost:3000/
🌐 Public access: http://72.62.12.84:3000/
```

---

## 🧪 Script de Teste Completo

Crie um arquivo `testar-api-online.ps1`:

```powershell
$baseUrl = "http://72.62.12.84:3000"

Write-Host "Testando API do SGSB_INSP..." -ForegroundColor Cyan
Write-Host ""

# 1. Health Check
Write-Host "1. Health Check:" -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/api/health" -Method GET
    Write-Host "   ✓ API está online!" -ForegroundColor Green
    Write-Host "   Status: $($health.status)" -ForegroundColor White
} catch {
    Write-Host "   ✗ Erro: $_" -ForegroundColor Red
}

# 2. Testar tRPC endpoint
Write-Host ""
Write-Host "2. Endpoint tRPC:" -ForegroundColor Yellow
try {
    $trpc = Invoke-WebRequest -Uri "$baseUrl/api/trpc" -Method GET -UseBasicParsing
    Write-Host "   ✓ Endpoint tRPC acessível!" -ForegroundColor Green
    Write-Host "   Status: $($trpc.StatusCode)" -ForegroundColor White
} catch {
    Write-Host "   ✗ Erro: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "URLs disponíveis:" -ForegroundColor Cyan
Write-Host "  - API Base: $baseUrl/api/trpc" -ForegroundColor White
Write-Host "  - Health: $baseUrl/api/health" -ForegroundColor White
Write-Host "  - Frontend: $baseUrl" -ForegroundColor White
```

---

## 🌐 URLs Completas

### Desenvolvimento (Porta 3000):
- **Frontend:** http://72.62.12.84:3000
- **API tRPC:** http://72.62.12.84:3000/api/trpc
- **Health:** http://72.62.12.84:3000/api/health

### Produção (Porta 80):
- **Frontend:** http://72.62.12.84
- **API tRPC:** http://72.62.12.84/api/trpc
- **Health:** http://72.62.12.84/api/health

---

## 🔍 Como Descobrir a Porta Correta

### Opção 1: Ver logs do servidor
```bash
pm2 logs sgsb-insp --lines 20
```

### Opção 2: Testar ambas as portas
```bash
# Testar porta 3000
curl http://72.62.12.84:3000/api/health

# Testar porta 80
curl http://72.62.12.84/api/health
```

### Opção 3: Verificar variável de ambiente
No servidor, verifique o arquivo `.env`:
```bash
cat .env | grep PORT
```

---

## ✅ Resumo Rápido

1. **IP do Servidor:** `72.62.12.84`
2. **Portas possíveis:** `3000` (dev) ou `80` (prod)
3. **API Base:** `http://72.62.12.84:PORTA/api/trpc`
4. **Health Check:** `http://72.62.12.84:PORTA/api/health`

**Teste primeiro o Health Check para descobrir a porta!**

