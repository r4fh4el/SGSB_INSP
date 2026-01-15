# 🔧 Solução: Erro "HIDRO_API_URL não configurada"

## ❌ Erro
```
Erro 500: {"error":"HIDRO_API_URL não configurada"}
```

## 🔍 Causa
A variável de ambiente `HIDRO_API_URL` não está configurada ou não está sendo carregada corretamente pelo servidor Node.js.

---

## ✅ Solução Rápida

### Opção 1: Usar o Script Automático (Recomendado)
```powershell
cd SGSB_INSP
.\verificar-hidro-api-url.ps1
```

O script irá:
- ✅ Verificar se `HIDRO_API_URL` existe no `.env`
- ✅ Configurar automaticamente se estiver faltando
- ✅ Testar a conectividade com a API
- ✅ Fornecer instruções para reiniciar o servidor

---

### Opção 2: Configuração Manual

#### 1. Verificar/Criar arquivo `.env`
Certifique-se de que existe um arquivo `.env` na raiz do projeto `SGSB_INSP`.

#### 2. Adicionar/Atualizar HIDRO_API_URL
Abra o arquivo `.env` e adicione ou atualize a linha:

**Para API local:**
```env
HIDRO_API_URL=http://localhost:5204
```

**Para API em servidor remoto:**
```env
HIDRO_API_URL=http://SEU_IP:5204
```

**Exemplo com IP específico:**
```env
HIDRO_API_URL=http://72.60.57.220:5204
```

#### 3. Verificar formato do arquivo
O arquivo `.env` deve ter:
- ✅ Sem espaços antes do `=`
- ✅ Sem aspas ao redor do valor (a menos que necessário)
- ✅ Sem comentários na mesma linha (use linha separada)

**Formato correto:**
```env
HIDRO_API_URL=http://localhost:5204
```

**Formato incorreto:**
```env
HIDRO_API_URL = http://localhost:5204  # ❌ Espaços ao redor do =
HIDRO_API_URL="http://localhost:5204"  # ⚠️ Aspas podem causar problemas
HIDRO_API_URL=http://localhost:5204 # comentário  # ⚠️ Comentário na mesma linha
```

---

## 🔄 Reiniciar o Servidor

**IMPORTANTE:** Após alterar o `.env`, você DEVE reiniciar o servidor Node.js!

### Parar o servidor atual:
- Pressione `Ctrl+C` no terminal onde o servidor está rodando

### Iniciar novamente:
```bash
# Desenvolvimento
npm run dev

# Produção
npm start

# Ou se estiver usando outro comando
npm run build && npm start
```

---

## 🧪 Verificar se Funcionou

### 1. Verificar variável no código
O servidor deve carregar a variável corretamente. Verifique os logs ao iniciar:
```
🚀 Server running on http://0.0.0.0:80/
```

### 2. Testar endpoint de cálculos
```powershell
# Substitua SEU_IP pelo IP do servidor SGSB_INSP
Invoke-RestMethod -Uri "http://SEU_IP/api/sgsb-web/calculos-automaticos?barragemId=1" -Method Get
```

### 3. Verificar no navegador
Acesse a aplicação e tente fazer um cálculo. O erro não deve mais aparecer.

---

## 🔍 Diagnóstico Avançado

### Verificar se a variável está sendo carregada
Adicione um log temporário no arquivo `server/_core/env.ts`:

```typescript
export const ENV = {
  // ... outras variáveis
  hidroApiUrl: process.env.HIDRO_API_URL ?? "",
};

// Log temporário para debug
console.log("[DEBUG] HIDRO_API_URL:", ENV.hidroApiUrl || "NÃO CONFIGURADA");
```

### Verificar arquivo .env
```powershell
# Ver conteúdo do .env (cuidado com senhas!)
Get-Content .env | Select-String "HIDRO_API_URL"
```

### Verificar variáveis de ambiente do processo
No código Node.js, adicione temporariamente:
```typescript
console.log("process.env.HIDRO_API_URL:", process.env.HIDRO_API_URL);
```

---

## 🌐 Configuração para Diferentes Ambientes

### Desenvolvimento Local
```env
HIDRO_API_URL=http://localhost:5204
```

### Servidor de Desenvolvimento
```env
HIDRO_API_URL=http://72.60.57.220:5204
```

### Produção
```env
HIDRO_API_URL=https://api.sgsb.com.br
```

---

## ⚠️ Problemas Comuns

### Problema 1: Variável existe mas está vazia
**Solução:** Verifique se não há espaços ou caracteres invisíveis:
```env
# ❌ Errado
HIDRO_API_URL=

# ✅ Correto
HIDRO_API_URL=http://localhost:5204
```

### Problema 2: Servidor não recarregou as variáveis
**Solução:** Reinicie completamente o servidor (pare e inicie novamente)

### Problema 3: Arquivo .env em local errado
**Solução:** O arquivo `.env` deve estar na **raiz** do projeto `SGSB_INSP`, não em subpastas.

### Problema 4: API não está acessível
**Solução:** 
1. Verifique se a WebAPI está rodando
2. Teste acessar `http://SEU_IP:5204/swagger` no navegador
3. Verifique firewall e CORS

---

## 📝 Checklist de Verificação

- [ ] Arquivo `.env` existe na raiz do `SGSB_INSP`
- [ ] Linha `HIDRO_API_URL=http://...` existe no `.env`
- [ ] Sem espaços ao redor do `=`
- [ ] URL está correta e acessível
- [ ] Servidor Node.js foi reiniciado após alterar `.env`
- [ ] API WebAPI está rodando e acessível
- [ ] Teste de cálculo funciona sem erro

---

## 🆘 Ainda com Problemas?

1. **Verifique os logs do servidor** para ver se há outros erros
2. **Teste a API diretamente:**
   ```powershell
   curl http://localhost:5204/swagger
   ```
3. **Verifique se o dotenv está instalado:**
   ```bash
   npm list dotenv
   ```
4. **Verifique o código em `server/_core/index.ts` linha 143-146**

---

## 📚 Arquivos Relacionados

- `SGSB_INSP/.env` - Arquivo de configuração
- `SGSB_INSP/server/_core/env.ts` - Carregamento das variáveis
- `SGSB_INSP/server/_core/index.ts` - Validação da variável (linha 143-146)

