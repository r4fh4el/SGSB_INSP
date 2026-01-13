# 🚀 Instruções Rápidas - Rodar SGSB_INSP

## ✅ Status Atual

- ✅ Node.js instalado (v22.16.0)
- ✅ pnpm disponível (via npx)
- ✅ Arquivo .env existe
- ⚠️  Dependências podem precisar ser instaladas

## 🎯 Solução Rápida (3 passos)

### 1. Navegar para o diretório

```powershell
cd E:\SGSB-master\SGSB_INSP
```

### 2. Instalar dependências (se necessário)

```powershell
npx --yes pnpm install
```

**OU** se o pnpm estiver no PATH:

```powershell
pnpm install
```

### 3. Rodar o sistema

**Modo Desenvolvimento (recomendado para testar):**
```powershell
npx --yes pnpm dev
```

**OU:**
```powershell
pnpm dev
```

## 📋 Usando o Script Automatizado

Execute o script que criamos:

```powershell
cd E:\SGSB-master\SGSB_INSP
.\rodar-sgsb-insp.ps1
```

Este script faz tudo automaticamente:
- ✅ Verifica Node.js e pnpm
- ✅ Instala pnpm se necessário
- ✅ Verifica/cria .env
- ✅ Instala dependências
- ✅ Inicia o sistema

## ⚙️ Verificar Configuração do .env

O arquivo `.env` precisa ter as configurações do SQL Server. Verifique se tem:

```env
SQLSERVER_SERVER=108.181.193.92,15000
SQLSERVER_DATABASE=sgsb_insp
SQLSERVER_USER=sa
SQLSERVER_PASSWORD=SenhaNova@123
SQLSERVER_TRUSTED_CONNECTION=false
```

Se não tiver, execute:

```powershell
.\configurar-sql-online.ps1
```

## 🌐 URLs de Acesso

Após iniciar:

- **Desenvolvimento:**
  - Frontend: http://localhost:5173
  - Backend: http://localhost:3000

- **Produção:**
  - Sistema: http://localhost:3000 (ou porta configurada)

## ❌ Problemas?

### "pnpm não encontrado"
Use: `npx --yes pnpm` em vez de `pnpm`

### "Erro ao conectar SQL Server"
1. Verifique se o servidor está online
2. Verifique as credenciais no `.env`
3. Teste a conexão manualmente

### "Porta já em uso"
Edite o `.env` e mude a porta:
```env
PORT=3001
```

## 📞 Mais Ajuda

Consulte: `GUIA_SOLUCAO_PROBLEMAS.md`

