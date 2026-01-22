# 🔧 Correções Necessárias no .env Online

## ❌ Problemas Identificados

### 1. HIDRO_API_URL com caminho incorreto
```env
# ❌ ERRADO
HIDRO_API_URL=http://72.60.57.220:5204/swagger/

# ✅ CORRETO
HIDRO_API_URL=http://72.60.57.220:5204
```

O `/swagger/` não deve estar na URL base. O código adiciona os caminhos automaticamente.

---

## ✅ .env Corrigido

```env
SQLSERVER_SERVER=108.181.193.92,15000
SQLSERVER_DATABASE=sgsb_insp
SQLSERVER_USER=sa
SQLSERVER_PASSWORD=SenhaNova@123
SQLSERVER_TRUSTED_CONNECTION=false
SQLSERVER_ODBC_DRIVER=ODBC Driver 17 for SQL Server

# Servidor
NODE_ENV=production
PORT=80
HOST=0.0.0.0
PUBLIC_IP=72.62.12.84

# Integração SGSB-WEB
HIDRO_API_URL=http://72.60.57.220:5204
VITE_SGSB_FINAL_API_URL=http://72.60.57.220:5204

# Integração SGSB-ALERTA
VITE_SGSB_ALERTA_API_URL=http://72.60.57.220:61400
```

---

## 🔍 Verificações Adicionais

### 1. Verificar se o servidor está rodando
```bash
# No servidor online
ps aux | grep node
# ou
netstat -tulpn | grep :80
```

### 2. Verificar se a porta 80 está acessível
```bash
# Testar do servidor
curl http://localhost:80/api/health

# Testar externamente
curl http://72.62.12.84/api/health
```

### 3. Verificar firewall
```bash
# Linux (UFW)
sudo ufw allow 80/tcp
sudo ufw status

# Linux (Firewalld)
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --reload
```

---

## 🚀 Após Corrigir

1. **Salvar o .env corrigido**
2. **Reiniciar o servidor Node.js:**
   ```bash
   # Se estiver usando PM2
   pm2 restart all
   
   # Ou parar e iniciar novamente
   npm run build
   npm start
   ```

3. **Verificar logs:**
   ```bash
   # PM2
   pm2 logs
   
   # Ou verificar o terminal onde está rodando
   ```

---

## 📝 Checklist

- [ ] Remover `/swagger/` do `HIDRO_API_URL`
- [ ] Verificar se `PORT=80` está correto
- [ ] Verificar se `HOST=0.0.0.0` está correto
- [ ] Servidor Node.js está rodando
- [ ] Porta 80 está acessível
- [ ] Firewall permite porta 80
- [ ] Servidor foi reiniciado após alterar .env



