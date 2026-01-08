# 🔧 Como Rodar o Sistema como Serviço no Servidor

## 🎯 Objetivo

Configurar o sistema para:
- ✅ Rodar automaticamente quando o servidor iniciar
- ✅ Reiniciar automaticamente se o processo cair
- ✅ Rodar em background (sem ocupar terminal)
- ✅ Gerenciar facilmente (start, stop, restart, logs)

---

## 🚀 Opção 1: PM2 (Recomendado - Mais Fácil)

PM2 é um gerenciador de processos para Node.js que mantém aplicações rodando permanentemente.

### **1.1. Instalar PM2**

```bash
# Instalar globalmente
npm install -g pm2

# OU usando yarn
yarn global add pm2
```

### **1.2. Iniciar o Sistema com PM2**

```bash
cd SGSB

# Iniciar em modo produção
pm2 start npm --name "sgsb" -- start

# OU usando o script direto
pm2 start dist/index.js --name "sgsb" --node-args="--env-file=.env"
```

### **1.3. Configurar PM2 para Iniciar Automaticamente**

```bash
# Gerar script de inicialização automática
pm2 startup

# Salvar configuração atual
pm2 save
```

**O que faz:**
- ✅ Cria script de inicialização no sistema
- ✅ Sistema inicia automaticamente quando servidor reiniciar
- ✅ Salva lista de processos para restaurar

### **1.4. Comandos Úteis do PM2**

```bash
# Ver status de todos os processos
pm2 status

# Ver logs em tempo real
pm2 logs sgsb

# Ver últimas 100 linhas de log
pm2 logs sgsb --lines 100

# Reiniciar aplicação
pm2 restart sgsb

# Parar aplicação
pm2 stop sgsb

# Remover aplicação do PM2
pm2 delete sgsb

# Monitorar (CPU, memória)
pm2 monit

# Ver informações detalhadas
pm2 show sgsb

# Recarregar sem downtime (zero-downtime reload)
pm2 reload sgsb
```

### **1.5. Criar Arquivo de Configuração PM2**

Crie `ecosystem.config.js` na raiz do projeto `SGSB/`:

```javascript
module.exports = {
  apps: [{
    name: 'sgsb',
    script: 'dist/index.js',
    cwd: '/caminho/para/SGSB_INSP_SQL/SGSB',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      HOST: '0.0.0.0'
    },
    env_file: '.env',
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    min_uptime: '10s',
    max_restarts: 10
  }]
};
```

**Usar o arquivo de configuração:**
```bash
# Iniciar usando o arquivo de configuração
pm2 start ecosystem.config.js

# Salvar configuração
pm2 save
```

---

## 🚀 Opção 2: systemd (Linux - Nativo)

Criar um serviço systemd para rodar automaticamente.

### **2.1. Criar Arquivo de Serviço**

```bash
sudo nano /etc/systemd/system/sgsb.service
```

Adicione o seguinte conteúdo:

```ini
[Unit]
Description=SGSB - Sistema de Gestão e Segurança de Barragem
After=network.target

[Service]
Type=simple
User=seu-usuario
WorkingDirectory=/caminho/para/SGSB_INSP_SQL/SGSB
Environment="NODE_ENV=production"
Environment="PORT=3000"
Environment="HOST=0.0.0.0"
EnvironmentFile=/caminho/para/SGSB_INSP_SQL/SGSB/.env
ExecStart=/usr/bin/node /caminho/para/SGSB_INSP_SQL/SGSB/dist/index.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=sgsb

[Install]
WantedBy=multi-user.target
```

**⚠️ IMPORTANTE:** Substitua:
- `seu-usuario` pelo seu usuário do sistema
- `/caminho/para/SGSB_INSP_SQL/SGSB` pelo caminho real do projeto
- `/usr/bin/node` pelo caminho do Node.js (verifique com `which node`)

### **2.2. Ativar e Iniciar o Serviço**

```bash
# Recarregar systemd
sudo systemctl daemon-reload

# Habilitar para iniciar automaticamente
sudo systemctl enable sgsb

# Iniciar o serviço
sudo systemctl start sgsb

# Verificar status
sudo systemctl status sgsb
```

### **2.3. Comandos Úteis do systemd**

```bash
# Iniciar
sudo systemctl start sgsb

# Parar
sudo systemctl stop sgsb

# Reiniciar
sudo systemctl restart sgsb

# Ver status
sudo systemctl status sgsb

# Ver logs
sudo journalctl -u sgsb -f

# Ver últimas 100 linhas
sudo journalctl -u sgsb -n 100

# Desabilitar inicialização automática
sudo systemctl disable sgsb
```

---

## 🚀 Opção 3: screen ou tmux (Simples)

Para rodar em background sem instalar nada extra.

### **3.1. Usando screen**

```bash
# Instalar screen (se não tiver)
sudo apt-get install screen  # Ubuntu/Debian
sudo yum install screen      # CentOS/RHEL

# Criar nova sessão
screen -S sgsb

# Dentro da sessão, rodar o sistema
cd SGSB
npm start

# Sair da sessão (mantém rodando): Ctrl+A, depois D

# Reconectar à sessão
screen -r sgsb

# Listar sessões
screen -ls

# Matar sessão
screen -X -S sgsb quit
```

