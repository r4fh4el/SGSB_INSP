# 🚀 Guia de Deploy - Sistema SGSB Inspeção

## ⚠️ IMPORTANTE: Netlify não suporta servidores Express

O Netlify **NÃO funciona** para seu sistema porque:
- ❌ Não suporta servidores Node.js/Express tradicionais
- ❌ Netlify Functions têm limite de 10 segundos
- ❌ Requer refatoração completa do código

## ✅ PLATAFORMAS RECOMENDADAS

### 🥇 **1. Railway** (MAIS FÁCIL)

#### Passo a Passo:

1. **Acesse**: https://railway.app
2. **Crie conta** (pode usar GitHub)
3. **New Project** → **Deploy from GitHub repo**
4. **Selecione seu repositório**
5. **Configure variáveis de ambiente**:
   ```
   NODE_ENV=production
   SQLSERVER_SERVER=seu-servidor
   SQLSERVER_DATABASE=sgsb
   SQLSERVER_TRUSTED_CONNECTION=true
   OAUTH_SERVER_URL=https://seu-oauth.com
   VITE_APP_ID=seu-app-id
   JWT_SECRET=sua-chave-secreta
   BUILT_IN_FORGE_API_URL=https://api.forge.com
   BUILT_IN_FORGE_API_KEY=sua-api-key
   PORT=3000
   ```
6. **Railway detecta automaticamente**:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
7. **Deploy automático!** ✅

#### Comandos no Railway:
- **Build**: `npm install && npm run build`
- **Start**: `npm start`

---

### 🥈 **2. Render** (MUITO SIMPLES)

#### Passo a Passo:

1. **Acesse**: https://render.com
2. **Crie conta** (pode usar GitHub)
3. **New** → **Web Service**
4. **Connect GitHub** → Selecione seu repositório
5. **Configure**:
   - **Name**: `sgsb-inspecao`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free ou Paid
6. **Adicione variáveis de ambiente** (mesmas do Railway)
7. **Deploy!** ✅

---

### 🥉 **3. Vercel** (Funciona, mas requer ajustes)

O Vercel também tem limitações com Express, mas pode funcionar com adaptações.

#### Configuração:

1. **No Vercel Dashboard**:
   - Framework: **Other**
   - Build Command: `npm run build`
   - Output Directory: `dist/public`
   - Install Command: `npm install`

2. **Variáveis de ambiente**: Configure todas

3. **⚠️ Limitação**: Pode precisar ajustar para serverless functions

---

## 📋 COMANDOS PARA NETLIFY (APENAS FRONTEND)

Se você **realmente** quiser usar Netlify, você precisará:

### 1. Separar Frontend e Backend

- **Frontend no Netlify**
- **Backend no Railway/Render**

### 2. Configuração Netlify:

**No painel do Netlify, configure:**

- **Build command**: `npm run build`
- **Publish directory**: `dist/public`
- **Base directory**: (deixe vazio)

**Variáveis de ambiente no Netlify:**
```
VITE_API_URL=https://seu-backend.railway.app
```

### 3. Arquivo `netlify.toml` (já criado):

O arquivo já está configurado. Você só precisa:
- Atualizar a URL do backend no `netlify.toml`
- Configurar `VITE_API_URL` no Netlify

---

## 🎯 RECOMENDAÇÃO FINAL

### **Use Railway ou Render** porque:

✅ Suportam Node.js completo  
✅ Fácil configuração  
✅ Deploy automático do GitHub  
✅ SSL/HTTPS automático  
✅ Variáveis de ambiente fáceis  
✅ Sem necessidade de refatoração  

### **Evite Netlify** porque:

❌ Não suporta servidores Express  
❌ Requer separar frontend/backend  
❌ Mais complexo de configurar  

---

## 📝 Checklist de Deploy

### Antes de fazer deploy:

- [ ] Todas as variáveis de ambiente configuradas
- [ ] SQL Server acessível da internet (ou use VPN/tunnel)
- [ ] Build local funciona (`npm run build`)
- [ ] Testado localmente (`npm start`)
- [ ] CORS configurado (se frontend/backend separados)

### Após deploy:

- [ ] Testar acesso à aplicação
- [ ] Testar autenticação OAuth
- [ ] Testar conexão com SQL Server
- [ ] Verificar logs de erro
- [ ] Configurar domínio personalizado (opcional)

---

## 🔧 Variáveis de Ambiente Necessárias

```env
# Servidor
NODE_ENV=production
PORT=3000

# SQL Server
SQLSERVER_SERVER=seu-servidor\SQLEXPRESS
SQLSERVER_DATABASE=sgsb
SQLSERVER_TRUSTED_CONNECTION=true
# OU (se usar autenticação SQL):
# SQLSERVER_USER=usuario
# SQLSERVER_PASSWORD=senha

# OAuth
OAUTH_SERVER_URL=https://seu-servidor-oauth.com
VITE_APP_ID=seu-app-id
JWT_SECRET=sua-chave-secreta-forte
OWNER_OPEN_ID=id-do-proprietario

# Forge API
BUILT_IN_FORGE_API_URL=https://api.forge.com
BUILT_IN_FORGE_API_KEY=sua-api-key

# Opcional
DATABASE_URL=postgresql://... (se usar Prisma)
SKIP_AUTH=false
```

---

## 🚀 Comandos Rápidos

### Railway:
```bash
# Apenas conecte o repositório no Railway
# Ele detecta automaticamente!
```

### Render:
```bash
# Apenas conecte o repositório no Render
# Configure os comandos:
# Build: npm install && npm run build
# Start: npm start
```

### Netlify (só frontend):
```bash
# Build command: npm run build
# Publish: dist/public
# Variável: VITE_API_URL=https://seu-backend.railway.app
```

---

## 📞 Precisa de Ajuda?

- **Railway Docs**: https://docs.railway.app
- **Render Docs**: https://render.com/docs
- **Netlify Docs**: https://docs.netlify.com

