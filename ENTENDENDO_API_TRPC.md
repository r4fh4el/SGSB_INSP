# 🔌 Entendendo a API do SGSB_INSP

## ✅ SIM, o SGSB_INSP TEM uma API!

O SGSB_INSP **foi construído com uma API**, mas usa **tRPC** ao invés de REST/Swagger.

---

## 🔄 Diferença: REST vs tRPC

### REST API (como Swagger):
- ❌ Precisa de documentação separada (Swagger)
- ❌ Sem type-safety entre frontend e backend
- ❌ Precisa validar tipos manualmente
- ✅ Padrão tradicional

### tRPC (o que o SGSB_INSP usa):
- ✅ Type-safety automático (TypeScript)
- ✅ Sem necessidade de documentação externa
- ✅ Validação automática de tipos
- ✅ Melhor para projetos TypeScript full-stack
- ✅ Mais rápido de desenvolver

---

## 📍 Onde Está a API do SGSB_INSP

### Endpoint Base:
```
http://SEU_IP:3000/api/trpc
```

### Exemplos de Endpoints:

#### 1. Barragens:
```
POST http://SEU_IP:3000/api/trpc/barragens.list
POST http://SEU_IP:3000/api/trpc/barragens.getById
POST http://SEU_IP:3000/api/trpc/barragens.create
```

#### 2. Questionários:
```
POST http://SEU_IP:3000/api/trpc/questionarios.list
POST http://SEU_IP:3000/api/trpc/questionarios.create
POST http://SEU_IP:3000/api/trpc/questionarios.getById
```

#### 3. Balanço Hídrico:
```
POST http://SEU_IP:3000/api/trpc/balancoHidrico.calcular
```

#### 4. Instrumentos:
```
POST http://SEU_IP:3000/api/trpc/instrumentos.list
POST http://SEU_IP:3000/api/trpc/instrumentos.leituras
```

---

## 📋 Todos os Endpoints Disponíveis

Veja o arquivo `server/routers.ts` para ver TODOS os endpoints disponíveis:

### Routers Principais:
- `barragens.*` - Gerenciamento de barragens
- `instrumentos.*` - Instrumentação
- `checklists.*` - Checklists de inspeção
- `questionarios.*` - Questionários (NOVO!)
- `leituras.*` - Leituras de instrumentos
- `ocorrencias.*` - Ocorrências
- `hidrometria.*` - Hidrometria
- `documentos.*` - Documentos
- `manutencoes.*` - Manutenções
- `alertas.*` - Alertas
- `dashboard.*` - Dashboard
- E mais...

---

## 🧪 Como Testar a API

### 1. Via Frontend (React):
```typescript
import { trpc } from "@/lib/trpc";

// Query (GET)
const { data } = trpc.barragens.list.useQuery();

// Mutation (POST/PUT/DELETE)
const create = trpc.questionarios.create.useMutation();
```

### 2. Via HTTP direto (tRPC usa POST):
```bash
# Exemplo: Listar barragens
curl -X POST http://localhost:3000/api/trpc/barragens.list \
  -H "Content-Type: application/json" \
  -d '{}'
```

### 3. Via tRPC Client (Node.js):
```typescript
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from './server/routers';

const client = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:3000/api/trpc',
    }),
  ],
});

const barragens = await client.barragens.list.query();
```

---

## 🔍 Verificar se a API está Funcionando

### Health Check:
```bash
curl http://localhost:3000/api/health
```

### Testar tRPC:
```bash
# No navegador, abra o DevTools e veja as requisições para /api/trpc/*
# Ou use o frontend React que já está configurado
```

---

## 📚 Documentação da API

Como tRPC é type-safe, a "documentação" está no código TypeScript:

### Arquivos Importantes:
1. **`server/routers.ts`** - Define todos os endpoints
2. **`server/_core/trpc.ts`** - Configuração do tRPC
3. **`shared/dbTypes.ts`** - Tipos compartilhados

### Exemplo de Endpoint:
```typescript
// Em server/routers.ts
questionarios: router({
  list: protectedProcedure
    .input(z.object({ barragemId: z.number().optional() }))
    .query(async ({ input }) => {
      // Implementação
    }),
  
  create: protectedProcedure
    .input(z.object({ /* schema */ }))
    .mutation(async ({ input }) => {
      // Implementação
    }),
})
```

---

## 🆚 Comparação: REST vs tRPC

| Característica | REST (Swagger) | tRPC (SGSB_INSP) |
|----------------|----------------|------------------|
| Type Safety | ❌ Manual | ✅ Automático |
| Documentação | Swagger UI | Código TypeScript |
| Validação | Manual | ✅ Automática (Zod) |
| Desenvolvimento | Mais lento | ✅ Mais rápido |
| Frontend | Precisa tipos separados | ✅ Tipos compartilhados |

---

## ✅ Conclusão

**O SGSB_INSP TEM uma API completa e funcional!**

- ✅ API tRPC em `/api/trpc`
- ✅ Todos os endpoints funcionando
- ✅ Type-safety automático
- ✅ Validação automática
- ✅ Integração frontend/backend perfeita

A diferença é que usa **tRPC** (mais moderno) ao invés de **REST/Swagger** (tradicional).

---

## 🔗 Links Úteis

- **API Base:** `http://SEU_IP:3000/api/trpc`
- **Health Check:** `http://SEU_IP:3000/api/health`
- **Código da API:** `server/routers.ts`

