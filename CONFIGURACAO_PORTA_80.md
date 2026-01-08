# 🔧 Configuração para Porta 80

## ✅ Servidor Configurado para Porta 80

O servidor está configurado para rodar na porta 80 por padrão no IP `72.62.12.84`.

---

## 🚀 Como Iniciar o Servidor

### Opção 1: Com privilégios de root (Recomendado)

```bash
cd SGSB
sudo npm start
```

**Nota:** A porta 80 requer privilégios de root no Linux. Use `sudo` para iniciar.

### Opção 2: Usando um usuário com permissões (Recomendado para produção)

Configure o sistema para permitir que o Node.js use a porta 80 sem root:

```bash
# Instalar authbind (Ubuntu/Debian)
sudo apt-get install authbind

# Permitir porta 80 para seu usuário
sudo touch /etc/authbind/byport/80
sudo chmod 500 /etc/authbind/byport/80
sudo chown seu-usuario /etc/authbind/byport/80

# Iniciar com authbind
cd SGSB
authbind --deep npm start
```

### Opção 3: Usar Proxy Reverso (Nginx) - MAIS SEGURO

Esta é a melhor opção para produção:

1. **Instalar Nginx:**
```bash
sudo apt-get update
sudo apt-get install nginx
```

2. **Configurar Nginx:**
Crie o arquivo `/etc/nginx/sites-available/sgsb`:

```nginx
server {
    listen 80;
    server_name 72.62.12.84;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

3. **Ativar o site:**
```bash
sudo ln -s /etc/nginx/sites-available/sgsb /etc/nginx/sites-enabled/
sudo nginx -t  # Testar configuração
sudo systemctl restart nginx
```

4. **Configurar o servidor Node.js para porta 3000:**
```bash
# No arquivo .env
PORT=3000
```

5. **Iniciar o servidor Node.js:**
```bash
cd SGSB
npm start
```

---

## 📝 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto `SGSB/`:

```env
# Servidor
NODE_ENV=production
PORT=80
HOST=0.0.0.0
PUBLIC_IP=72.62.12.84

# SQL Server
SQLSERVER_SERVER=seu-servidor\SQLEXPRESS
SQLSERVER_DATABASE=sgsb
SQLSERVER_TRUSTED_CONNECTION=true
# OU
# SQLSERVER_USER=usuario
# SQLSERVER_PASSWORD=senha
# SQLSERVER_TRUSTED_CONNECTION=false

# OAuth (se usar)
OAUTH_SERVER_URL=https://seu-oauth.com
VITE_APP_ID=seu-app-id
JWT_SECRET=sua-chave-secreta-forte
OWNER_OPEN_ID=id-proprietario

# Forge API (se usar)
BUILT_IN_FORGE_API_URL=https://api.forge.com
BUILT_IN_FORGE_API_KEY=sua-api-key
```

---

## 🔍 Verificar se está Funcionando

### 1. Testar Health Check:
```bash
curl http://72.62.12.84/api/health
```

Deve retornar:
```json
{"status":"ok","timestamp":"..."}
```

### 2. Testar no Navegador:
Acesse: `http://72.62.12.84`

### 3. Verificar Logs:
O servidor deve mostrar:
```
🚀 Server running on http://0.0.0.0:80/
📱 Local access: http://localhost:80/
🌐 Public access: http://72.62.12.84:80/
```

---

## 🔒 Segurança e Firewall

### Abrir Porta 80 no Firewall:

**UFW (Ubuntu):**
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp  # Se usar HTTPS depois
sudo ufw status
```

**Firewalld (CentOS/RHEL):**
```bash
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

---

## 🚨 Problemas Comuns

### Erro: "EACCES: permission denied"

**Solução:** Use `sudo` ou configure authbind (veja Opção 2 acima)

### Erro: "Port 80 is already in use"

**Solução:** Verifique se outro serviço está usando a porta:
```bash
sudo netstat -tulpn | grep :80
sudo lsof -i :80
```

Se for Nginx ou Apache, use a Opção 3 (Proxy Reverso).

### Erro: "Cannot connect to server"

**Solução:**
1. Verifique o firewall
2. Verifique se o servidor está rodando: `ps aux | grep node`
3. Teste localmente: `curl http://localhost:80/api/health`

---

## 📌 Recomendação

**Para produção, use a Opção 3 (Nginx como Proxy Reverso):**
- ✅ Mais seguro
- ✅ Não requer privilégios de root para Node.js
- ✅ Permite adicionar SSL/HTTPS facilmente depois
- ✅ Melhor performance
- ✅ Fácil de configurar certificados Let's Encrypt

---

## 🔐 Próximos Passos (Opcional)

Depois de configurar, considere:
1. **Adicionar SSL/HTTPS** com Let's Encrypt
2. **Configurar domínio** ao invés de IP
3. **Configurar PM2** para gerenciar o processo Node.js
4. **Configurar logs** e monitoramento



