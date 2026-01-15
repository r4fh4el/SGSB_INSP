# 🔧 Solução: API não consegue ser chamada (servidor online)

## ❌ Problema
A URL está configurada corretamente no `.env`, mas a API não consegue ser chamada do servidor online.

## 🔍 Diagnóstico

### 1. Verificar se a API está rodando
No servidor onde a WebAPI está instalada:
```bash
# Verificar se a porta 5204 está em uso
sudo lsof -i :5204
# ou
sudo netstat -tulpn | grep :5204

# Verificar processos dotnet
ps aux | grep dotnet
```

### 2. Testar conectividade do servidor online
No servidor onde o SGSB_INSP está rodando:
```bash
# Testar se a porta está acessível
nc -zv IP_DO_SERVIDOR_API 5204

# Testar HTTP
curl http://IP_DO_SERVIDOR_API:5204/swagger

# Testar endpoint de cálculos
curl "http://IP_DO_SERVIDOR_API:5204/API/BuscarCalculosAutomaticosPorBarragem?barragemId=1"
```

### 3. Verificar logs do servidor Node.js
Os logs agora mostram mais detalhes:
```bash
# Ver logs em tempo real
tail -f logs/app.log
# ou se estiver rodando com PM2
pm2 logs
```

---

## ✅ Soluções

### Solução 1: Verificar URL no .env

Certifique-se de que a URL está correta e **não usa 0.0.0.0**:

```env
# ❌ ERRADO - 0.0.0.0 não funciona para requisições HTTP
HIDRO_API_URL=http://0.0.0.0:5204

# ✅ CORRETO - Use o IP real do servidor ou localhost
HIDRO_API_URL=http://IP_DO_SERVIDOR:5204

# Se a API está no mesmo servidor:
HIDRO_API_URL=http://localhost:5204

# Se a API está em outro servidor:
HIDRO_API_URL=http://108.181.193.92:5204
```

### Solução 2: Verificar Firewall

No servidor onde a WebAPI está rodando:

**Linux (UFW):**
```bash
sudo ufw allow 5204/tcp
sudo ufw reload
```

**Linux (Firewalld):**
```bash
sudo firewall-cmd --permanent --add-port=5204/tcp
sudo firewall-cmd --reload
```

**Linux (iptables):**
```bash
sudo iptables -A INPUT -p tcp --dport 5204 -j ACCEPT
sudo iptables-save
```

### Solução 3: Verificar se a API aceita conexões externas

No arquivo `WebAPI/Program.cs`, verifique se está configurado para aceitar conexões externas:

```csharp
// Deve estar assim:
builder.WebHost.UseUrls("http://0.0.0.0:5204");
```

**Importante:** `0.0.0.0` é apenas para o servidor **escutar** em todas as interfaces. Para **chamar** a API, use o IP real do servidor.

### Solução 4: Verificar CORS (se necessário)

Se estiver fazendo requisições do navegador (não do servidor Node.js), verifique se o CORS está configurado na WebAPI.

No `WebAPI/Program.cs`, adicione o IP do servidor SGSB_INSP:

```csharp
var urlCliente6 = "http://IP_DO_SERVIDOR_SGSB_INSP:80";
app.UseCors(x => x
    .WithOrigins(urlCliente1, urlCliente2, urlCliente3, urlCliente4, urlCliente5, urlCliente6)
    .AllowAnyMethod()
    .AllowAnyHeader()
    .AllowCredentials());
```

### Solução 5: Usar Script de Teste

Execute o script de teste de conectividade:

```bash
cd SGSB_INSP
chmod +x testar-conectividade-api.sh
./testar-conectividade-api.sh
```

O script irá:
- ✅ Verificar se a URL está configurada
- ✅ Testar conectividade de rede
- ✅ Testar endpoint Swagger
- ✅ Testar endpoint de cálculos
- ✅ Mostrar erros detalhados

---

## 🔍 Verificar Logs Detalhados

O código agora mostra logs mais detalhados. Verifique os logs do servidor Node.js:

```bash
# Se estiver rodando com PM2
pm2 logs

# Se estiver rodando diretamente
# Os logs aparecerão no console
```

Procure por mensagens como:
- `[Proxy] Buscando cálculos de: ...`
- `[Proxy] ❌ Erro ao buscar cálculos: ...`
- `[Proxy] Tipo do erro: ...`
- `[Proxy] Código: ...`

---

## 📋 Checklist de Verificação

- [ ] WebAPI está rodando no servidor
- [ ] Porta 5204 está acessível (teste com `nc` ou `curl`)
- [ ] Firewall permite conexões na porta 5204
- [ ] URL no `.env` usa IP real (não `0.0.0.0`)
- [ ] URL no `.env` está correta (IP e porta)
- [ ] Servidor Node.js foi reiniciado após alterar `.env`
- [ ] Logs mostram tentativa de conexão
- [ ] Teste manual com `curl` funciona

---

## 🧪 Teste Manual

### No servidor onde o SGSB_INSP está rodando:

```bash
# 1. Testar conectividade básica
curl -v http://IP_DO_SERVIDOR_API:5204/swagger

# 2. Testar endpoint de cálculos
curl -v "http://IP_DO_SERVIDOR_API:5204/API/BuscarCalculosAutomaticosPorBarragem?barragemId=1"

# 3. Testar do Node.js (se tiver acesso)
node -e "fetch('http://IP_DO_SERVIDOR_API:5204/swagger').then(r => console.log('OK:', r.status)).catch(e => console.log('ERRO:', e.message))"
```

---

## 🆘 Erros Comuns

### Erro: "ECONNREFUSED"
**Causa:** A API não está rodando ou a porta está bloqueada
**Solução:** 
1. Verificar se a WebAPI está rodando
2. Verificar firewall
3. Verificar se a porta está correta

### Erro: "ENOTFOUND"
**Causa:** Hostname não encontrado
**Solução:** Use IP ao invés de hostname, ou verifique o DNS

### Erro: "ETIMEDOUT"
**Causa:** Timeout de conexão
**Solução:**
1. Verificar se a API está acessível
2. Verificar firewall
3. Verificar latência de rede

### Erro: "AbortError" (Timeout)
**Causa:** A API demorou mais de 30 segundos para responder
**Solução:**
1. Verificar se a API está funcionando
2. Verificar performance do servidor
3. Aumentar timeout se necessário

---

## 📝 Exemplo de Configuração Correta

### Cenário 1: API no mesmo servidor
```env
HIDRO_API_URL=http://localhost:5204
```

### Cenário 2: API em servidor diferente (mesma rede)
```env
HIDRO_API_URL=http://192.168.1.100:5204
```

### Cenário 3: API em servidor remoto (internet)
```env
HIDRO_API_URL=http://108.181.193.92:5204
```

---

## 🔄 Após Corrigir

1. **Reiniciar o servidor Node.js:**
   ```bash
   # PM2
   pm2 restart all
   
   # Ou parar e iniciar novamente
   npm run dev
   ```

2. **Verificar logs:**
   ```bash
   pm2 logs
   # ou
   tail -f logs/app.log
   ```

3. **Testar novamente:**
   - Acesse a aplicação
   - Tente fazer um cálculo
   - Verifique se o erro desapareceu

