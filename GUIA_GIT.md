# 📚 Guia Rápido de Git - Comandos Essenciais

## ✅ Status Atual

- **Git instalado:** ✅ Versão 2.52.0
- **Configurado:** ✅ 
  - Nome: r4fh4el
  - Email: rafhaelazevedo@gmail.com
- **Repositório:** ✅ Inicializado

---

## 🚀 Comandos Git Essenciais

### **1. Verificar Status**
```bash
git status
```
Mostra arquivos modificados, novos e prontos para commit.

---

### **2. Adicionar Arquivos**
```bash
# Adicionar arquivo específico
git add nome-do-arquivo

# Adicionar todos os arquivos modificados
git add .

# Adicionar todos os arquivos (incluindo novos)
git add -A
```

---

### **3. Fazer Commit**
```bash
# Commit com mensagem
git commit -m "Descrição do que foi feito"

# Exemplo:
git commit -m "Corrigir telas transparentes e adicionar estratégias de CSS"
```

---

### **4. Ver Commits**
```bash
# Ver histórico de commits
git log

# Ver histórico resumido
git log --oneline

# Ver últimas 5 commits
git log -5
```

---

### **5. Enviar para o Repositório Remoto**
```bash
# Enviar commits para o repositório remoto
git push

# Se for a primeira vez ou mudou branch
git push -u origin main
```

---

### **6. Atualizar do Repositório Remoto**
```bash
# Baixar mudanças do repositório remoto
git pull
```

---

### **7. Ver Diferenças**
```bash
# Ver diferenças nos arquivos modificados
git diff

# Ver diferenças de um arquivo específico
git diff nome-do-arquivo
```

---

### **8. Desfazer Mudanças**
```bash
# Desfazer mudanças em arquivo não commitado
git restore nome-do-arquivo

# Desfazer todas as mudanças não commitadas
git restore .

# Desfazer último commit (mantém mudanças)
git reset --soft HEAD~1

# Desfazer último commit (remove mudanças)
git reset --hard HEAD~1
```

---

### **9. Branches (Ramificações)**
```bash
# Ver branches
git branch

# Criar nova branch
git branch nome-da-branch

# Mudar para branch
git checkout nome-da-branch

# Criar e mudar para branch
git checkout -b nome-da-branch

# Ver branch atual
git branch --show-current
```

---

### **10. Ver Repositório Remoto**
```bash
# Ver repositórios remotos configurados
git remote -v

# Adicionar repositório remoto
git remote add origin https://github.com/usuario/repositorio.git

# Mudar URL do remoto
git remote set-url origin https://github.com/usuario/repositorio.git
```

---

## 📋 Fluxo de Trabalho Típico

### **Cenário 1: Fazer commit e push das mudanças**

```bash
# 1. Ver o que mudou
git status

# 2. Adicionar arquivos
git add .

# 3. Fazer commit
git commit -m "Descrição das mudanças"

# 4. Enviar para o remoto
git push
```

---

### **Cenário 2: Atualizar do remoto antes de fazer push**

```bash
# 1. Atualizar do remoto
git pull

# 2. Resolver conflitos se houver (se necessário)

# 3. Adicionar mudanças
git add .

# 4. Fazer commit
git commit -m "Descrição das mudanças"

# 5. Enviar para o remoto
git push
```

---

### **Cenário 3: Trabalhar em uma nova feature**

```bash
# 1. Criar nova branch
git checkout -b feature/nome-da-feature

# 2. Fazer mudanças e commits
git add .
git commit -m "Implementar feature X"

# 3. Enviar branch para remoto
git push -u origin feature/nome-da-feature

# 4. Voltar para main
git checkout main

# 5. Mesclar branch na main
git merge feature/nome-da-feature
```

---

## 🔧 Comandos Úteis Adicionais

### **Ver histórico de um arquivo**
```bash
git log -- nome-do-arquivo
```

### **Ver quem modificou um arquivo**
```bash
git blame nome-do-arquivo
```

### **Ignorar arquivos (adicionar ao .gitignore)**
```bash
# Criar/editar .gitignore
echo "node_modules/" >> .gitignore
echo ".env" >> .gitignore
```

### **Clonar repositório**
```bash
git clone https://github.com/usuario/repositorio.git
```

### **Ver configurações**
```bash
# Ver todas as configurações
git config --list

# Ver configuração específica
git config user.name
git config user.email
```

### **Alterar configurações**
```bash
# Alterar nome
git config --global user.name "Seu Nome"

# Alterar email
git config --global user.email "seu@email.com"
```

---

## ⚠️ Comandos Perigosos (Usar com Cuidado)

```bash
# ⚠️ Remove TODAS as mudanças não commitadas
git reset --hard HEAD

# ⚠️ Remove arquivos não rastreados
git clean -fd

# ⚠️ Força push (sobrescreve remoto)
git push --force
```

---

## 📝 Boas Práticas

1. **Commits frequentes:** Faça commits pequenos e frequentes
2. **Mensagens claras:** Use mensagens descritivas
3. **Antes de push:** Sempre faça `git pull` primeiro
4. **Não commitar:** `.env`, `node_modules/`, arquivos temporários
5. **Branches:** Use branches para features grandes

---

## 🆘 Resolver Problemas Comuns

### **Erro: "Your branch is ahead of origin/main"**
```bash
# Significa que você tem commits locais não enviados
git push
```

### **Erro: "Your branch is behind origin/main"**
```bash
# Significa que o remoto tem commits que você não tem
git pull
```

### **Conflitos de merge**
```bash
# 1. Abrir arquivos com conflitos
# 2. Resolver manualmente (procurar por <<<<<<<)
# 3. Adicionar arquivos resolvidos
git add .
# 4. Finalizar merge
git commit
```

### **Desfazer último commit (mas manter mudanças)**
```bash
git reset --soft HEAD~1
```

### **Ver o que está diferente do remoto**
```bash
git fetch
git diff origin/main
```

---

## 🎯 Comandos Rápidos para o Seu Caso

### **Commitar todas as mudanças atuais:**
```bash
cd SGSB
git add .
git commit -m "Corrigir telas transparentes e adicionar estratégias de CSS"
git push
```

### **Ver o que mudou:**
```bash
cd SGSB
git status
git diff
```

### **Atualizar do remoto:**
```bash
cd SGSB
git pull
```

---

## 📚 Recursos Adicionais

- **Documentação oficial:** https://git-scm.com/doc
- **GitHub Guides:** https://guides.github.com
- **Git Cheat Sheet:** https://education.github.com/git-cheat-sheet-education.pdf


