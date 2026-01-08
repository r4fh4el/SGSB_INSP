# ⚠️ IMPORTANTE: Netlify e Servidor Express

## 🚨 Problema

O **Netlify não suporta servidores Node.js/Express tradicionais**. Seu sistema usa:
- ✅ **Frontend**: React/Vite (pode ir no Netlify)
- ❌ **Backend**: Express + tRPC + SQL Server (NÃO funciona no Netlify tradicional)

O Netlify só suporta:
- Arquivos estáticos (frontend)
- Netlify Functions (serverless, limitado a 10s de execução)

## 📋 Opções de Deploy

### **Opção 1: Vercel (RECOMENDADO)** ⭐

O Vercel suporta servidores Node.js completos e é mais fácil de configurar.

#### Configuração no Vercel:

1. **Crie `vercel.json` na raiz do projeto:**

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/node"
    },
    {
      "src": "client/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server/_core/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "/dist/public/$1"
    }
  ]
}
```

2. **Comandos de Build no Vercel:**
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist/public`
   - **Install Command**: `npm install`

3. **Variáveis de Ambiente no Vercel:**
   - Configure todas as variáveis necessárias (SQL Server, OAuth, Forge API, etc.)

---

### **Opção 2: Railway** 🚂

Railway suporta Node.js completo e é muito simples.

#### Configuração:

1. **Crie `railway.json` (opcional):**

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

2. **Comandos:**
   - Railway detecta automaticamente Node.js
   - Build: `npm run build`
   - Start: `npm start`

---

### **Opção 3: Render** 🎨

Render também suporta Node.js completo.

#### Configuração:

1. **Crie `render.yaml` (opcional):**

```yaml
services:
  - type: web
    name: sgsb-inspecao
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
```

2. **No painel do Render:**
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

---

### **Opção 4: Netlify (APENAS FRONTEND)** ⚠️

Se quiser usar Netlify, você precisaria:

1. **Separar frontend e backend**
2. **Deployar backend em outra plataforma** (Railway, Render, etc.)
3. **Configurar CORS e variáveis de ambiente**

#### Configuração Netlify (só frontend):

1. **Crie `netlify.toml`:**

```toml
[build]
  command = "npm run build"
  publish = "dist/public"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/api/*"
  to = "https://seu-backend.railway.app/api/:splat"
  status = 200
  force = true

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

2. **Comandos no Netlify:**
   - **Build command**: `npm run build`
   - **Publish directory**: `dist/public`

3. **Variáveis de Ambiente:**
   - `VITE_API_URL` = URL do seu backend (ex: `https://seu-backend.railway.app`)

---

## 🎯 RECOMENDAÇÃO FINAL

### **Use Vercel ou Railway** porque:

✅ Suportam Node.js completo  
✅ Fácil configuração  
✅ Deploy automático do GitHub  
✅ SSL/HTTPS automático  
✅ Variáveis de ambiente fáceis  

### **Evite Netlify** porque:

❌ Não suporta servidores Express  
❌ Netlify Functions têm limite de 10s  
❌ Requer refatoração complexa  

---

## 📝 Passo a Passo Recomendado (Vercel)

### 1. Criar arquivo `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server/_core/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "/dist/public/$1"
    }
  ]
}
```

### 2. Ajustar `package.json` para Vercel:

Adicione um script específico:

```json
{
  "scripts": {
    "vercel-build": "npm run build"
  }
}
```

### 3. No Vercel Dashboard:

- **Framework Preset**: Other
- **Build Command**: `npm run build`
- **Output Directory**: `dist/public`
- **Install Command**: `npm install`

### 4. Variáveis de Ambiente no Vercel:

Configure todas as variáveis:
- `SQLSERVER_SERVER`
- `SQLSERVER_DATABASE`
- `OAUTH_SERVER_URL`
- `VITE_APP_ID`
- `JWT_SECRET`
- `BUILT_IN_FORGE_API_URL`
- `BUILT_IN_FORGE_API_KEY`
- etc.

---

## 🔧 Alternativa: Adaptar para Netlify Functions

Se realmente precisar usar Netlify, seria necessário:

1. Converter todas as rotas Express em Netlify Functions
2. Adaptar tRPC para trabalhar com serverless
3. Limitar execuções a 10 segundos
4. Refatorar conexões SQL Server (pooling não funciona bem)

**Isso é MUITO trabalhoso e não recomendado.**

---

## ✅ Solução Mais Simples

**Use Railway ou Render** - são as mais fáceis para seu caso:

1. Conecte seu repositório GitHub
2. Configure variáveis de ambiente
3. Deploy automático!

**Railway**: https://railway.app  
**Render**: https://render.com  
**Vercel**: https://vercel.com

