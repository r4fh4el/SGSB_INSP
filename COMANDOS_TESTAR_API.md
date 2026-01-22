# 🧪 Comandos para Testar a API e Swagger

## 🚀 Comando Rápido (PowerShell)

```powershell
cd SGSB_INSP
.\testar-swagger-api.ps1
```

---

## 📋 Comandos Manuais

### 1. Testar Swagger UI
```powershell
# Substitua IP_DO_SERVIDOR pelo IP onde a API está rodando
Invoke-WebRequest -Uri "http://IP_DO_SERVIDOR:5204/swagger" -UseBasicParsing
```

### 2. Ver Definição da API (Swagger JSON)
```powershell
Invoke-RestMethod -Uri "http://IP_DO_SERVIDOR:5204/swagger/v1/swagger.json" | ConvertTo-Json
```

### 3. Testar Endpoint de Cálculos
```powershell
Invoke-RestMethod -Uri "http://IP_DO_SERVIDOR:5204/API/BuscarCalculosAutomaticosPorBarragem?barragemId=1"
```

### 4. Abrir Swagger no Navegador
```powershell
Start-Process "http://IP_DO_SERVIDOR:5204/swagger"
```

---

## 🌐 URLs Comuns

### Se a API está no mesmo servidor (localhost):
```
http://localhost:5204/swagger
```

### Se a API está em servidor remoto:
```
http://IP_DO_SERVIDOR:5204/swagger
```

### Exemplos:
```
http://108.181.193.92:5204/swagger
http://72.60.57.220:5204/swagger
http://192.168.1.100:5204/swagger
```

---

## 🔍 Verificar se a API está Rodando

### PowerShell:
```powershell
# Testar conectividade
Test-NetConnection -ComputerName IP_DO_SERVIDOR -Port 5204

# Ver resposta HTTP
curl http://IP_DO_SERVIDOR:5204/swagger
```

### Linux/Bash:
```bash
# Testar porta
nc -zv IP_DO_SERVIDOR 5204

# Testar HTTP
curl http://IP_DO_SERVIDOR:5204/swagger
```

---

## 📝 Exemplos de Uso

### Exemplo 1: Ver todos os endpoints disponíveis
```powershell
$swagger = Invoke-RestMethod -Uri "http://localhost:5204/swagger/v1/swagger.json"
$swagger.paths.PSObject.Properties | ForEach-Object {
    Write-Host "$($_.Name): $($_.Value.PSObject.Properties.Name -join ', ')"
}
```

### Exemplo 2: Testar múltiplos endpoints
```powershell
$baseUrl = "http://localhost:5204"
$endpoints = @(
    "/swagger",
    "/API/ListarBarragem",
    "/API/BuscarCalculosAutomaticosPorBarragem?barragemId=1"
)

foreach ($endpoint in $endpoints) {
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl$endpoint" -UseBasicParsing
        Write-Host "✓ $endpoint - Status: $($response.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "✗ $endpoint - Erro: $($_.Exception.Message)" -ForegroundColor Red
    }
}
```

### Exemplo 3: Ver informações da API
```powershell
$api = Invoke-RestMethod -Uri "http://localhost:5204/swagger/v1/swagger.json"
Write-Host "Título: $($api.info.title)"
Write-Host "Versão: $($api.info.version)"
Write-Host "Descrição: $($api.info.description)"
Write-Host "Total de endpoints: $($api.paths.PSObject.Properties.Count)"
```

---

## 🛠️ Solução de Problemas

### Erro: "Não é possível conectar"
**Solução:**
1. Verifique se a API está rodando
2. Verifique se a porta está correta
3. Verifique firewall

### Erro: "404 Not Found"
**Solução:**
1. Verifique se o caminho está correto
2. Verifique se o Swagger está habilitado

### Erro: "Connection refused"
**Solução:**
1. A API não está rodando
2. Porta bloqueada por firewall
3. URL incorreta

---

## 📚 Endpoints Principais

Baseado na configuração, os principais endpoints são:

- `GET /swagger` - Interface Swagger
- `GET /swagger/v1/swagger.json` - Definição JSON da API
- `GET /API/ListarBarragem` - Lista todas as barragens
- `GET /API/BuscarCalculosAutomaticosPorBarragem?barragemId={id}` - Busca cálculos
- `GET /API/BuscarPorIdBarragem?id={id}` - Busca barragem por ID

Para ver todos os endpoints, acesse o Swagger UI!



