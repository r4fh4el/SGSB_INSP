# 🔓 Como Pular o Login e Ir Direto para o Menu

## ✅ Solução Rápida

Adicione estas linhas ao final do arquivo `.env`:

```env
# Skip authentication
SKIP_AUTH=true
VITE_SKIP_AUTH=true
VITE_OFFLINE_AUTH=true
```

## 📝 Passo a Passo

### 1. Editar o arquivo .env

Abra o arquivo `.env` na raiz do projeto `SGSB_INSP` e adicione no final:

```env
# Skip authentication - Pular login
SKIP_AUTH=true
VITE_SKIP_AUTH=true
VITE_OFFLINE_AUTH=true
```

### 2. Reiniciar o servidor

Pare o servidor atual (Ctrl+C) e inicie novamente:

```powershell
cd E:\SGSB-master\SGSB_INSP
npx --yes pnpm start
```

### 3. Limpar cache do navegador

1. Pressione **Ctrl + Shift + Delete**
2. Selecione "Imagens e arquivos em cache"
3. Limpe o cache
4. Recarregue a página com **Ctrl + F5**

### 4. Acessar o sistema

Acesse: http://localhost:3000

O sistema deve ir **direto para o menu**, sem pedir login!

## 🔍 O que cada variável faz?

- **`SKIP_AUTH=true`** - Pula autenticação no backend (servidor)
- **`VITE_SKIP_AUTH=true`** - Pula autenticação no frontend (navegador)
- **`VITE_OFFLINE_AUTH=true`** - Usa autenticação offline (usuário padrão)

## ⚠️ Importante

- Essas configurações são para **desenvolvimento/teste**
- Em **produção**, você deve usar autenticação real
- Após adicionar as variáveis, **sempre reinicie o servidor**

## ❌ Se ainda pedir login

1. Verifique se as variáveis estão no `.env`
2. Reinicie o servidor completamente
3. Limpe o cache do navegador
4. Verifique o console do navegador (F12) para erros

## 🔄 Voltar a pedir login

Para voltar a pedir login, remova ou comente as linhas:

```env
# SKIP_AUTH=true
# VITE_SKIP_AUTH=true
# VITE_OFFLINE_AUTH=true
```

Ou mude para `false`:

```env
SKIP_AUTH=false
VITE_SKIP_AUTH=false
VITE_OFFLINE_AUTH=false
```

