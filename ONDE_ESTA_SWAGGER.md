# 📍 Onde Está o Swagger no SGSB_INSP

## 🔍 Entendendo os Sistemas

### SGSB_INSP (Este Sistema)
- **Tipo de API:** tRPC (TypeScript RPC)
- **Porta:** 3000 (desenvolvimento) ou 80 (produção)
- **URL Base:** `http://SEU_IP:3000` ou `http://SEU_IP:80`
- **Endpoint tRPC:** `http://SEU_IP:3000/api/trpc`
- **❌ NÃO TEM Swagger** (usa tRPC, não REST)

### SGSB-WEB / SGSB-HIDRO (Sistema Externo)
- **Tipo de API:** REST API com Swagger
- **Porta:** 5204
- **URL Base:** `http://72.60.57.220:5204`
- **✅ TEM Swagger:** `http://72.60.57.220:5204/swagger`

---

## 🌐 URLs do Swagger (SGSB-HIDRO)

### Desenvolvimento Local:
```
http://localhost:5204/swagger
```

### Servidor Online:
```
http://72.60.57.220:5204/swagger
```

### Swagger JSON (Definição da API):
```
http://72.60.57.220:5204/swagger/v1/swagger.json
```

---

## 🔧 Como Acessar o Swagger do HIDRO

### 1. Verificar se está rodando:
```bash
# Testar se o Swagger está acessível
curl http://72.60.57.220:5204/swagger

# OU no PowerShell:
Invoke-WebRequest -Uri "http://72.60.57.220:5204/swagger" -UseBasicParsing
```

### 2. Abrir no navegador:
```
http://72.60.57.220:5204/swagger
```

### 3. Verificar variável de ambiente:
```bash
# No servidor onde o HIDRO está rodando
echo $HIDRO_API_URL
# Deve mostrar: http://72.60.57.220:5204 (SEM /swagger no final)
```

---

## 📋 Endpoints Importantes do HIDRO

### Cálculos Automáticos:
```
GET http://72.60.57.220:5204/API/BuscarCalculosAutomaticosPorBarragem?barragemId={id}
```

### Notificação de Inspeção:
```
POST http://72.60.57.220:5204/API/NotificarNovaInspecao
```

---

## 🛠️ Documentação do SGSB_INSP (tRPC)

Como o SGSB_INSP usa **tRPC** (não REST), não há Swagger tradicional. A documentação está no código TypeScript:

### Localização dos Routers:
- **Arquivo:** `server/routers.ts`
- **Tipos:** `server/routers.ts` exporta `AppRouter`

### Como usar a API tRPC:

#### No Frontend (React):
```typescript
import { trpc } from "@/lib/trpc";

// Exemplo: Buscar barragens
const { data: barragens } = trpc.barragens.list.useQuery();

// Exemplo: Criar questionário
const createQuestionario = trpc.questionarios.create.useMutation();
```

#### Endpoints tRPC disponíveis:
- `/api/trpc/barragens.list`
- `/api/trpc/instrumentos.list`
- `/api/trpc/questionarios.create`
- `/api/trpc/balancoHidrico.calcular`
- E muitos outros...

### Ver todos os endpoints:
Abra o arquivo `server/routers.ts` para ver todos os routers disponíveis.

---

## 🚀 Como Verificar se Está Online

### 1. Verificar SGSB_INSP:
```bash
# Health check
curl http://SEU_IP:3000/api/health

# OU
curl http://SEU_IP:80/api/health
```

### 2. Verificar SGSB-HIDRO (Swagger):
```bash
# Swagger UI
curl http://72.60.57.220:5204/swagger

# Swagger JSON
curl http://72.60.57.220:5204/swagger/v1/swagger.json
```

---

## 📝 Resumo

| Sistema | Tipo | Porta | Swagger | URL |
|---------|------|-------|---------|-----|
| **SGSB_INSP** | tRPC | 3000/80 | ❌ Não | `http://SEU_IP:3000` |
| **SGSB-HIDRO** | REST | 5204 | ✅ Sim | `http://72.60.57.220:5204/swagger` |

---

## 🔗 Links Úteis

- **Swagger HIDRO:** http://72.60.57.220:5204/swagger
- **API HIDRO Base:** http://72.60.57.220:5204
- **SGSB_INSP:** http://SEU_IP:3000 (ou porta configurada)

---

## ⚠️ Importante

A variável `HIDRO_API_URL` no `.env` do SGSB_INSP deve apontar para:
```
HIDRO_API_URL=http://72.60.57.220:5204
```

**NÃO inclua `/swagger` no final!** O código adiciona os caminhos automaticamente.

