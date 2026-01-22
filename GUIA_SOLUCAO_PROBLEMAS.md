# 🔧 Guia de Solução de Problemas - SGSB_INSP

## ✅ Checklist Rápido

Execute este checklist antes de rodar o sistema:

- [ ] Node.js instalado (v18+)
- [ ] pnpm instalado globalmente
- [ ] Arquivo `.env` configurado com SQL Server
- [ ] Dependências instaladas (`pnpm install`)
- [ ] Banco de dados SQL Server acessível

## 🚀 Solução Rápida

### Opção 1: Usar o Script Automatizado (Recomendado)

```powershell
cd SGSB_INSP
.\rodar-sgsb-insp.ps1
```

Este script irá:
1. ✅ Verificar Node.js e pnpm
2. ✅ Instalar pnpm se necessário
3. ✅ Verificar/criar arquivo .env
4. ✅ Instalar dependências
5. ✅ Iniciar o sistema

### Opção 2: Passo a Passo Manual

#### 1. Instalar pnpm (se não tiver)

```powershell
npm install -g pnpm
```

#### 2. Configurar arquivo .env

Se o arquivo `.env` não existir, crie um baseado no `env.example.txt`:

```powershell
cd SGSB_INSP
Copy-Item env.example.txt .env
```

Depois edite o `.env` e configure:

```env
# SQL Server - OBRIGATÓRIO
SQLSERVER_SERVER=108.181.193.92,15000
SQLSERVER_DATABASE=sgsb_insp
SQLSERVER_USER=sa
SQLSERVER_PASSWORD=SenhaNova@123
SQLSERVER_TRUSTED_CONNECTION=false
SQLSERVER_ODBC_DRIVER=ODBC Driver 17 for SQL Server

# Servidor
NODE_ENV=development
PORT=3000
HOST=localhost
```

**OU** use o script de configuração:

```powershell
.\configurar-sql-online.ps1
```

#### 3. Instalar dependências

```powershell
pnpm install
```

#### 4. Rodar o sistema

**Modo Desenvolvimento:**
```powershell
pnpm dev
```

**Modo Produção:**
```powershell
pnpm build
pnpm start
```

## ❌ Problemas Comuns e Soluções

### Problema 1: "pnpm não é reconhecido"

**Solução:**
```powershell
npm install -g pnpm
```

Depois feche e reabra o terminal.

### Problema 2: "Arquivo .env não encontrado"

**Solução:**
```powershell
cd SGSB_INSP
Copy-Item env.example.txt .env
# Edite o .env com suas configurações
```

### Problema 3: "Erro ao conectar ao SQL Server"

**Verifique:**
1. ✅ SQL Server está online e acessível
2. ✅ Firewall permite conexão na porta (15000 no exemplo)
3. ✅ Credenciais estão corretas no `.env`
4. ✅ Banco de dados `sgsb_insp` existe

**Teste a conexão:**
```powershell
# Se tiver sqlcmd instalado
sqlcmd -S 108.181.193.92,15000 -U sa -P SenhaNova@123 -d sgsb_insp -Q "SELECT 1"
```

### Problema 4: "Cannot find module"

**Solução:**
```powershell
cd SGSB_INSP
Remove-Item -Recurse -Force node_modules
pnpm install
```

### Problema 5: "Port 80 is already in use"

**Solução:**
Edite o `.env` e mude a porta:
```env
PORT=3000
```

### Problema 6: "Erro ao compilar TypeScript"

**Solução:**
```powershell
# Limpar cache e reinstalar
Remove-Item -Recurse -Force node_modules
Remove-Item -Recurse -Force dist
pnpm install
pnpm build
```

## 📋 Verificação de Requisitos

Execute estes comandos para verificar:

```powershell
# Verificar Node.js
node --version
# Deve mostrar v18 ou superior

# Verificar pnpm
pnpm --version
# Deve mostrar uma versão (ex: 10.4.1)

# Verificar se está no diretório correto
Get-Location
# Deve estar em: E:\SGSB-master\SGSB_INSP

# Verificar arquivos essenciais
Test-Path package.json
Test-Path .env
Test-Path node_modules
```

## 🔍 Logs e Debug

### Ver logs do servidor

Quando rodar `pnpm dev`, você verá logs no terminal. Procure por:

```
✅ [SQL Server] Connected to servidor/banco
🚀 Server running on http://localhost:3000/
```

### Erros comuns nos logs

**"Login failed for user"**
- Verifique usuário e senha no `.env`

**"Cannot connect to SQL Server"**
- Verifique se o servidor está acessível
- Verifique firewall/rede

**"Database does not exist"**
- Crie o banco de dados no SQL Server
- Execute os scripts SQL em `sqlserver/`

## 📞 Ainda com problemas?

1. Execute o script de diagnóstico:
   ```powershell
   .\rodar-sgsb-insp.ps1
   ```

2. Verifique os logs do terminal quando rodar o sistema

3. Verifique se todas as dependências estão instaladas:
   ```powershell
   pnpm install
   ```

4. Tente limpar e reinstalar:
   ```powershell
   Remove-Item -Recurse -Force node_modules
   Remove-Item pnpm-lock.yaml
   pnpm install
   ```

## 🌐 URLs de Acesso

Após iniciar o sistema:

- **Desenvolvimento:**
  - Frontend: http://localhost:5173
  - Backend: http://localhost:3000

- **Produção:**
  - Sistema: http://localhost:3000 (ou porta configurada)

## 📝 Scripts Disponíveis

- `.\rodar-sgsb-insp.ps1` - Script completo de diagnóstico e execução
- `.\configurar-sql-online.ps1` - Configurar conexão SQL Server
- `.\iniciar-sistema.ps1` - Iniciar sistema (requer .env configurado)
- `.\rodar-offline.ps1` - Rodar em modo offline com SQL online



