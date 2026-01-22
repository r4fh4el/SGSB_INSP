# Configuração de Conexão com SGSB-WEB

## Problema
O erro "Erro ao conectar com o SGSB-WEB" aparece porque as variáveis de ambiente não estão configuradas corretamente.

## Solução

### 1. Criar arquivo `.env` na raiz do projeto SGSB_INSP

Crie um arquivo chamado `.env` na pasta raiz do SGSB_INSP (mesmo nível do `package.json`).

### 2. Configurar variáveis de ambiente

Adicione as seguintes linhas no arquivo `.env`:

```env
# URL do SGSB-WEB (SGSB-FINAL/HIDRO)
# Para desenvolvimento local (HTTP):
HIDRO_API_URL=http://localhost:5204
VITE_SGSB_FINAL_API_URL=http://localhost:5204

# Para produção ou HTTPS:
# HIDRO_API_URL=https://seu-servidor.com.br
# VITE_SGSB_FINAL_API_URL=https://seu-servidor.com.br
```

**Importante:**
- `HIDRO_API_URL` - Usado pelo servidor Node.js (backend)
- `VITE_SGSB_FINAL_API_URL` - Usado pelo frontend React (client)

### 3. Verificar se o SGSB-WEB está rodando

Antes de testar, certifique-se de que o SGSB-WEB está rodando:

1. Abra o projeto SGSB-WEB no Visual Studio
2. Execute o projeto WebAPI
3. Verifique se está rodando em `http://localhost:5204` (ou a porta configurada)
4. Teste acessando: `http://localhost:5204/swagger` no navegador

### 4. Recompilar o frontend

**IMPORTANTE:** Após adicionar ou modificar `VITE_SGSB_FINAL_API_URL`, você DEVE recompilar o frontend:

```bash
# Parar o servidor se estiver rodando (Ctrl+C)

# Recompilar o frontend
npm run build

# Iniciar o servidor novamente
npm start
```

**Por quê?** As variáveis que começam com `VITE_` são incorporadas no código durante o build. Se você mudar o `.env` sem fazer rebuild, as mudanças não terão efeito.

### 5. Verificar configuração

Após recompilar, verifique se a configuração está correta:

1. Abra a página "Cálculo Automático" no SGSB_INSP
2. Selecione uma barragem
3. Clique em "Atualizar Cálculos"
4. O erro não deve mais aparecer

## Exemplo de arquivo `.env` completo

```env
# ============================================
# CONFIGURAÇÃO DO BANCO DE DADOS SQL SERVER
# ============================================
SQLSERVER_SERVER=108.181.193.92,15000
SQLSERVER_DATABASE=sgsb_insp
SQLSERVER_USER=sa
SQLSERVER_PASSWORD=SenhaNova@123
SQLSERVER_TRUSTED_CONNECTION=false
SQLSERVER_ODBC_DRIVER=ODBC Driver 17 for SQL Server

# ============================================
# CONFIGURAÇÃO DO SERVIDOR
# ============================================
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# ============================================
# INTEGRAÇÃO COM SGSB-WEB (SGSB-FINAL/HIDRO)
# ============================================
# URL do SGSB-WEB para o servidor Node.js
HIDRO_API_URL=http://localhost:5204

# URL do SGSB-WEB para o frontend React
# IMPORTANTE: Esta variável é incorporada no build!
VITE_SGSB_FINAL_API_URL=http://localhost:5204

# Para produção, use:
# HIDRO_API_URL=https://api.sgsb.com.br
# VITE_SGSB_FINAL_API_URL=https://api.sgsb.com.br
```

## Troubleshooting

### Erro persiste após configurar?

1. **Verifique se o arquivo `.env` está na raiz do projeto** (mesmo nível do `package.json`)

2. **Verifique se fez o rebuild:**
   ```bash
   npm run build
   npm start
   ```

3. **Verifique se o SGSB-WEB está rodando:**
   - Acesse `http://localhost:5204/swagger` no navegador
   - Se não abrir, o SGSB-WEB não está rodando

4. **Verifique a porta:**
   - Se o SGSB-WEB estiver rodando em outra porta, ajuste no `.env`
   - Portas comuns: 5204 (HTTP), 7042 (HTTPS), 5000

5. **Verifique CORS:**
   - O SGSB-WEB precisa permitir requisições do SGSB_INSP
   - Verifique a configuração de CORS no SGSB-WEB

### Para desenvolvimento local

Se estiver desenvolvendo localmente, use:
```env
HIDRO_API_URL=http://localhost:5204
VITE_SGSB_FINAL_API_URL=http://localhost:5204
```

### Para produção

Se estiver em produção, use a URL completa:
```env
HIDRO_API_URL=https://api.sgsb.com.br
VITE_SGSB_FINAL_API_URL=https://api.sgsb.com.br
```

## Comandos rápidos

```bash
# 1. Criar/editar arquivo .env
# (Use seu editor de texto preferido)

# 2. Recompilar após mudanças no .env
npm run build

# 3. Iniciar servidor
npm start

# 4. Verificar se está funcionando
# Abra o navegador e acesse a página "Cálculo Automático"
```



