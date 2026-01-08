# 🔄 Como Atualizar o Sistema Online

## 🎯 Opção 1: Atualizar via Git (Recomendado)

### **Passo a Passo:**

#### **1. No seu computador local:**

```bash
# 1. Ir para o diretório do projeto
cd SGSB

# 2. Adicionar mudanças
git add .

# 3. Fazer commit
git commit -m "Aumentar margem inferior das telas"

# 4. Enviar para o GitHub
git push
```

#### **2. No servidor online (SSH):**

```bash
# 1. Conectar ao servidor via SSH
ssh usuario@seu-ip

# 2. Ir para o diretório do projeto
cd /caminho/para/SGSB_INSP_SQL/SGSB

# 3. Atualizar código do GitHub
git pull

# 4. Instalar novas dependências (se houver)
npm install

# 5. Rebuild do projeto
npm run build

# 6. Reiniciar o serviço
# Se usar PM2:
pm2 restart sgsb

# OU se usar systemd:
sudo systemctl restart sgsb

# OU se rodar direto:
# Parar processo atual (Ctrl+C) e rodar novamente
npm start
```

---

## 🎯 Opção 2: Editar Diretamente no Servidor

### **Passo a Passo:**

#### **1. Conectar ao servidor:**

```bash
ssh usuario@seu-ip
```

#### **2. Editar o arquivo:**

```bash
# Ir para o diretório
cd /caminho/para/SGSB_INSP_SQL/SGSB

# Editar o arquivo (use nano, vim ou seu editor preferido)
nano client/src/components/DashboardLayout.tsx
```

#### **3. Localizar a linha 298 e alterar:**

**Encontrar:**
```tsx
<main className="flex-1 p-4" style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>{children}</main>
```

**Alterar para:**
```tsx
<main className="flex-1 px-4 pt-4 pb-8" style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>{children}</main>
```

**OU para mais espaço:**
```tsx
<main className="flex-1 px-4 pt-4 pb-12" style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>{children}</main>
```

**OU para ainda mais:**
```tsx
<main className="flex-1 px-4 pt-4 pb-16" style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>{children}</main>
```

#### **4. Salvar e sair:**
- **nano:** `Ctrl+X`, depois `Y`, depois `Enter`
- **vim:** `Esc`, depois `:wq`, depois `Enter`

#### **5. Rebuild e reiniciar:**

```bash
# Rebuild
npm run build

# Reiniciar serviço
# Se usar PM2:
pm2 restart sgsb

# OU se usar systemd:
sudo systemctl restart sgsb
```

---

## 📊 Valores de Padding Inferior

| Classe | Valor | Tamanho |
|--------|-------|---------|
| `pb-4` | 1rem | 16px |
| `pb-6` | 1.5rem | 24px |
| `pb-8` | 2rem | 32px ✅ (atual) |
| `pb-12` | 3rem | 48px |
| `pb-16` | 4rem | 64px |
| `pb-20` | 5rem | 80px |

---

## 🚀 Comando Rápido (Tudo de Uma Vez)

### **No servidor, execute:**

```bash
cd /caminho/para/SGSB_INSP_SQL/SGSB && \
git pull && \
npm install && \
npm run build && \
pm2 restart sgsb
```

---

## 🔍 Verificar se Atualizou

### **1. Ver logs:**
```bash
# PM2
pm2 logs sgsb --lines 20

# systemd
sudo journalctl -u sgsb -n 20
```

### **2. Testar no navegador:**
- Acesse: `http://seu-ip:3000`
- Verifique se a margem inferior aumentou
- Limpe cache se necessário: `Ctrl+Shift+R`

---

## ⚠️ Importante

- ✅ Sempre faça **backup** antes de editar
- ✅ Teste localmente antes de atualizar online
- ✅ Verifique logs após reiniciar
- ✅ Limpe cache do navegador após atualizar

---

## 🎯 Resumo Rápido

**Para atualizar margem inferior:**

1. **Editar:** `client/src/components/DashboardLayout.tsx` (linha 298)
2. **Mudar:** `p-4` para `px-4 pt-4 pb-8` (ou outro valor)
3. **Rebuild:** `npm run build`
4. **Reiniciar:** `pm2 restart sgsb` ou `sudo systemctl restart sgsb`

**Pronto!** 🎉


