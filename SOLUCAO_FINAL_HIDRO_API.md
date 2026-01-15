# ✅ Solução Final - HIDRO_API_URL não configurada

## 🔍 Problema

Mesmo após corrigir o `.env`, o erro persiste:
```
{"error":"HIDRO_API_URL não configurada"}
```

## ✅ Soluções Aplicadas

### 1. Código Melhorado
O código agora:
- ✅ Remove automaticamente `/swagger` da URL
- ✅ Remove barras finais
- ✅ Substitui `0.0.0.0` por `localhost`
- ✅ Mostra logs detalhados

### 2. Correção no .env

**No servidor online, edite o `.env`:**

```env
# ❌ ERRADO
HIDRO_API_URL=http://72.60.57.220:5204/swagger/

# ✅ CORRETO
HIDRO_API_URL=http://72.60.57.220:5204
```

**Remova completamente o `/swagger/` do final!**

---

## 🔄 Passos para Resolver

### Passo 1: Corrigir o .env no servidor online

Edite o arquivo `.env` e certifique-se de que está assim:

```env
HIDRO_API_URL=http://72.60.57.220:5204
```

**Sem `/swagger/` no final!**

### Passo 2: Reiniciar o Servidor

**IMPORTANTE:** Após alterar o `.env`, você DEVE reiniciar o servidor!

```bash
# Se estiver usando PM2
pm2 restart all

# Ou pare o servidor (Ctrl+C) e inicie novamente
npm run build
npm start
```

### Passo 3: Verificar Logs

Após reiniciar, verifique os logs:

```bash
# PM2
pm2 logs

# Ou no terminal onde está rodando
```

Você deve ver:
```
[ENV] HIDRO_API_URL configurada: http://72.60.57.220:5204
```

Se ainda aparecer o aviso sobre `/swagger`, significa que o código corrigiu automaticamente, mas é melhor corrigir no `.env`.

---

## 🧪 Testar se Funcionou

### 1. Verificar no navegador
Acesse a aplicação e tente fazer um cálculo. O erro não deve mais aparecer.

### 2. Verificar logs do servidor
Procure por:
```
[Proxy] Buscando cálculos de: http://72.60.57.220:5204/API/...
```

### 3. Testar endpoint diretamente
```bash
curl "http://72.60.57.220:5204/API/BuscarCalculosAutomaticosPorBarragem?barragemId=1"
```

---

## 📋 Checklist Final

- [ ] `.env` corrigido (sem `/swagger/`)
- [ ] Servidor Node.js reiniciado
- [ ] Logs mostram `HIDRO_API_URL configurada`
- [ ] Teste de cálculo funciona sem erro
- [ ] API está acessível em `http://72.60.57.220:5204`

---

## 🆘 Se Ainda Não Funcionar

1. **Verifique se o .env está sendo carregado:**
   ```bash
   # No servidor, verifique se a variável está sendo lida
   node -e "require('dotenv').config(); console.log(process.env.HIDRO_API_URL)"
   ```

2. **Verifique se há espaços ou caracteres invisíveis:**
   ```bash
   # No servidor online
   cat .env | grep HIDRO_API_URL | od -c
   ```

3. **Verifique se o arquivo .env está no local correto:**
   - Deve estar na **raiz** do projeto `SGSB_INSP`
   - Não em subpastas

4. **Verifique se a API está acessível:**
   ```bash
   curl http://72.60.57.220:5204/swagger
   ```

---

## 💡 Dica

O código agora corrige automaticamente problemas comuns, mas é sempre melhor ter o `.env` correto desde o início!

