# 🚀 Rodar Sistema Offline com SQL Server Online

## 📋 Resumo

Este script roda o sistema **localmente (offline)** mas conectado ao **SQL Server online**.

- **Sistema**: Roda em `localhost` (offline)
- **Banco de Dados**: Conecta ao SQL Server online
- **Banco INSP**: `SGSB`
- **Banco HIDRO**: `SGSB_2` (usado pelo sistema HIDRO)

## 🎯 Como Usar

### Opção 1: Script Automático (Recomendado)

```powershell
cd SGSB
.\rodar-offline-online-db.ps1
```

O script:
1. ✅ Mata processos Node.js antigos
2. ✅ Verifica/cria arquivo `.env`
3. ✅ Configura banco **SGSB** (INSP)
4. ✅ Instala dependências se necessário
5. ✅ Inicia o sistema

### Opção 2: Manual

```powershell
cd SGSB
pnpm dev
```

## ⚙️ Configuração do .env

O arquivo `.env` deve conter:

```env
# SQL Server Online - Banco SGSB (INSP)
SQLSERVER_SERVER=108.181.193.92,15000
SQLSERVER_DATABASE=sgsb
SQLSERVER_USER=sa
SQLSERVER_PASSWORD=SenhaNova@123
SQLSERVER_TRUSTED_CONNECTION=false
SQLSERVER_ODBC_DRIVER=ODBC Driver 17 for SQL Server

# Ambiente
NODE_ENV=development
```

## 🔍 Verificar Configuração

```powershell
# Ver configuração atual
Get-Content .env | Select-String "SQLSERVER"
```

## 🌐 Acessar o Sistema

Após iniciar, acesse:

- **http://localhost** (se porta 80)
- **http://localhost:3000** (se porta 3000)

## ⚠️ Importante

1. **Banco INSP**: O sistema usa o banco `SGSB`
2. **Banco HIDRO**: O sistema HIDRO usa o banco `SGSB_2` (separado)
3. **Tabela**: Certifique-se de que a tabela `caracterizacaoBarragem` existe no banco `SGSB`

## 🛑 Parar o Sistema

Pressione `Ctrl+C` no terminal ou:

```powershell
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force
```

## 📝 Notas

- O sistema roda **localmente** mas acessa o **banco online**
- Se o banco estiver offline, o sistema não funcionará
- As alterações são feitas diretamente no banco online
- Use com cuidado em produção!




