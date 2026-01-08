# 🚀 Como Fazer Deploy Online - Passo a Passo

## ✅ Sistema está PRONTO para deploy!

O build foi testado e está funcionando. Agora é só escolher uma plataforma e fazer o deploy!

---

## 🥇 OPÇÃO 1: Railway (MAIS FÁCIL - RECOMENDADO)

### ⚡ 5 Minutos para Deploy:

1. **Acesse**: https://railway.app
2. **Login com GitHub**
3. **New Project** → **Deploy from GitHub repo**
4. **Selecione**: `SGSB_INSP_SQL`
5. **Railway detecta automaticamente** ✅
   - Build: `npm install && npm run build`
   - Start: `npm start`
6. **Settings** → **Variables** → Adicione:

```env
NODE_ENV=production
PORT=3000

SQLSERVER_SERVER=seu-servidor.database.windows.net
SQLSERVER_DATABASE=sgsb
SQLSERVER_USER=usuario
SQLSERVER_PASSWORD=senha
SQLSERVER_TRUSTED_CONNECTION=false
SQLSERVER_PORT=1433

OAUTH_SERVER_URL=https://seu-oauth.com
VITE_APP_ID=seu-app-id
JWT_SECRET=chave-aleatoria-forte
OWNER_OPEN_ID=id-proprietario

BUILT_IN_FORGE_API_URL=https://api.forge.com
BUILT_IN_FORGE_API_KEY=sua-api-key
```

7. **Deploy automático!** ✅
8. **URL gerada**: `https://seu-projeto.railway.app`

---

## 🥈 OPÇÃO 2: Render

### ⚡ 5 Minutos para Deploy:

1. **Acesse**: https://render.com
2. **Login com GitHub**
3. **New** → **Web Service**
4. **Connect GitHub** → `SGSB_INSP_SQL`
5. **Configure**:
   - Name: `sgsb-inspecao`
   - Environment: `Node`
   - Build: `npm install && npm run build`
   - Start: `npm start`
6. **Environment** → Adicione as mesmas variáveis do Railway
7. **Create Web Service** ✅
8. **URL gerada**: `https://sgsb-inspecao.onrender.com`

---

## 🔧 Configuração SQL Server Online

### Se seu SQL Server está online (Azure, AWS, etc.):

```env
# Azure SQL Database
SQLSERVER_SERVER=seu-servidor.database.windows.net
SQLSERVER_DATABASE=sgsb
SQLSERVER_USER=usuario@servidor
SQLSERVER_PASSWORD=senha
SQLSERVER_TRUSTED_CONNECTION=false
SQLSERVER_PORT=1433

# OU SQL Server em VM/Cloud
SQLSERVER_SERVER=IP_OU_DOMINIO,1433
SQLSERVER_DATABASE=sgsb
SQLSERVER_USER=sa
SQLSERVER_PASSWORD=senha
SQLSERVER_TRUSTED_CONNECTION=false
SQLSERVER_PORT=1433
```

---

## ✅ Checklist Antes do Deploy

- [x] Build funciona (`npm run build` ✅)
- [x] Produção funciona (`npm start` ✅)
- [ ] SQL Server acessível da internet
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy feito na plataforma

---

## 🎯 Após o Deploy

1. ✅ Teste acesso à aplicação
2. ✅ Teste login/autenticação
3. ✅ Teste criar/ler documentos
4. ✅ Teste upload de arquivos
5. ✅ Verifique logs para erros

---

## 🚨 Problemas?

### Erro de Conexão SQL Server:
- ✅ Verifique se servidor está acessível da internet
- ✅ Firewall permitindo porta 1433
- ✅ Use autenticação SQL (não Windows)

### Build Falha:
- ✅ Verifique logs na plataforma
- ✅ Teste `npm run build` localmente

### Aplicação não inicia:
- ✅ Verifique logs na plataforma
- ✅ Verifique todas as variáveis de ambiente

---

## 🎉 Pronto!

**Recomendação**: Use **Railway** - é o mais fácil! 🚀

Seu sistema está 100% pronto para deploy online!



