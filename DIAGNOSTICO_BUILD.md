# 🔍 Diagnóstico: "Build not found" - Solução Completa

## ✅ Correção Aplicada

O código foi atualizado para **tentar múltiplos caminhos** automaticamente e encontrar o build, independente de onde o servidor é iniciado.

---

## 🔍 Passo 1: Verificar se o Build Foi Feito Corretamente

Execute no servidor:

```bash
cd /root/SGSB_INSP_SQL/SGSB
ls -la dist/
```

**Deve mostrar:**
```
dist/
├── index.js          (backend compilado)
└── public/           (frontend compilado)
    ├── index.html
    ├── assets/
    └── ...
```

Se `dist/public/` não existir ou estiver vazio, o build não foi feito corretamente.

---

## 🔍 Passo 2: Verificar os Logs do Servidor

Quando iniciar o servidor com `npm start`, você verá logs como:

```
[Static] Current working directory: /root/SGSB_INSP_SQL/SGSB
[Static] Executable file location: /root/SGSB_INSP_SQL/SGSB/dist
[Static] Searching for dist/public in the following locations:
   1. /root/SGSB_INSP_SQL/SGSB/dist/public ✅ FOUND
   2. /root/SGSB_INSP_SQL/SGSB/dist/public ✅
   ...
✅ Using build directory: /root/SGSB_INSP_SQL/SGSB/dist/public
✅ Found index.html at: /root/SGSB_INSP_SQL/SGSB/dist/public/index.html
```

**Se mostrar "❌" em todos os caminhos**, o problema é que o build não está no lugar esperado.

---

## 🔧 Solução 1: Garantir que o Build Está no Lugar Certo

### 1. Limpar e Rebuild:

```bash
cd /root/SGSB_INSP_SQL/SGSB

# Limpar builds anteriores
rm -rf dist/

# Fazer build completo
npm run build

# Verificar se foi criado
ls -la dist/public/
```

### 2. Verificar se index.html existe:

```bash
ls -la dist/public/index.html
```

Deve existir e ter conteúdo.

---

## 🔧 Solução 2: Garantir que o Servidor Roda do Diretório Correto

O servidor **DEVE** ser iniciado do diretório `SGSB/`:

```bash
# ✅ CORRETO
cd /root/SGSB_INSP_SQL/SGSB
npm start

# ❌ ERRADO (não funciona)
cd /root/SGSB_INSP_SQL
npm start
```

---

## 🔧 Solução 3: Verificar Permissões

O servidor precisa ter permissão para ler os arquivos:

```bash
# Verificar permissões
ls -la dist/public/

# Se necessário, dar permissões
chmod -R 755 dist/
```

---

## 🔧 Solução 4: Verificar Estrutura de Diretórios

A estrutura deve ser:

```
/root/SGSB_INSP_SQL/
└── SGSB/
    ├── dist/
    │   ├── index.js          (backend)
    │   └── public/           (frontend)
    │       ├── index.html
    │       └── assets/
    ├── package.json
    └── ...
```

---

## 🚀 Comandos Completos para Resolver

Execute na ordem:

```bash
# 1. Ir para o diretório correto
cd /root/SGSB_INSP_SQL/SGSB

# 2. Limpar builds anteriores
rm -rf dist/

# 3. Fazer build completo
npm run build

# 4. Verificar se foi criado
ls -la dist/public/index.html

# 5. Se não existir, verificar erros do build
# (o build deve ter terminado sem erros)

# 6. Iniciar servidor (do diretório SGSB/)
npm start

# 7. Verificar os logs do servidor
# Deve mostrar: ✅ Using build directory: ...
```

---

## 📋 Checklist de Verificação

- [ ] Build foi executado: `npm run build`
- [ ] Diretório `dist/public/` existe
- [ ] Arquivo `dist/public/index.html` existe
- [ ] Servidor está sendo iniciado de `SGSB/` (não de `SGSB_INSP_SQL/`)
- [ ] Logs do servidor mostram caminho encontrado
- [ ] Permissões estão corretas

---

## 🆘 Se Ainda Não Funcionar

### 1. Verificar logs detalhados:

O servidor agora mostra **todos os caminhos** que tentou. Verifique qual caminho está sendo usado.

### 2. Verificar se o build realmente gerou os arquivos:

```bash
find /root/SGSB_INSP_SQL -name "index.html" -type f
```

Isso mostra **todos** os arquivos `index.html` no sistema. O correto deve estar em:
```
/root/SGSB_INSP_SQL/SGSB/dist/public/index.html
```

### 3. Verificar o package.json:

Certifique-se de que o script `start` está correto:

```json
{
  "scripts": {
    "start": "cross-env NODE_ENV=production node dist/index.js"
  }
}
```

### 4. Testar manualmente:

```bash
cd /root/SGSB_INSP_SQL/SGSB
node dist/index.js
```

E verificar os logs que aparecem.

---

## 📝 Nota Importante

O código agora tenta **4 caminhos diferentes** automaticamente:
1. `process.cwd()/dist/public` (mais comum)
2. `__dirname/public` (se executado de dist/)
3. `process.cwd()/../dist/public` (alternativo)
4. `process.cwd()/SGSB/dist/public` (se executado da raiz)

Se nenhum funcionar, os logs mostrarão exatamente onde está procurando e você pode ajustar.



