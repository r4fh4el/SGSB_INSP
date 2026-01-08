# 🔔 Integração de Notificações: SGSB → SGSB-HIDRO

## 📋 Visão Geral

Quando uma nova inspeção é criada no sistema SGSB (Node.js), uma notificação é enviada automaticamente para o sistema SGSB-HIDRO (ASP.NET Core) via HTTP POST.

## 🎯 Objetivo

Notificar o sistema HIDRO sempre que:
- ✅ Uma nova inspeção (checklist) é criada
- ✅ Para que o HIDRO possa:
  - Disparar cálculos automáticos
  - Atualizar dados relacionados
  - Sincronizar caracterização da barragem
  - Enviar alertas internos

## 🔧 Configuração

### 1. No Sistema SGSB (Node.js)

Adicione no arquivo `.env`:

```env
# URL da API do SGSB-HIDRO
HIDRO_API_URL=https://api.sgsb.com.br
# ou para desenvolvimento local:
# HIDRO_API_URL=https://localhost:7042
```

### 2. No Sistema SGSB-HIDRO (ASP.NET Core)

O endpoint já está criado em:
```
WebAPI/Controllers/NotificacaoInspecaoController.cs
```

**Endpoints disponíveis:**
- `POST /API/NotificarNovaInspecao` - Recebe notificação de nova inspeção
- `GET /API/NotificacaoInspecao/Health` - Verifica se o serviço está ativo

## 📡 Como Funciona

### Fluxo de Notificação

```
1. Usuário cria inspeção no SGSB
   ↓
2. Checklist é salvo no banco
   ↓
3. Sistema verifica se há caracterização
   ↓
4. Envia HTTP POST para HIDRO
   POST /API/NotificarNovaInspecao
   {
     "checklistId": 123,
     "barragemId": 45,
     "tipo": "mensal",
     "data": "2026-01-08T10:30:00Z",
     "temCaracterizacao": true
   }
   ↓
5. HIDRO recebe e processa
   - Loga a notificação
   - Pode disparar cálculos
   - Pode sincronizar dados
```

### Payload da Notificação

```json
{
  "checklistId": 123,
  "barragemId": 45,
  "tipo": "mensal",
  "data": "2026-01-08T10:30:00.000Z",
  "inspetor": "João Silva",
  "status": "em_andamento",
  "temCaracterizacao": true
}
```

## 🛠️ Implementação

### No SGSB (Node.js)

**Arquivo:** `server/notificacaoHidro.ts`

```typescript
// Função que envia notificação
export async function notificarHidroNovaInspecao(
  checklistId: number,
  barragemId: number,
  tipo: string,
  data: Date,
  inspetor?: string,
  status?: string,
  temCaracterizacao = false
): Promise<void>
```

**Integração:** `server/routers.ts` (checklists.create)

A notificação é enviada automaticamente após criar o checklist, mas **não bloqueia** o fluxo se falhar.

### No SGSB-HIDRO (ASP.NET Core)

**Arquivo:** `WebAPI/Controllers/NotificacaoInspecaoController.cs`

```csharp
[HttpPost("/API/NotificarNovaInspecao")]
public async Task<IActionResult> NotificarNovaInspecao(
    [FromBody] NotificacaoInspecaoModel model
)
```

## ✅ Vantagens desta Abordagem

1. **Simples**: Apenas uma chamada HTTP
2. **Não bloqueante**: Se o HIDRO estiver offline, o SGSB continua funcionando
3. **Flexível**: O HIDRO pode processar a notificação como quiser
4. **Rastreável**: Logs em ambos os sistemas
5. **Configurável**: URL via variável de ambiente

## 🔍 Verificação

### Testar se está funcionando

1. **No SGSB:**
   - Crie uma nova inspeção
   - Verifique os logs do servidor:
     ```
     [Notificação HIDRO] Notificação enviada com sucesso: ChecklistId=123
     ```

2. **No HIDRO:**
   - Verifique os logs:
     ```
     Nova inspeção recebida: ChecklistId=123, BarragemId=45
     ```

3. **Health Check:**
   ```bash
   curl https://api.sgsb.com.br/API/NotificacaoInspecao/Health
   ```

## 🚨 Tratamento de Erros

- Se o HIDRO estiver offline, o erro é logado mas não quebra o fluxo
- Se a URL não estiver configurada, a notificação é pulada silenciosamente
- O sistema SGSB continua funcionando normalmente mesmo se a notificação falhar

## 🔄 Próximos Passos (Opcional)

Você pode estender esta integração para:

1. **Sincronizar dados de caracterização:**
   - Quando houver caracterização, enviar os dados completos
   - O HIDRO pode atualizar seus cálculos automaticamente

2. **Notificar atualizações:**
   - Quando uma inspeção for atualizada
   - Quando uma caracterização for validada

3. **Retry automático:**
   - Se a notificação falhar, tentar novamente depois
   - Usar uma fila de mensagens (opcional)

4. **Autenticação:**
   - Adicionar token de autenticação nas requisições
   - Garantir que apenas o SGSB possa notificar

## 📝 Exemplo de Uso no HIDRO

No controller do HIDRO, você pode adicionar lógica como:

```csharp
// Verificar se há caracterização e disparar cálculos
if (model.TemCaracterizacao)
{
    // Buscar dados de caracterização do banco compartilhado
    // Disparar cálculos automáticos
    // Atualizar páginas de cálculo
}
```

## 🎯 Resumo

✅ **Sistema SGSB** → Cria inspeção → Envia notificação HTTP  
✅ **Sistema HIDRO** → Recebe notificação → Processa como necessário  
✅ **Não bloqueante** → Se falhar, não afeta o fluxo principal  
✅ **Configurável** → URL via variável de ambiente




