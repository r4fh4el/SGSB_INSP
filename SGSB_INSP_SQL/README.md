# SGSB - Sistema de Gestão e Segurança de Barragem

## 📍 Localização

Este é o sistema principal de inspeções, localizado em:
```
E:\SGSB-master\SGSB\SGSB_INSP_SQL
```

## 🚀 Como Iniciar

### 1. Configurar SQL Server (primeira vez)

```powershell
.\configurar-sql-online.ps1
```

### 2. Iniciar o Sistema

```powershell
.\iniciar-sistema.ps1
```

Ou diretamente:

```powershell
pnpm dev
```

## 📋 Estrutura

```
SGSB_INSP_SQL/
├── client/          # Frontend React
├── server/          # Backend Express + tRPC
├── shared/          # Código compartilhado
├── drizzle/         # Migrations e schema
├── prisma/          # Schema Prisma
└── sqlserver/       # Scripts SQL
```

## 🌐 Acesso

O sistema integra frontend e backend em uma única porta:
- **Porta 80** (padrão) ou **Porta 3000** (fallback)
- Acesse: `http://localhost` ou `http://localhost:3000`

## 📝 Comandos Úteis

```powershell
# Instalar dependências
pnpm install

# Desenvolvimento
pnpm dev

# Build
pnpm build

# Produção
pnpm start

# Migrações do banco
pnpm db:push
```

## ⚙️ Configuração

O arquivo `.env` deve conter:

```env
SQLSERVER_SERVER=servidor
SQLSERVER_DATABASE=sgsb
SQLSERVER_TRUSTED_CONNECTION=true
SQLSERVER_ODBC_DRIVER=ODBC Driver 17 for SQL Server
```

## 🔗 Integração

Este sistema se integra com:
- **SGSB-HIDRO**: Para cálculos hidrológicos automáticos
- **SGSB-ALERTA**: Para sistema de alertas




