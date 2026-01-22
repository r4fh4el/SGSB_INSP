# 🔍 Diagnóstico Completo - Servidor Abriu e Parou

## ✅ Status Atual (Verificado)

- ✅ Servidor Node.js rodando (3 processos)
- ✅ Porta 3000 em uso
- ✅ Arquivo .env configurado
- ✅ SKIP_AUTH=true configurado
- ✅ Build existe
- ✅ Dependências instaladas

## 🔍 O que verificar agora

### 1. Verificar Console do Navegador

1. Abra o navegador em http://localhost:3000
2. Pressione **F12** para abrir DevTools
3. Vá na aba **Console**
4. Procure por erros em **vermelho**

**Erros comuns:**
- `Failed to fetch` - Servidor não está respondendo
- `Network error` - Problema de conexão
- `Cannot read property` - Erro de JavaScript
- `401 Unauthorized` - Problema de autenticação
- `500 Internal Server Error` - Erro no servidor

### 2. Verificar Network (Rede)

1. No DevTools, vá na aba **Network**
2. Recarregue a página (F5)
3. Verifique se os arquivos estão carregando:
   - ✅ `index.html` - Status 200
   - ✅ `index-*.js` - Status 200
   - ✅ `index-*.css` - Status 200
   - ✅ Requisições `/api/trpc/*` - Status 200

**Se algum arquivo falhar:**
- Status 404 = Arquivo não encontrado
- Status 500 = Erro no servidor
- Status 401 = Problema de autenticação
- (failed) = Servidor não está respondendo

### 3. Verificar Logs do Servidor

No terminal onde você rodou `pnpm start`, procure por:

**Erros comuns:**
```
❌ Failed to connect to SQL Server
❌ Login failed for user
❌ Failed to ensure default user
❌ Cannot find module
❌ Port already in use
```

### 4. Verificar se o Servidor Está Respondendo

Teste se o servidor está respondendo:

```powershell
# Teste health check
curl http://localhost:3000/api/health

# Deve retornar: {"status":"ok","timestamp":"..."}
```

Se não retornar nada, o servidor pode ter parado.

## 🚨 Problemas Específicos

### Problema: Página Carrega mas Fica em Branco

**Solução:**
1. Limpe o cache do navegador (Ctrl+Shift+Delete)
2. Recarregue com Ctrl+F5 (hard refresh)
3. Verifique o console do navegador (F12) para erros JavaScript

### Problema: Página Carrega mas Depois Para

**Possíveis causas:**
1. **Erro JavaScript** - Verifique console (F12)
2. **Erro de API** - Verifique Network tab (F12)
3. **Timeout de conexão** - Verifique se o servidor ainda está rodando

**Solução:**
1. Abra o console (F12)
2. Veja qual erro aparece
3. Compartilhe o erro para diagnóstico

### Problema: Servidor Para Após Iniciar

**Possíveis causas:**
1. **Erro de conexão com banco** - Verifique SQL Server
2. **Erro ao criar usuário padrão** - Verifique tabelas do banco
3. **Erro de módulo** - Reinstale dependências

**Solução:**
```powershell
# Ver logs detalhados
cd E:\SGSB-master\SGSB_INSP
npx --yes pnpm dev

# Isso mostrará erros mais detalhados
```

## 🔄 Reiniciar Tudo

Se nada funcionar, reinicie tudo:

```powershell
# 1. Parar todos os processos Node.js
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force

# 2. Aguardar 2 segundos
Start-Sleep -Seconds 2

# 3. Verificar configuração
cd E:\SGSB-master\SGSB_INSP
.\verificar-problemas.ps1

# 4. Iniciar servidor
npx --yes pnpm start
```

## 📋 Checklist de Diagnóstico

Execute este checklist e anote os resultados:

- [ ] Servidor está rodando? (Verificado: ✅ Sim)
- [ ] Porta 3000 está em uso? (Verificado: ✅ Sim)
- [ ] Console do navegador mostra erros? (Verifique F12)
- [ ] Network tab mostra arquivos carregando? (Verifique F12)
- [ ] Health check responde? (`curl http://localhost:3000/api/health`)
- [ ] Logs do servidor mostram erros? (Verifique terminal)

## 💡 Próximos Passos

1. **Abra o console do navegador (F12)** e veja se há erros
2. **Verifique o terminal** onde o servidor está rodando para erros
3. **Compartilhe os erros** que aparecem para diagnóstico mais específico

## 🔧 Modo Desenvolvimento (Mais Detalhes)

Para ver erros mais detalhados, rode em modo desenvolvimento:

```powershell
cd E:\SGSB-master\SGSB_INSP
npx --yes pnpm dev
```

Isso mostrará:
- Erros mais detalhados
- Hot reload automático
- Melhor debugging



