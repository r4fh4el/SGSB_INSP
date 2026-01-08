# ✅ Correção: Path dos Arquivos Estáticos

## 🔍 Problema Identificado

O servidor estava procurando os arquivos estáticos no lugar errado após o build:

**Build está em:**
```
/root/SGSB_INSP_SQL/SGSB/dist/public/
```

**Servidor estava procurando em:**
```
/root/SGSB_INSP_SQL/dist/public/  ❌ (caminho errado)
```

## 🔧 Causa

O código estava usando `import.meta.dirname` que **não funciona corretamente após o build com esbuild**:

```typescript
// ❌ ERRADO (não funciona após build)
const distPath = path.resolve(import.meta.dirname, "../..", "dist", "public");
```

## ✅ Solução Aplicada

Substituído por `process.cwd()` que aponta corretamente para o diretório de trabalho:

```typescript
// ✅ CORRETO (funciona após build)
const distPath = path.resolve(process.cwd(), "dist", "public");
```

## 📝 Arquivo Corrigido

**`SGSB/server/_core/vite.ts`** - Função `serveStatic()`

### Antes:
```typescript
export function serveStatic(app: Express) {
  const distPath = path.resolve(import.meta.dirname, "../..", "dist", "public");
  // ...
}
```

### Depois:
```typescript
export function serveStatic(app: Express) {
  // Usar process.cwd() ao invés de import.meta.dirname para funcionar corretamente após build com esbuild
  const distPath = path.resolve(process.cwd(), "dist", "public");
  
  console.log(`[Static] Looking for build in: ${distPath}`);
  console.log(`[Static] Current working directory: ${process.cwd()}`);
  // ...
}
```

## 🚀 Como Testar

1. **Fazer build:**
```bash
cd SGSB
npm run build
```

2. **Iniciar servidor:**
```bash
npm start
```

3. **Verificar logs:**
O servidor deve mostrar:
```
[Static] Looking for build in: /root/SGSB_INSP_SQL/SGSB/dist/public
[Static] Current working directory: /root/SGSB_INSP_SQL/SGSB
✅ Serving static files from: /root/SGSB_INSP_SQL/SGSB/dist/public
```

4. **Acessar no navegador:**
```
http://72.62.12.84
```

## ✅ Resultado Esperado

- ✅ Servidor encontra os arquivos estáticos corretamente
- ✅ Frontend carrega normalmente
- ✅ Sem erros 404 para arquivos estáticos
- ✅ Aplicação funciona completamente

## 📌 Nota Importante

A função `setupVite()` (usada em desenvolvimento) ainda usa `import.meta.dirname`, o que está **correto** porque:
- É usada apenas em desenvolvimento
- O código não é bundlado em desenvolvimento
- `import.meta.dirname` funciona corretamente quando não há build

Apenas a função `serveStatic()` (usada em produção) precisava da correção.



