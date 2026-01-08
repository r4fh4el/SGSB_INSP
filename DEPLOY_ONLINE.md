# 🚀 Guia de Deploy Online - Sistema SGSB

## ✅ Sistema está pronto para deploy!

## 🎯 Opção 1: Railway (RECOMENDADO - Mais Fácil)

### Passo a Passo:

1. **Acesse**: https://railway.app
2. **Crie conta** (pode usar GitHub)
3. **New Project** → **Deploy from GitHub repo**
4. **Selecione seu repositório** `SGSB_INSP_SQL`
5. **Railway detecta automaticamente**:
   - ✅ Build Command: `npm install && npm run build`
   - ✅ Start Command: `npm start`
6. **Configure variáveis de ambiente** (Settings → Variables):

```env
NODE_ENV=production
PORT=3000

# SQL Server (seu banco online)
SQLSERVER_SERVER=seu-servidor-sql.database.windows.net
SQLSERVER_DATABASE=sgsb
SQLSERVER_USER=seu-usuario
SQLSERVER_PASSWORD=sua-senha
SQLSERVER_TRUSTED_CONNECTION=false
SQLSERVER_PORT=1433

# OAuth (se usar)
OAUTH_SERVER_URL=https://seu-oauth.com
VITE_APP_ID=seu-app-id
JWT_SECRET=sua-chave-secreta-forte-aleatoria
OWNER_OPEN_ID=id-do-proprietario

# Forge API (para upload de arquivos)
BUILT_IN_FORGE_API_URL=https://api.forge.com
BUILT_IN_FORGE_API_KEY=sua-api-key

# Opcional
SKIP_AUTH=false
```

7. **Deploy automático!** ✅
8. **Railway gera URL automática**: `https://seu-projeto.railway.app`

---

## 🎯 Opção 2: Render (Muito Simples)

### Passo a Passo:

1. **Acesse**: https://render.com
2. **Crie conta** (pode usar GitHub)
3. **New** → **Web Service**
4. **Connect GitHub** → Selecione `SGSB_INSP_SQL`
5. **Configure**:
   - **Name**: `sgsb-inspecao`
   - **Environment**: `Node`
   - **Region**: Escolha mais próxima
   - **Branch**: `main` ou `master`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free (com limitações) ou Paid
6. **Adicione variáveis de ambiente** (Environment):
   - Mesmas variáveis do Railway acima
7. **Create Web Service** ✅
8. **Render gera URL**: `https://sgsb-inspecao.onrender.com`

---

## 🎯 Opção 3: Vercel (Funciona, mas requer ajustes)

### Passo a Passo:

1. **Acesse**: https://vercel.com
2. **Crie conta** (pode usar GitHub)
3. **New Project** → Importe `SGSB_INSP_SQL`
4. **Configure**:
   - **Framework Preset**: Other
   - **Root Directory**: `SGSB`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist/public`
   - **Install Command**: `npm install`
5. **Adicione variáveis de ambiente**
6. **Deploy!** ✅

---

## 📋 Checklist ANTES do Deploy

### ✅ Verificar Localmente:

```bash
# 1. Testar build
cd SGSB
npm run build

# 2. Testar produção local
npm start

# 3. Verificar se funciona em http://localhost:3000
```

### ✅ Configurar Variáveis de Ambiente:

Todas as variáveis devem estar configuradas na plataforma escolhida.

### ✅ SQL Server Online:

Se seu SQL Server está online, certifique-se:
- ✅ Porta 1433 aberta (ou porta configurada)
- ✅ Firewall configurado para permitir conexões
- ✅ Autenticação SQL habilitada (não apenas Windows)
- ✅ Usuário e senha configurados

---

## 🔧 Configuração do SQL Server Online

Se você está usando SQL Server online (Azure, AWS RDS, etc.):

### Para Azure SQL Database:
```env
SQLSERVER_SERVER=seu-servidor.database.windows.net
SQLSERVER_DATABASE=sgsb
SQLSERVER_USER=seu-usuario@seu-servidor
SQLSERVER_PASSWORD=sua-senha
SQLSERVER_TRUSTED_CONNECTION=false
SQLSERVER_PORT=1433
SQLSERVER_DRIVER=msnodesqlv8
```

### Para SQL Server em VM/Cloud:
```env
SQLSERVER_SERVER=IP_OU_DOMINIO,1433
SQLSERVER_DATABASE=sgsb
SQLSERVER_USER=sa
SQLSERVER_PASSWORD=sua-senha
SQLSERVER_TRUSTED_CONNECTION=false
SQLSERVER_PORT=1433
```

---

## 🚨 Problemas Comuns

### 1. Erro de Conexão SQL Server:
- ✅ Verifique se o servidor está acessível da internet
- ✅ Verifique firewall e portas
- ✅ Use autenticação SQL (não Windows)
- ✅ Teste conexão com SQL Server Management Studio

### 2. Build Falha:
- ✅ Verifique logs de build na plataforma
- ✅ Certifique-se que `npm run build` funciona localmente
- ✅ Verifique se todas as dependências estão no `package.json`

### 3. Aplicação não inicia:
- ✅ Verifique logs na plataforma
- ✅ Certifique-se que `npm start` funciona localmente
- ✅ Verifique variáveis de ambiente

### 4. Upload de arquivos não funciona:
- ✅ Configure `BUILT_IN_FORGE_API_URL` e `BUILT_IN_FORGE_API_KEY`
- ✅ Ou use storage alternativo (S3, etc.)

---

## 📝 Após o Deploy

1. ✅ Teste acesso à aplicação
2. ✅ Teste login/autenticação
3. ✅ Teste conexão com banco (criar/ler dados)
4. ✅ Teste upload de documentos
5. ✅ Verifique logs para erros

---

## 🔗 Links Úteis

- **Railway**: https://railway.app
- **Render**: https://render.com
- **Vercel**: https://vercel.com
- **Railway Docs**: https://docs.railway.app
- **Render Docs**: https://render.com/docs

---

## 💡 Dica Final

**Recomendação**: Use **Railway** ou **Render** porque:
- ✅ Suportam Node.js completo
- ✅ Fácil configuração
- ✅ Deploy automático do GitHub
- ✅ SSL/HTTPS automático
- ✅ Sem necessidade de refatoração

Boa sorte com o deploy! 🚀