### **3.2. Usando tmux**

```bash
# Instalar tmux (se não tiver)
sudo apt-get install tmux  # Ubuntu/Debian

# Criar nova sessão
tmux new -s sgsb

# Dentro da sessão, rodar o sistema
cd SGSB
npm start

# Sair da sessão (mantém rodando): Ctrl+B, depois D

# Reconectar à sessão
tmux attach -t sgsb

# Listar sessões
tmux ls

# Matar sessão
tmux kill-session -t sgsb
```

---

## 🚀 Opção 4: nohup (Mais Simples)

Rodar em background sem instalar nada.

```bash
cd SGSB

# Rodar em background
nohup npm start > logs/app.log 2>&1 &

# Ver PID do processo
echo $!

# Ver logs
tail -f logs/app.log

# Parar processo
# Primeiro encontrar PID
ps aux | grep "node.*dist/index.js"
# Depois matar
kill PID
```

---

## 📊 Comparação das Opções

| Opção | Fácil | Auto-restart | Auto-start | Logs | Monitoramento |
|-------|-------|--------------|------------|------|---------------|
| **PM2** | ⭐⭐⭐⭐⭐ | ✅ | ✅ | ✅ | ✅ |
| **systemd** | ⭐⭐⭐ | ✅ | ✅ | ✅ | ⚠️ |
| **screen/tmux** | ⭐⭐⭐⭐ | ❌ | ❌ | ⚠️ | ❌ |
| **nohup** | ⭐⭐⭐⭐⭐ | ❌ | ❌ | ⚠️ | ❌ |

**Recomendação:** Use **PM2** para produção (mais fácil e completo).

---

## 🎯 Configuração Completa com PM2 (Recomendado)

### **Passo a Passo Completo:**

```bash
# 1. Instalar PM2
npm install -g pm2

# 2. Ir para o diretório do projeto
cd /caminho/para/SGSB_INSP_SQL/SGSB

# 3. Fazer build (se ainda não fez)
npm run build

# 4. Iniciar com PM2
pm2 start dist/index.js --name "sgsb" --node-args="--env-file=.env"

# 5. Configurar para iniciar automaticamente
pm2 startup
# Copie e execute o comando que aparecer (algo como: sudo env PATH=...)

# 6. Salvar configuração
pm2 save

# 7. Verificar status
pm2 status

# 8. Ver logs
pm2 logs sgsb
```

---

## 🔍 Verificar se Está Rodando

### **Com PM2:**
```bash
pm2 status
pm2 logs sgsb
```

### **Com systemd:**
```bash
sudo systemctl status sgsb
sudo journalctl -u sgsb -f
```

### **Verificar porta:**
```bash
# Ver se porta 3000 está em uso
sudo netstat -tulpn | grep :3000
# OU
sudo lsof -i :3000
```

### **Testar no navegador:**
```
http://seu-ip:3000
http://seu-ip:3000/api/health
```

---

## 🔄 Atualizar o Sistema (com PM2)

Quando houver novas mudanças:

```bash
# 1. Atualizar código
cd SGSB
git pull

# 2. Instalar novas dependências (se houver)
npm install

# 3. Rebuild
npm run build

# 4. Reiniciar com PM2
pm2 restart sgsb

# 5. Verificar logs
pm2 logs sgsb
```

---

## 🚨 Troubleshooting

### **PM2 não inicia automaticamente após reiniciar servidor**

```bash
# Verificar se startup está configurado
pm2 startup

# Reconfigurar
pm2 unstartup
pm2 startup
pm2 save
```

### **Serviço systemd não inicia**

```bash
# Ver logs detalhados
sudo journalctl -u sgsb -n 50

# Verificar permissões
ls -la /caminho/para/SGSB_INSP_SQL/SGSB

# Verificar se Node.js está no PATH
which node
```

### **Processo morre constantemente**

```bash
# Ver logs de erro
pm2 logs sgsb --err

# Verificar memória
pm2 monit

# Aumentar limite de memória no ecosystem.config.js
max_memory_restart: '2G'
```

---

## ✅ Checklist Final

- [ ] PM2 ou systemd configurado
- [ ] Serviço iniciado e rodando
- [ ] Inicialização automática configurada
- [ ] Logs funcionando
- [ ] Sistema acessível no navegador
- [ ] Testado reiniciar servidor (verificar se inicia automaticamente)

---

## 📚 Próximos Passos

Após configurar o serviço:

1. **Configurar Nginx** como proxy reverso (porta 80)
2. **Configurar SSL/HTTPS** (Let's Encrypt)
3. **Configurar backup automático** do banco
4. **Configurar monitoramento** (opcional)

---

## 🎯 Resumo Rápido (PM2)

```bash
# Instalar
npm install -g pm2

# Iniciar
cd SGSB
pm2 start dist/index.js --name "sgsb"

# Auto-start
pm2 startup
pm2 save

# Gerenciar
pm2 status
pm2 logs sgsb
pm2 restart sgsb
pm2 stop sgsb
```

**Pronto!** Seu sistema está rodando como serviço! 🎉


