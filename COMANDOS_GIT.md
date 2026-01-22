# 📦 Comandos Git - SGSB_INSP

## 🚀 Enviar para o Git (Push)

### 1. Verificar status das alterações:
```bash
cd SGSB_INSP
git status
```

### 2. Adicionar arquivos alterados:
```bash
# Adicionar todos os arquivos alterados
git add .

# Ou adicionar arquivos específicos
git add server/routers.ts
git add .env.example.txt
```

### 3. Fazer commit:
```bash
git commit -m "Correção: Tornar endpoint getCaracterizacaoByBarragem público para integração"
```

### 4. Enviar para o repositório:
```bash
# Se for a primeira vez ou mudou o remote
git push origin main

# Ou se a branch for master
git push origin master

# Ou se a branch tiver outro nome
git push origin nome-da-branch
```

### 5. Comando completo (tudo de uma vez):
```bash
cd SGSB_INSP
git add .
git commit -m "Atualização: Correções de integração"
git push origin main
```

---

## 📥 Baixar no Servidor (Pull)

### 1. Navegar até o diretório:
```bash
cd ~/SGSB_INSP
# ou
cd /caminho/para/SGSB_INSP
```

### 2. Verificar se há alterações:
```bash
git fetch origin
git status
```

### 3. Baixar e aplicar alterações:
```bash
# Pull simples (se não houver conflitos)
git pull origin main

# Ou se a branch for master
git pull origin master
```

### 4. Se houver conflitos locais:
```bash
# Fazer backup das alterações locais
git stash

# Fazer pull
git pull origin main

# Aplicar alterações locais de volta (se necessário)
git stash pop
```

### 5. Comando completo:
```bash
cd ~/SGSB_INSP
git pull origin main
```

---

## 🔄 Atualizar e Reiniciar (Servidor)

### Script completo para atualizar no servidor:
```bash
# 1. Fazer backup do .env (importante!)
cp .env .env.backup

# 2. Fazer pull
cd ~/SGSB_INSP
git pull origin main

# 3. Restaurar .env (se foi alterado pelo git)
cp .env.backup .env

# 4. Instalar dependências (se necessário)
npm install

# 5. Rebuild (se necessário)
npm run build

# 6. Reiniciar servidor
# Se estiver usando PM2:
pm2 restart all

# Ou parar e iniciar:
# Ctrl+C para parar
npm start
```

---

## 📋 Comandos Úteis

### Ver histórico de commits:
```bash
git log --oneline -10
```

### Ver diferenças antes de fazer commit:
```bash
git diff
```

### Desfazer alterações não commitadas:
```bash
# Desfazer todas as alterações
git reset --hard HEAD

# Desfazer apenas arquivos específicos
git checkout -- arquivo.ts
```

### Ver branch atual:
```bash
git branch
```

### Mudar de branch:
```bash
git checkout main
# ou
git checkout master
```

### Criar nova branch:
```bash
git checkout -b nome-da-branch
```

---

## ⚠️ Importante

### Antes de fazer push:
- ✅ Verificar se não está enviando arquivos sensíveis (`.env`, senhas, etc.)
- ✅ Verificar se o `.gitignore` está configurado corretamente
- ✅ Fazer commit com mensagem descritiva

### Antes de fazer pull no servidor:
- ✅ Fazer backup do `.env` (contém configurações do servidor)
- ✅ Verificar se há alterações locais importantes
- ✅ Se houver conflitos, resolver antes de continuar

---

## 🔐 Arquivos que NÃO devem ir para o Git

Certifique-se de que o `.gitignore` contém:
```
.env
.env.local
node_modules/
dist/
*.log
.DS_Store
```

---

## 📝 Exemplo Completo

### No seu computador local:
```bash
cd E:\SGSB-master\SGSB_INSP
git add .
git commit -m "Correção: Endpoint getCaracterizacaoByBarragem público para integração com WebAPI"
git push origin main
```

### No servidor online:
```bash
cd ~/SGSB_INSP
cp .env .env.backup
git pull origin main
cp .env.backup .env
npm install
npm run build
pm2 restart all
```



