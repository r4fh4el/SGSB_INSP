# 🔍 Verificar HIDRO_API_URL no Servidor Online

## ❌ Problema

O erro persiste mesmo após corrigir o `.env`:
```
{"error":"HIDRO_API_URL não configurada"}
```

## 🔍 Diagnóstico

### 1. Verificar se a variável está no .env

No servidor online, execute:

```bash
cd /caminho/para/SGSB_INSP
grep HIDRO_API_URL .env
```

Deve mostrar:
```
HIDRO_API_URL=http://72.60.57.220:5204
```

**Sem `/swagger/` no final!**

### 2. Testar se a variável está sendo carregada

```bash
cd /caminho/para/SGSB_INSP
node testar-variavel-env.js
```

Isso mostrará:
- Se a variável está sendo lida do `.env`
- Se há problemas com espaços ou caracteres invisíveis
- Se o código está processando corretamente

### 3. Verificar logs do servidor

Após reiniciar o servidor, procure nos logs por:

```
[Proxy] === DEBUG HIDRO_API_URL ===
[Proxy] process.env.HIDRO_API_URL (raw): ...
[Proxy] hidroApiUrl (from env.ts): ...
```

Isso mostrará exatamente o que está acontecendo.

---

## ✅ Solução Passo a Passo

### Passo 1: Verificar o .env no servidor

```bash
# No servidor online
nano .env
# ou
vi .env
```

Certifique-se de que está assim:
```env
HIDRO_API_URL=http://72.60.57.220:5204
```

**IMPORTANTE:**
- Sem `/swagger/` no final
- Sem espaços antes ou depois do `=`
- Sem aspas ao redor do valor
- Sem comentários na mesma linha

### Passo 2: Verificar se o arquivo está correto

```bash
# Ver exatamente o que está no arquivo (incluindo espaços invisíveis)
cat .env | grep HIDRO_API_URL | od -c
```

### Passo 3: Testar a variável

```bash
node testar-variavel-env.js
```

### Passo 4: Reiniciar o servidor

**CRÍTICO:** O servidor DEVE ser reiniciado após alterar o `.env`!

```bash
# Se estiver usando PM2
pm2 restart all
pm2 logs

# Ou pare completamente e inicie novamente
# Pressione Ctrl+C para parar
npm run build
npm start
```

### Passo 5: Verificar logs

Após reiniciar, verifique os logs. Você deve ver:

```
[ENV] HIDRO_API_URL configurada: http://72.60.57.220:5204
```

E quando fizer uma requisição:

```
[Proxy] === DEBUG HIDRO_API_URL ===
[Proxy] process.env.HIDRO_API_URL (raw): http://72.60.57.220:5204
[Proxy] hidroApiUrl (from env.ts): http://72.60.57.220:5204
[Proxy] ✓ HIDRO_API_URL configurada: http://72.60.57.220:5204
```

---

## 🆘 Se Ainda Não Funcionar

### Verificar se o dotenv está carregando

```bash
node -e "require('dotenv').config(); console.log('HIDRO_API_URL:', process.env.HIDRO_API_URL)"
```

### Verificar caminho do .env

O arquivo `.env` deve estar na **raiz** do projeto, no mesmo diretório onde está o `package.json`.

### Verificar se há múltiplos .env

```bash
find . -name ".env" -type f
```

Pode haver um `.env` em uma subpasta que está sendo carregado ao invés do correto.

### Verificar permissões

```bash
ls -la .env
```

O arquivo deve ser legível pelo usuário que executa o Node.js.

---

## 📋 Checklist Completo

- [ ] `.env` existe na raiz do projeto
- [ ] `HIDRO_API_URL=http://72.60.57.220:5204` (sem `/swagger/`)
- [ ] Sem espaços ao redor do `=`
- [ ] Sem aspas no valor
- [ ] Teste `node testar-variavel-env.js` mostra a variável
- [ ] Servidor foi **reiniciado** após alterar `.env`
- [ ] Logs mostram `HIDRO_API_URL configurada`
- [ ] Requisição funciona sem erro 500

---

## 💡 Dica

Se você alterou o `.env` mas não reiniciou o servidor, a variável antiga ainda está em memória. **Sempre reinicie após alterar o `.env`!**



