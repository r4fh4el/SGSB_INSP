# 🔍 Diagnóstico Completo - Banco de Dados

## 🚀 Teste Rápido

Execute o script de teste completo:

```powershell
cd SGSB_INSP
.\testar-banco-completo.ps1
```

Este script irá:
- ✅ Verificar configurações do `.env`
- ✅ Testar conectividade de rede
- ✅ Testar porta TCP
- ✅ Verificar drivers ODBC
- ✅ Testar conexão com SQL Server
- ✅ Listar tabelas do banco
- ✅ Mostrar diagnóstico completo

---

## 📋 Verificações Manuais

### 1. Verificar Configurações no .env

Certifique-se de que o arquivo `.env` contém:

```env
SQLSERVER_SERVER=108.181.193.92,15000
SQLSERVER_DATABASE=sgsb_insp
SQLSERVER_USER=sa
SQLSERVER_PASSWORD=SenhaNova@123
SQLSERVER_TRUSTED_CONNECTION=false
SQLSERVER_ODBC_DRIVER=ODBC Driver 17 for SQL Server
```

### 2. Testar Conectividade de Rede

```powershell
# Testar ping
Test-Connection -ComputerName 108.181.193.92 -Count 4

# Testar porta TCP
Test-NetConnection -ComputerName 108.181.193.92 -Port 15000
```

### 3. Verificar Drivers ODBC

```powershell
Get-OdbcDriver | Where-Object { $_.Name -like "*SQL Server*" }
```

### 4. Testar Conexão com Node.js

```powershell
cd SGSB_INSP
node testar-conexao-sql-detalhado.js
```

---

## 🔧 Problemas Comuns e Soluções

### Problema 1: "Connection timeout"

**Causas:**
- SQL Server não está rodando
- Porta bloqueada por firewall
- IP/hostname incorreto

**Solução:**
1. Verifique se o SQL Server está online
2. Verifique firewall:
   ```powershell
   # Windows
   New-NetFirewallRule -DisplayName "SQL Server 15000" -Direction Inbound -LocalPort 15000 -Protocol TCP -Action Allow
   
   # Linux
   sudo ufw allow 15000/tcp
   ```
3. Teste a porta:
   ```powershell
   Test-NetConnection -ComputerName 108.181.193.92 -Port 15000
   ```

### Problema 2: "Login failed"

**Causas:**
- Usuário ou senha incorretos
- Autenticação SQL Server desabilitada

**Solução:**
1. Verifique credenciais no `.env`
2. Teste com SQL Server Management Studio
3. Verifique se a autenticação SQL está habilitada no SQL Server

### Problema 3: "Cannot open database"

**Causas:**
- Banco de dados não existe
- Usuário não tem permissão

**Solução:**
1. Verifique se o banco existe:
   ```sql
   SELECT name FROM sys.databases WHERE name = 'sgsb_insp'
   ```
2. Crie o banco se não existir:
   ```sql
   CREATE DATABASE sgsb_insp
   ```
3. Conceda permissões ao usuário:
   ```sql
   USE sgsb_insp
   CREATE USER [sa] FOR LOGIN [sa]
   ALTER ROLE db_owner ADD MEMBER [sa]
   ```

### Problema 4: "Driver not found"

**Causas:**
- Driver ODBC não instalado
- Nome do driver incorreto

**Solução:**
1. Instale o ODBC Driver 17 for SQL Server:
   - Windows: https://aka.ms/downloadmsodbcsql
   - Linux: `sudo apt-get install msodbcsql17`
2. Verifique drivers instalados:
   ```powershell
   Get-OdbcDriver | Where-Object { $_.Name -like "*SQL Server*" }
   ```
3. Atualize o nome do driver no `.env` se necessário

---

## 🧪 Testes Adicionais

### Teste 1: Conexão Básica

```powershell
cd SGSB_INSP
node testar-conexao-simples.js
```

### Teste 2: Conexão Detalhada

```powershell
cd SGSB_INSP
node testar-conexao-sql-detalhado.js
```

### Teste 3: Verificar Tabelas

```sql
USE sgsb_insp
SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME
```

---

## 📝 Checklist de Verificação

- [ ] Arquivo `.env` existe e está configurado
- [ ] `SQLSERVER_SERVER` está correto
- [ ] `SQLSERVER_DATABASE` está correto
- [ ] `SQLSERVER_USER` e `SQLSERVER_PASSWORD` estão corretos
- [ ] Servidor SQL está online e acessível
- [ ] Porta está aberta no firewall
- [ ] Driver ODBC está instalado
- [ ] Banco de dados existe
- [ ] Usuário tem permissões no banco
- [ ] Teste de conexão passa

---

## 🆘 Ainda com Problemas?

1. **Verifique os logs do servidor Node.js:**
   - Procure por mensagens `[SQL Server]`
   - Erros de conexão aparecem nos logs

2. **Teste com SQL Server Management Studio:**
   - Se conectar pelo SSMS, o problema pode ser no código
   - Se não conectar pelo SSMS, o problema é de rede/firewall

3. **Verifique versão do Node.js:**
   ```powershell
   node --version
   npm --version
   ```

4. **Reinstale dependências:**
   ```powershell
   npm install
   ```

---

## 📚 Arquivos Relacionados

- `SGSB_INSP/.env` - Configurações do banco
- `SGSB_INSP/server/_core/sqlserver.ts` - Código de conexão
- `SGSB_INSP/testar-banco-completo.ps1` - Script de teste
- `SGSB_INSP/testar-conexao-sql-detalhado.js` - Teste Node.js



