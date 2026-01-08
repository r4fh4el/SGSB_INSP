# 🚀 Deploy Online - Guia Rápido

## ✅ Sistema Pronto para Deploy!

Seu sistema está configurado e funcionando. Agora é só fazer o deploy!

---

## 🎯 Opção 1: Railway (MAIS FÁCIL - RECOMENDADO)

### ⚡ Passo a Passo Rápido:

1. **Acesse**: https://railway.app
2. **Login com GitHub**
3. **New Project** → **Deploy from GitHub repo**
4. **Selecione**: `SGSB_INSP_SQL`
5. **Railway detecta automaticamente** ✅
6. **Adicione variáveis de ambiente** (Settings → Variables):

```env
NODE_ENV=production
PORT=3000

# SQL Server Online
SQLSERVER_SERVER=seu-servidor.database.windows.net
SQLSERVER_DATABASE=sgsb
SQLSERVER_USER=seu-usuario
SQLSERVER_PASSWORD=sua-senha
SQLSERVER_TRUSTED_CONNECTION=false
SQLSERVER_PORT=1433

# OAuth (se usar)
OAUTH_SERVER_URL=https://seu-oauth.com
VITE_APP_ID=seu-app-id
JWT_SECRET=gerar-chave-aleatoria-forte
OWNER_OPEN_ID=id-proprietario

# Forge API (upload arquivos)
BUILT_IN_FORGE_API_URL=https://api.forge.com
BUILT_IN_FORGE_API_KEY=sua-api-key
```

7. **Deploy automático!** ✅
8. **URL gerada**: `https://seu-projeto.railway.app`

---

## 🎯 Opção 2: Render

### ⚡ Passo a Passo Rápido:

1. **Acesse**: https://render.com
2. **Login com GitHub**
3. **New** → **Web Service**
4. **Connect GitHub** → `SGSB_INSP_SQL`
5. **Configure**:
   - **Name**: `sgsb-inspecao`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
6. **Adicione variáveis de ambiente** (mesmas do Railway)
7. **Create Web Service** ✅
8. **URL gerada**: `https://sgsb-inspecao.onrender.com`

---

## 📋 Variáveis de Ambiente Obrigatórias

### Mínimas para funcionar:

```env
NODE_ENV=production
PORT=3000
SQLSERVER_SERVER=seu-servidor
SQLSERVER_DATABASE=sgsb
SQLSERVER_USER=usuario
SQLSERVER_PASSWORD=senha
SQLSERVER_TRUSTED_CONNECTION=false
```

### Completas (recomendado):

```env
NODE_ENV=production
PORT=3000

# SQL Server
SQLSERVER_SERVER=seu-servidor.database.windows.net
SQLSERVER_DATABASE=sgsb
SQLSERVER_USER=usuario
SQLSERVER_PASSWORD=senha
SQLSERVER_TRUSTED_CONNECTION=false
SQLSERVER_PORT=1433

# OAuth
OAUTH_SERVER_URL=https://seu-oauth.com
VITE_APP_ID=seu-app-id
JWT_SECRET=chave-aleatoria-forte
OWNER_OPEN_ID=id-proprietario

# Forge API
BUILT_IN_FORGE_API_URL=https://api.forge.com
BUILT_IN_FORGE_API_KEY=sua-api-key
```

---

## 🔧 Configuração SQL Server Online

### Para Azure SQL Database:
```env
SQLSERVER_SERVER=seu-servidor.database.windows.net
SQLSERVER_DATABASE=sgsb
SQLSERVER_USER=usuario@servidor
SQLSERVER_PASSWORD=senha
SQLSERVER_TRUSTED_CONNECTION=false
SQLSERVER_PORT=1433
```

### Para SQL Server em VM/Cloud:
```env
SQLSERVER_SERVER=IP_OU_DOMINIO,1433
SQLSERVER_DATABASE=sgsb
SQLSERVER_USER=sa
SQLSERVER_PASSWORD=senha
SQLSERVER_TRUSTED_CONNECTION=false
SQLSERVER_PORT=1433
```

---

## ✅ Testar Localmente Antes

```bash
# 1. Build
cd SGSB
npm run build

# 2. Testar produção
npm start

# 3. Acessar
# http://localhost:3000
```

---

## 🚨 Problemas Comuns

### ❌ Erro de Conexão SQL Server:
- ✅ Verifique se servidor está acessível da internet
- ✅ Firewall permitindo porta 1433
- ✅ Use autenticação SQL (não Windows)
- ✅ Teste com SQL Server Management Studio

### ❌ Build Falha:
- ✅ Verifique logs na plataforma
- ✅ Teste `npm run build` localmente
- ✅ Verifique dependências no `package.json`

### ❌ Aplicação não inicia:
- ✅ Verifique logs na plataforma
- ✅ Teste `npm start` localmente
- ✅ Verifique todas as variáveis de ambiente

---

## 📝 Checklist Final

- [ ] Build funciona localmente (`npm run build`)
- [ ] Produção funciona localmente (`npm start`)
- [ ] SQL Server acessível da internet
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy feito na plataforma escolhida
- [ ] Testado acesso à aplicação
- [ ] Testado login/autenticação
- [ ] Testado conexão com banco

---

## 🎉 Pronto!

Seu sistema está configurado e pronto para deploy online!

**Recomendação**: Use **Railway** - é o mais fácil e funciona perfeitamente! 🚀



