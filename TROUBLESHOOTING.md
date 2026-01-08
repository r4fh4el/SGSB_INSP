# 🔧 Guia de Troubleshooting - Erros de Conexão

## ❌ Erro: `ERR_CONNECTION_TIMED_OUT`

Este erro indica que o cliente não consegue se conectar ao servidor. Siga os passos abaixo:

---

## ✅ Checklist de Diagnóstico

### 1. **Verificar se o servidor está rodando**

```bash
# No servidor, verifique se o processo está ativo
ps aux | grep node
# ou
netstat -tulpn | grep :3000
```

### 2. **Verificar logs do servidor**

O servidor deve mostrar:
```
🚀 Server running on http://0.0.0.0:3000/
📱 Access it at: http://localhost:3000/
🌐 Public URL: https://seu-dominio.com
```

### 3. **Testar endpoint de health check**

Acesse no navegador ou via curl:
```bash
curl https://seu-dominio.com/api/health
```

Deve retornar:
```json
{"status":"ok","timestamp":"2024-01-01T00:00:00.000Z"}
```

### 4. **Verificar variáveis de ambiente**

Certifique-se de que as seguintes variáveis estão configuradas:

```env
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# SQL Server
SQLSERVER_SERVER=seu-servidor.database.windows.net
SQLSERVER_DATABASE=sgsb
SQLSERVER_USER=usuario
SQLSERVER_PASSWORD=senha
SQLSERVER_TRUSTED_CONNECTION=false
SQLSERVER_PORT=1433
```

### 5. **Verificar firewall/portas**

- **Railway/Render**: As portas são abertas automaticamente
- **VPS/Servidor próprio**: Certifique-se de que a porta 3000 (ou a configurada) está aberta

```bash
# Testar se a porta está acessível
curl http://seu-ip:3000/api/health
```

### 6. **Verificar URL da API no cliente**

Se o frontend e backend estão em servidores diferentes, configure:

```env
VITE_API_URL=https://seu-backend.railway.app
```

Ou no arquivo `.env`:
```env
VITE_API_URL=https://seu-backend.railway.app
```

---

## 🔍 Soluções Comuns

### Problema 1: Servidor não está rodando

**Solução:**
```bash
# No servidor, inicie o servidor
cd SGSB
npm start
```

### Problema 2: Frontend e Backend em servidores diferentes

**Solução:**
Configure `VITE_API_URL` no frontend:

**Railway:**
1. Vá em Settings → Variables
2. Adicione: `VITE_API_URL=https://seu-backend.railway.app`
3. Faça rebuild

**Render:**
1. Vá em Environment
2. Adicione: `VITE_API_URL=https://seu-backend.onrender.com`
3. Faça rebuild

### Problema 3: CORS (se frontend e backend em domínios diferentes)

Se você separou frontend e backend, adicione CORS:

```bash
npm install cors
npm install --save-dev @types/cors
```

E no `server/_core/index.ts`:
```typescript
import cors from "cors";

app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  credentials: true
}));
```

### Problema 4: Build não foi feito

**Solução:**
```bash
cd SGSB
npm run build
npm start
```

### Problema 5: Porta incorreta

**Solução:**
Verifique a variável `PORT`:
```env
PORT=3000
```

E verifique se a plataforma está usando a porta correta:
- **Railway**: Usa `PORT` automaticamente
- **Render**: Usa `PORT` automaticamente
- **VPS**: Configure manualmente

---

## 🧪 Testes Rápidos

### Teste 1: Health Check
```bash
curl https://seu-dominio.com/api/health
```

### Teste 2: tRPC Endpoint
```bash
curl https://seu-dominio.com/api/trpc/barragens.list
```

### Teste 3: Frontend
Acesse: `https://seu-dominio.com`

---

## 📞 Ainda com problemas?

1. **Verifique os logs do servidor** para erros específicos
2. **Verifique o console do navegador** (F12) para erros do cliente
3. **Teste o health check** para confirmar que o servidor está respondendo
4. **Verifique as variáveis de ambiente** na plataforma de deploy

---

## 🔗 Links Úteis

- **Railway Logs**: Dashboard → Seu Projeto → Deployments → Logs
- **Render Logs**: Dashboard → Seu Serviço → Logs
- **Documentação Railway**: https://docs.railway.app
- **Documentação Render**: https://render.com/docs



