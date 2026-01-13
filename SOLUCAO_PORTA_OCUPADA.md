# 🔧 Solução: Porta 3000 já está em uso

## ❌ Erro
```
Error: listen EADDRINUSE: address already in use ::1:3000
```

## ✅ Soluções Rápidas

### Opção 1: Liberar a porta automaticamente

Execute o script:
```powershell
cd E:\SGSB-master\SGSB_INSP
.\liberar-porta.ps1
```

### Opção 2: Encerrar processo manualmente

```powershell
# Ver qual processo está usando a porta
netstat -ano | findstr :3000

# Encerrar o processo (substitua PID pelo número encontrado)
Stop-Process -Id PID -Force
```

### Opção 3: Mudar a porta no .env

Edite o arquivo `.env` e mude a porta:

```env
PORT=3001
```

Ou outra porta disponível (3002, 3003, etc.)

### Opção 4: Encerrar todos os processos Node.js

```powershell
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force
```

⚠️ **Atenção**: Isso encerrará TODOS os processos Node.js em execução!

## 🔍 Verificar se a porta está livre

```powershell
netstat -ano | findstr :3000
```

Se não retornar nada, a porta está livre.

## 🚀 Depois de liberar a porta

Execute novamente:
```powershell
npx --yes pnpm start
```

Ou em modo desenvolvimento:
```powershell
npx --yes pnpm dev
```

## 💡 Dica

Para evitar esse problema no futuro, você pode:
1. Sempre parar o servidor anterior antes de iniciar um novo (Ctrl+C)
2. Usar uma porta diferente no `.env`
3. Usar o script `liberar-porta.ps1` antes de iniciar

