# Como Rodar o Sistema Offline com SQL Server Online

## 📋 Pré-requisitos

1. **Node.js e pnpm instalados**
2. **SQL Server online acessível** (servidor remoto ou Azure SQL)
3. **Credenciais de acesso ao SQL Server**

## 🚀 Passo a Passo

### 1. Configurar Conexão com SQL Server

Execute o script de configuração:

```powershell
cd SGSB
.\configurar-sql-online.ps1
```

O script vai solicitar:
- **Servidor SQL**: IP ou hostname (ex: `seu-servidor.database.windows.net` ou `192.168.1.100,1433`)
- **Banco de dados**: Nome do banco (ex: `sgsb`)
- **Tipo de autenticação**: SQL Server ou Windows/Trusted
- **Usuário e senha** (se SQL Server)
- **Porta** (opcional, padrão 1433)

### 2. Executar Script SQL no Banco

Execute o script SQL para criar a tabela de caracterização:

```sql
-- No SQL Server Management Studio ou Azure Data Studio
-- Execute: SGSB/sqlserver/caracterizacao_barragem.sql
```

Ou via linha de comando:

```powershell
# Se tiver sqlcmd instalado
sqlcmd -S seu-servidor -d sgsb -U usuario -P senha -i sqlserver\caracterizacao_barragem.sql
```

### 3. Instalar Dependências (se necessário)

```powershell
cd SGSB
pnpm install
```

### 4. Rodar o Sistema

Execute o script de inicialização:

```powershell
.\rodar-offline.ps1
```

Ou manualmente:

```powershell
pnpm dev
```

## 📝 Configuração Manual do .env

Se preferir configurar manualmente, crie o arquivo `.env` na raiz do projeto `SGSB`:

```env
# SQL Server Online
SQLSERVER_SERVER=seu-servidor.database.windows.net
SQLSERVER_DATABASE=sgsb
SQLSERVER_PORT=1433
SQLSERVER_TRUSTED_CONNECTION=false
SQLSERVER_USER=seu-usuario
SQLSERVER_PASSWORD=sua-senha

# Ambiente
NODE_ENV=development

# Servidor
PORT=3000
HOST=localhost
```

### Formatos de Servidor Suportados

1. **IP e Porta separados por vírgula:**
   ```
   SQLSERVER_SERVER=192.168.1.100,1433
   ```

2. **Hostname com instância:**
   ```
   SQLSERVER_SERVER=servidor\SQLEXPRESS
   ```

3. **Azure SQL Database:**
   ```
   SQLSERVER_SERVER=seu-servidor.database.windows.net
   SQLSERVER_PORT=1433
   ```

## 🔍 Verificar Conexão

Após iniciar o sistema, verifique os logs:

```
[SQL Server] Connected to seu-servidor/sgsb
```

Se houver erro de conexão, verifique:
- ✅ Firewall permite conexão na porta do SQL Server
- ✅ SQL Server está configurado para aceitar conexões remotas
- ✅ Credenciais estão corretas
- ✅ Banco de dados existe

## 🛠️ Troubleshooting

### Erro: "Cannot connect to SQL Server"

1. Verifique se o SQL Server está online
2. Teste a conexão com outra ferramenta (SSMS, Azure Data Studio)
3. Verifique firewall e regras de rede
4. Confirme que a porta está correta

### Erro: "Login failed for user"

1. Verifique usuário e senha no `.env`
2. Confirme que o usuário tem permissões no banco
3. Se usar Azure SQL, verifique se o IP está na lista de permitidos

### Erro: "Database does not exist"

1. Crie o banco de dados no SQL Server
2. Execute o script de inicialização: `sqlserver/init.sql`
3. Execute o script da caracterização: `sqlserver/caracterizacao_barragem.sql`

## 📊 Acessar o Sistema

Após iniciar:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Documentação API**: http://localhost:3000/docs (se configurado)

## ✅ Checklist

- [ ] Arquivo `.env` configurado
- [ ] Script SQL executado no banco
- [ ] Dependências instaladas (`pnpm install`)
- [ ] Sistema rodando (`pnpm dev`)
- [ ] Conexão com SQL Server estabelecida
- [ ] Tabela `caracterizacaoBarragem` criada

## 🔐 Segurança

⚠️ **IMPORTANTE**: 
- Nunca commite o arquivo `.env` no Git
- Use variáveis de ambiente em produção
- Mantenha senhas seguras
- Use conexões criptografadas (SSL/TLS)




