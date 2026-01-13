# 🔧 Solução: Problema de Conexão com Banco de Dados SQL Server

## ❌ Problema Identificado

A porta **15000** do servidor SQL Server não está acessível. Isso causa timeout e impede a conexão.

## 🔍 Diagnóstico

Execute o diagnóstico rápido:
```powershell
cd E:\SGSB-master\SGSB_INSP
.\diagnosticar-banco-rapido.ps1
```

## ✅ Soluções Possíveis

### 1. Verificar se o Servidor SQL está Online

Teste a conexão com SQL Server Management Studio (SSMS):
- Servidor: `108.181.193.92,15000`
- Autenticação: SQL Server Authentication
- Usuário: `sa`
- Senha: `SenhaNova@123`

Se não conseguir conectar no SSMS, o problema é no servidor SQL, não no código.

### 2. Verificar Firewall

O firewall pode estar bloqueando a porta 15000:

**No servidor SQL Server:**
1. Abra o Windows Firewall
2. Verifique se a porta 15000 está aberta para conexões de entrada
3. Se não estiver, adicione uma regra para permitir a porta 15000

**No seu computador:**
1. Verifique se o firewall não está bloqueando conexões de saída na porta 15000

### 3. Verificar Configuração do SQL Server

O SQL Server precisa estar configurado para aceitar conexões TCP/IP na porta 15000:

1. Abra o SQL Server Configuration Manager
2. Vá em "SQL Server Network Configuration" → "Protocols for [INSTANCE]"
3. Certifique-se de que "TCP/IP" está habilitado
4. Clique com botão direito em "TCP/IP" → Properties
5. Na aba "IP Addresses", verifique se a porta 15000 está configurada
6. Reinicie o serviço SQL Server

### 4. Usar Banco de Dados Local (Temporário)

Se o servidor remoto não estiver acessível, você pode usar um banco local temporariamente:

**Edite o arquivo `.env`:**
```env
# Comentar o servidor remoto
# SQLSERVER_SERVER=108.181.193.92,15000
# SQLSERVER_PORT=15000

# Usar servidor local
SQLSERVER_SERVER=localhost
SQLSERVER_PORT=1433
SQLSERVER_DATABASE=sgsb_insp
SQLSERVER_USER=sa
SQLSERVER_PASSWORD=SuaSenhaLocal
SQLSERVER_TRUSTED_CONNECTION=false
```

### 5. Verificar Credenciais

Certifique-se de que as credenciais no `.env` estão corretas:
- Usuário: `sa`
- Senha: `SenhaNova@123`
- Banco: `sgsb_insp`

### 6. Verificar se o Banco de Dados Existe

Execute no SQL Server Management Studio:
```sql
SELECT name FROM sys.databases WHERE name = 'sgsb_insp'
```

Se o banco não existir, crie-o:
```sql
CREATE DATABASE sgsb_insp;
```

## 🔄 Após Corrigir

1. **Reinicie o servidor Node.js:**
   ```powershell
   # Parar processos
   Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force
   
   # Aguardar
   Start-Sleep -Seconds 2
   
   # Iniciar novamente
   cd E:\SGSB-master\SGSB_INSP
   npx --yes pnpm start
   ```

2. **Verifique os logs** para ver se a conexão foi estabelecida:
   - Procure por: `[SQL Server] Connected to...`
   - Se aparecer erro, verifique a mensagem específica

## 📋 Checklist

- [ ] Servidor SQL está online e acessível?
- [ ] Porta 15000 está aberta no firewall?
- [ ] SQL Server está configurado para aceitar TCP/IP?
- [ ] Credenciais estão corretas no `.env`?
- [ ] Banco de dados `sgsb_insp` existe?
- [ ] Servidor Node.js foi reiniciado após mudanças?

## 🆘 Ainda com Problemas?

Se após seguir todos os passos ainda houver problemas:

1. **Compartilhe os logs do servidor** (terminal onde roda `pnpm start`)
2. **Teste a conexão com SSMS** e compartilhe o resultado
3. **Execute o diagnóstico:**
   ```powershell
   cd E:\SGSB-master\SGSB_INSP
   .\diagnosticar-banco-rapido.ps1
   ```

## 💡 Dica

O código agora tem timeout de 5 segundos, então não vai mais travar indefinidamente. Se demorar mais que isso, significa que a porta realmente não está acessível.

