# 🔧 Solução: Servidor Abriu e Depois Parou

## 🔍 Diagnóstico Rápido

### 1. Verificar se o servidor está rodando

Execute no terminal:
```powershell
Get-Process | Where-Object {$_.ProcessName -eq "node"}
```

Se não aparecer nenhum processo, o servidor parou.

### 2. Verificar logs do servidor

No terminal onde você rodou `pnpm start`, procure por:
- ❌ Erros em vermelho
- ❌ Mensagens de erro de conexão
- ❌ Erros de banco de dados
- ❌ Erros de autenticação

## 🚨 Problemas Comuns e Soluções

### Problema 1: Erro de Conexão com Banco de Dados

**Sintoma:** Servidor para logo após iniciar, erro sobre SQL Server

**Solução:**
1. Verifique se o SQL Server está acessível
2. Verifique as credenciais no `.env`:
   ```env
   SQLSERVER_SERVER=108.181.193.92,15000
   SQLSERVER_DATABASE=sgsb_insp
   SQLSERVER_USER=sa
   SQLSERVER_PASSWORD=SenhaNova@123
   ```
3. Teste a conexão manualmente (se tiver sqlcmd):
   ```powershell
   sqlcmd -S 108.181.193.92,15000 -U sa -P SenhaNova@123 -d sgsb_insp -Q "SELECT 1"
   ```

### Problema 2: Erro ao Criar Usuário Padrão

**Sintoma:** Erro sobre "ensureDefaultUser" ou "upsertUser"

**Solução:**
1. Verifique se a tabela `users` existe no banco
2. Execute o script SQL para criar as tabelas necessárias
3. Ou configure para não precisar do banco (modo offline)

### Problema 3: Erro de Porta

**Sintoma:** "Port already in use" ou "EADDRINUSE"

**Solução:**
```powershell
# Parar todos os processos Node.js
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force

# Ou mudar a porta no .env
PORT=3001
```

### Problema 4: Erro de Build

**Sintoma:** "Cannot find module" ou arquivos não encontrados

**Solução:**
```powershell
# Rebuild completo
npx --yes pnpm build
```

## 🔄 Reiniciar o Servidor Corretamente

### Passo 1: Parar processos antigos
```powershell
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force
```

### Passo 2: Verificar configuração
```powershell
cd E:\SGSB-master\SGSB_INSP
.\verificar-problemas.ps1
```

### Passo 3: Iniciar novamente
```powershell
npx --yes pnpm start
```

## 📋 Checklist de Verificação

Execute este checklist:

- [ ] Servidor Node.js está rodando?
- [ ] Porta 3000 está em uso?
- [ ] Arquivo `.env` existe e está configurado?
- [ ] `SKIP_AUTH=true` está no `.env`?
- [ ] SQL Server está acessível?
- [ ] Build foi feito (`dist/public` existe)?
- [ ] Dependências instaladas (`node_modules` existe)?

## 🛠️ Script de Diagnóstico

Execute o script de verificação:

```powershell
cd E:\SGSB-master\SGSB_INSP
.\verificar-problemas.ps1
```

## 💡 Modo Desenvolvimento (Mais Detalhes)

Se o servidor continua parando, rode em modo desenvolvimento para ver mais detalhes:

```powershell
cd E:\SGSB-master\SGSB_INSP
npx --yes pnpm dev
```

Isso mostrará erros mais detalhados e recarregará automaticamente.

## 🔍 Verificar Logs Específicos

### No Terminal do Servidor

Procure por estas mensagens de erro comuns:

1. **Erro de SQL Server:**
   ```
   Failed to connect to SQL Server
   Login failed for user
   ```

2. **Erro de Autenticação:**
   ```
   Failed to ensure default user
   upsertUser failed
   ```

3. **Erro de Módulo:**
   ```
   Cannot find module
   Module not found
   ```

## 📞 Próximos Passos

1. **Execute o diagnóstico:**
   ```powershell
   .\verificar-problemas.ps1
   ```

2. **Verifique os logs** no terminal onde o servidor estava rodando

3. **Tente rodar em modo desenvolvimento** para ver mais detalhes:
   ```powershell
   npx --yes pnpm dev
   ```

4. **Compartilhe os erros** que aparecem no terminal para diagnóstico mais específico

