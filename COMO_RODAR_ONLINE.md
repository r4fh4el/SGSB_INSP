# 🚀 Como Rodar o Sistema Online Após Clonar o Repositório

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- ✅ **Node.js** (versão 18 ou superior)
- ✅ **npm** ou **pnpm** (gerenciador de pacotes)
- ✅ **Git** (para clonar)
- ✅ **SQL Server** (banco de dados - pode ser online)

---

## 🔽 Passo 1: Clonar o Repositório

```bash
# Clonar o repositório
git clone https://github.com/r4fh4el/SGSB_INSP_SQL.git

# Entrar no diretório
cd SGSB_INSP_SQL/SGSB
```

---

## 📦 Passo 2: Instalar Dependências

```bash
# Usando npm (recomendado)
npm install

# OU usando pnpm (se preferir)
pnpm install
```

**⏱️ Tempo estimado:** 2-5 minutos (depende da conexão)

---

## ⚙️ Passo 3: Configurar Variáveis de Ambiente

### 3.1. Criar arquivo `.env`

```bash
# Copiar arquivo de exemplo
cp env.example.txt .env

# OU criar manualmente
touch .env
```

### 3.2. Editar arquivo `.env`

Abra o arquivo `.env` e configure:

#### **Para SQL Server Online (Recomendado):**

```env
# ============================================
# SERVIDOR
# ============================================
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
PUBLIC_IP=seu-ip-publico-aqui

# ============================================
# SQL SERVER ONLINE
# ============================================
SQLSERVER_SERVER=108.181.193.92,15000
SQLSERVER_PORT=15000
SQLSERVER_DATABASE=sgsb
SQLSERVER_USER=sa
SQLSERVER_PASSWORD=SenhaNova@123
SQLSERVER_TRUSTED_CONNECTION=false
SQLSERVER_DRIVER=msnodesqlv8
SQLSERVER_ODBC_DRIVER=ODBC Driver 17 for SQL Server

# ============================================
# OAUTH (Opcional - configure se usar)
# ============================================
OAUTH_SERVER_URL=https://vidabiz.butterfly-effect.dev
VITE_APP_ID=proj_abc123def456
JWT_SECRET=your-jwt-secret-change-in-production
OWNER_OPEN_ID=id-do-proprietario

# ============================================
# APLICAÇÃO (Opcional)
# ============================================
VITE_APP_TITLE=SGSB - Sistema de Gestão e Segurança de Barragem
VITE_APP_LOGO=/favicon.png
SKIP_AUTH=true
```

#### **Para SQL Server Local:**

```env
# SQL Server Local
SQLSERVER_SERVER=localhost\SQLEXPRESS
SQLSERVER_DATABASE=sgsb
SQLSERVER_TRUSTED_CONNECTION=true
```

**⚠️ IMPORTANTE:**
- Substitua `108.181.193.92,15000` pelo IP e porta do seu SQL Server
- Substitua `sa` e `SenhaNova@123` pelas suas credenciais
- Substitua `seu-ip-publico-aqui` pelo IP público do servidor

---

## 🗄️ Passo 4: Verificar Conexão com SQL Server

Antes de rodar, teste a conexão:

### **Windows:**
```cmd
sqlcmd -S 108.181.193.92,15000 -U sa -P SenhaNova@123 -d sgsb
```

### **Linux/Mac:**
```bash
# Instalar cliente SQL Server (se necessário)
# Ubuntu/Debian:
sudo apt-get install freetds-bin freetds-dev

# Testar conexão
tsql -S 108.181.193.92 -p 15000 -U sa -P SenhaNova@123
```

---

## 🔨 Passo 5: Build do Projeto

```bash
# Fazer build do projeto
npm run build
```

**⏱️ Tempo estimado:** 1-3 minutos

**O que acontece:**
- ✅ Build do frontend (Vite)
- ✅ Build do backend (esbuild)
- ✅ Arquivos gerados em `dist/`

**Verificar se build foi bem-sucedido:**
```bash
# Verificar se dist/public existe
ls -la dist/public

# Deve conter:
# - index.html
# - assets/ (com CSS e JS)
```

---

## 🚀 Passo 6: Rodar o Sistema

### **Opção A: Modo Produção (Recomendado)**

```bash
npm start
```

**O servidor iniciará e mostrará:**
```
🚀 Server running on http://0.0.0.0:3000/
📱 Local access: http://localhost:3000/
🌐 Public access: http://seu-ip:3000/
✅ Using build directory: /caminho/para/dist/public
```

### **Opção B: Modo Desenvolvimento (para testes)**

```bash
npm run dev
```

**Diferença:**
- **Produção (`npm start`):** Usa arquivos buildados, mais rápido
- **Desenvolvimento (`npm run dev`):** Hot reload, mais lento

---

## 🔍 Passo 7: Verificar se Está Funcionando

### **7.1. Testar Health Check**

```bash
# No terminal
curl http://localhost:3000/api/health

# Deve retornar:
# {"status":"ok","timestamp":"2024-..."}
```

