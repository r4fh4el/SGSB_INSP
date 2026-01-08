# 🔌 Configurar Sistema Local com SQL Server Online

## ✅ Sim, você pode rodar localhost conectado ao SQL Server online!

Basta configurar as variáveis de ambiente no arquivo `.env`.

---

## 📝 Passo a Passo

### 1. Criar arquivo `.env` na raiz do projeto `SGSB`

```bash
cd SGSB
cp env.example.txt .env
```

### 2. Editar o arquivo `.env` com as credenciais do seu SQL Server online

#### **Opção A: SQL Server com IP e Porta**
```env
# SQL Server Online
SQLSERVER_SERVER=72.62.12.84,1433
SQLSERVER_DATABASE=sgsb
SQLSERVER_USER=seu_usuario
SQLSERVER_PASSWORD=sua_senha
SQLSERVER_TRUSTED_CONNECTION=false
SQLSERVER_PORT=1433
SQLSERVER_DRIVER=msnodesqlv8
```

#### **Opção B: SQL Server com domínio/nome**
```env
# SQL Server Online
SQLSERVER_SERVER=seu-servidor.database.windows.net
SQLSERVER_DATABASE=sgsb
SQLSERVER_USER=seu_usuario
SQLSERVER_PASSWORD=sua_senha
SQLSERVER_TRUSTED_CONNECTION=false
SQLSERVER_PORT=1433
SQLSERVER_DRIVER=msnodesqlv8
```

#### **Opção C: Azure SQL Database**
```env
# Azure SQL Database
SQLSERVER_SERVER=seu-servidor.database.windows.net
SQLSERVER_DATABASE=sgsb
SQLSERVER_USER=usuario@servidor
SQLSERVER_PASSWORD=sua_senha
SQLSERVER_TRUSTED_CONNECTION=false
SQLSERVER_PORT=1433
SQLSERVER_DRIVER=msnodesqlv8
```

### 3. Rodar o sistema localmente

```bash
# Modo desenvolvimento (com hot reload)
npm run dev

# Ou modo produção local
npm run build
npm start
```

### 4. Acessar

- **Desenvolvimento**: http://localhost:3000
- **Produção**: http://localhost:3000 (ou porta configurada)

---

## 🔍 Formatos Suportados de `SQLSERVER_SERVER`

O sistema aceita vários formatos:

1. **IP com porta**: `72.62.12.84,1433`
2. **IP separado**: `72.62.12.84` + `SQLSERVER_PORT=1433`
3. **Domínio**: `servidor.database.windows.net`
4. **Com instância**: `servidor\SQLEXPRESS`

---

## ⚠️ Requisitos Importantes

### ✅ Firewall do SQL Server
- Porta **1433** (ou a configurada) deve estar **aberta** para conexões externas
- Seu IP local deve estar **autorizado** no firewall do SQL Server

### ✅ Autenticação SQL
- **NÃO** use `SQLSERVER_TRUSTED_CONNECTION=true` (só funciona localmente)
- Use `SQLSERVER_TRUSTED_CONNECTION=false` com usuário e senha

### ✅ Testar Conexão
Antes de rodar o sistema, teste a conexão com:
- **SQL Server Management Studio (SSMS)**
- Ou ferramenta de linha de comando `sqlcmd`

---

## 🧪 Testar Conexão

### Com SQL Server Management Studio:
1. Abra SSMS
2. Conecte com:
   - **Servidor**: `72.62.12.84,1433` (ou seu servidor)
   - **Autenticação**: SQL Server Authentication
   - **Login**: seu usuário
   - **Senha**: sua senha

### Com sqlcmd (Windows):
```cmd
sqlcmd -S 72.62.12.84,1433 -U seu_usuario -P sua_senha -d sgsb
```

### Com telnet (testar porta):
```cmd
telnet 72.62.12.84 1433
```

---

## 📋 Exemplo Completo de `.env`

```env
# ============================================
# SQL SERVER ONLINE
# ============================================
SQLSERVER_SERVER=72.62.12.84,1433
SQLSERVER_DATABASE=sgsb
SQLSERVER_USER=sa
SQLSERVER_PASSWORD=MinhaSenha123!
SQLSERVER_TRUSTED_CONNECTION=false
SQLSERVER_PORT=1433
SQLSERVER_DRIVER=msnodesqlv8

# ============================================
# SERVIDOR LOCAL (OPCIONAL)
# ============================================
NODE_ENV=development
PORT=3000
HOST=localhost

# ============================================
# OUTRAS CONFIGURAÇÕES (OPCIONAL)
# ============================================
VITE_APP_TITLE=SGSB - Sistema de Gestão e Segurança de Barragem
VITE_APP_LOGO=/favicon.png
```

---

## 🚨 Problemas Comuns

### ❌ Erro: "Cannot connect to SQL Server"
**Solução:**
- Verifique se o IP/domínio está correto
- Verifique se a porta está aberta no firewall
- Teste com SSMS primeiro
- Verifique se `SQLSERVER_TRUSTED_CONNECTION=false`

### ❌ Erro: "Login failed for user"
**Solução:**
- Verifique usuário e senha
- Certifique-se que o usuário tem permissão no banco `sgsb`
- Verifique se autenticação SQL está habilitada no SQL Server

### ❌ Erro: "Connection timeout"
**Solução:**
- Verifique firewall do SQL Server
- Verifique se seu IP está autorizado
- Teste conectividade: `ping 72.62.12.84`
- Teste porta: `telnet 72.62.12.84 1433`

---

## ✅ Checklist

- [ ] Arquivo `.env` criado na raiz de `SGSB`
- [ ] `SQLSERVER_SERVER` configurado com IP/domínio correto
- [ ] `SQLSERVER_USER` e `SQLSERVER_PASSWORD` configurados
- [ ] `SQLSERVER_TRUSTED_CONNECTION=false`
- [ ] Porta do SQL Server aberta no firewall
- [ ] Conexão testada com SSMS
- [ ] Sistema rodando: `npm run dev`

---

## 🎯 Pronto!

Agora você pode desenvolver localmente enquanto usa o banco de dados online! 🚀