### **7.2. Acessar no Navegador**

Abra no navegador:
- **Local:** http://localhost:3000
- **Público:** http://seu-ip-publico:3000

### **7.3. Verificar Logs**

O console deve mostrar:
```
[SQL Server] Connected to 108.181.193.92,15000/sgsb
🚀 Server running on http://0.0.0.0:3000/
✅ Using build directory: ...
```

---

## 🔒 Passo 8: Configurar Firewall (Se Necessário)

### **Linux (UFW):**
```bash
# Permitir porta 3000
sudo ufw allow 3000/tcp

# Verificar status
sudo ufw status
```

### **Windows:**
```powershell
# Abrir porta 3000 no Firewall do Windows
New-NetFirewallRule -DisplayName "SGSB App" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

---

## 🌐 Passo 9: Rodar na Porta 80 (Opcional)

Se quiser rodar na porta 80 (padrão HTTP):

### **Opção 1: Usar sudo (Linux)**
```bash
# Editar .env
PORT=80

# Rodar com sudo
sudo npm start
```

### **Opção 2: Usar Proxy Reverso (Nginx) - RECOMENDADO**

1. **Instalar Nginx:**
```bash
sudo apt-get update
sudo apt-get install nginx
```

2. **Configurar Nginx:**
```bash
sudo nano /etc/nginx/sites-available/sgsb
```

Adicione:
```nginx
server {
    listen 80;
    server_name seu-ip-ou-dominio;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

3. **Ativar site:**
```bash
sudo ln -s /etc/nginx/sites-available/sgsb /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

4. **Manter servidor Node.js na porta 3000:**
```env
# No .env
PORT=3000
```

---

## 📝 Resumo dos Comandos

```bash
# 1. Clonar
git clone https://github.com/r4fh4el/SGSB_INSP_SQL.git
cd SGSB_INSP_SQL/SGSB

# 2. Instalar dependências
npm install

# 3. Configurar .env
cp env.example.txt .env
# Editar .env com suas configurações

# 4. Build
npm run build

# 5. Rodar
npm start

# 6. Acessar
# http://localhost:3000
```

---

## 🚨 Problemas Comuns

### **Erro: "Cannot connect to SQL Server"**

**Solução:**
1. Verifique se SQL Server está acessível
2. Teste conexão com `sqlcmd` ou `tsql`
3. Verifique firewall (porta 1433 ou 15000)
4. Verifique credenciais no `.env`

### **Erro: "Build not found"**

**Solução:**
```bash
# Fazer build novamente
npm run build

# Verificar se dist/public existe
ls -la dist/public
```

### **Erro: "Port already in use"**

**Solução:**
```bash
# Verificar qual processo está usando a porta
# Linux:
sudo lsof -i :3000
sudo kill -9 PID

# Windows:
netstat -ano | findstr :3000
taskkill /PID PID /F

# OU mudar porta no .env
PORT=3001
```

### **Erro: "Module not found"**

**Solução:**
```bash
# Limpar e reinstalar
rm -rf node_modules package-lock.json
npm install
```

### **Telas Transparentes**

**Solução:**
- ✅ Já corrigido! CSS inline está implementado
- Se ainda aparecer, limpe cache do navegador: `Ctrl+Shift+R`

---

## 🔄 Atualizar o Sistema

Quando houver novas mudanças no repositório:

```bash
# 1. Atualizar código
git pull

# 2. Atualizar dependências (se necessário)
npm install

# 3. Rebuild
npm run build

# 4. Reiniciar servidor
# Parar servidor atual (Ctrl+C)
npm start
```

---

## 📊 Checklist Final

Antes de considerar o sistema "pronto":

- [ ] Repositório clonado
- [ ] Dependências instaladas (`npm install`)
- [ ] Arquivo `.env` configurado
- [ ] Conexão com SQL Server testada
- [ ] Build realizado (`npm run build`)
- [ ] Servidor rodando (`npm start`)
- [ ] Health check funcionando (`/api/health`)
- [ ] Acessível no navegador
- [ ] Firewall configurado (se necessário)
- [ ] Logs sem erros

---

## 🎯 Próximos Passos

Após o sistema estar rodando:

1. **Configurar domínio** (opcional)
2. **Configurar HTTPS** (SSL/TLS)
3. **Configurar backup automático** do banco
4. **Monitorar logs** regularmente
5. **Configurar PM2** para manter servidor rodando (opcional)

---

## 📚 Documentação Adicional

- `CONFIGURAR_SQL_ONLINE.md` - Configurar SQL Server online
- `CONFIGURACAO_PORTA_80.md` - Configurar porta 80
- `GUIA_GIT.md` - Comandos Git
- `ESTRATEGIAS_TELAS_TRANSPARENTES.md` - Estratégias de CSS

---

## ✅ Pronto!

Seu sistema está rodando online! 🎉

Acesse: **http://seu-ip:3000**


