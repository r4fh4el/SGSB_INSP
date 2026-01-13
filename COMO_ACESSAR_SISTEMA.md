# 🚀 Como Acessar o SGSB_INSP

## ✅ Status Atual

O sistema está **FUNCIONANDO** e rodando corretamente!

- ✅ Servidor Node.js rodando na porta 3000
- ✅ Build completo e arquivos carregando
- ✅ Autenticação desabilitada (SKIP_AUTH=true)
- ✅ Configurado para aceitar conexões de qualquer IP (HOST=0.0.0.0)

## 🌐 URLs para Acessar

### No mesmo computador:
```
http://localhost:3000
```

### De outro computador na mesma rede:
```
http://[IP_DO_SERVIDOR]:3000
```

Para descobrir o IP do servidor, execute:
```powershell
Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.*"} | Select-Object -First 1 -ExpandProperty IPAddress
```

## 🔧 Se Não Conseguir Acessar

### 1. Verifique a URL
- Certifique-se de usar `http://` (não `https://`)
- Certifique-se de usar a porta `3000`
- Exemplo correto: `http://localhost:3000`

### 2. Limpe o Cache do Navegador
1. Pressione `Ctrl + Shift + Delete`
2. Selecione "Imagens e arquivos em cache"
3. Limpe o cache
4. Recarregue a página com `Ctrl + F5` (hard refresh)

### 3. Verifique o Console do Navegador
1. Abra o navegador
2. Pressione `F12` para abrir DevTools
3. Vá na aba **Console**
4. Veja se há erros em vermelho
5. Vá na aba **Network**
6. Recarregue a página (F5)
7. Verifique se os arquivos estão carregando (status 200)

### 4. Tente Modo Anônimo/Privado
- Abra uma janela anônima/privada
- Acesse `http://localhost:3000`

### 5. Verifique o Firewall do Windows
1. Abra "Firewall do Windows Defender"
2. Verifique se a porta 3000 está permitida
3. Se necessário, adicione uma regra para permitir conexões na porta 3000

### 6. Verifique se o Servidor Está Rodando
Execute o diagnóstico:
```powershell
cd E:\SGSB-master\SGSB_INSP
.\diagnosticar-acesso.ps1
```

### 7. Reinicie o Servidor
Se nada funcionar, reinicie o servidor:
```powershell
# Parar todos os processos Node.js
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force

# Aguardar 2 segundos
Start-Sleep -Seconds 2

# Iniciar novamente
cd E:\SGSB-master\SGSB_INSP
npx --yes pnpm start
```

## 📋 Checklist de Diagnóstico

Execute este checklist se ainda tiver problemas:

- [ ] Servidor está rodando? (Execute: `Get-Process | Where-Object {$_.ProcessName -eq "node"}`)
- [ ] Health check responde? (Acesse: `http://localhost:3000/api/health`)
- [ ] Página principal carrega? (Acesse: `http://localhost:3000`)
- [ ] Console do navegador mostra erros? (F12 → Console)
- [ ] Network tab mostra arquivos carregando? (F12 → Network)
- [ ] Cache do navegador foi limpo? (Ctrl+Shift+Delete)
- [ ] Tentou modo anônimo? (Ctrl+Shift+N)
- [ ] Firewall está bloqueando? (Verificar Firewall do Windows)

## 💡 Informações Importantes

- **Porta padrão:** 3000
- **Modo:** Produção (NODE_ENV=production)
- **Autenticação:** Desabilitada (SKIP_AUTH=true)
- **Host:** 0.0.0.0 (aceita conexões de qualquer IP)

## 🆘 Ainda com Problemas?

Se após seguir todos os passos acima você ainda não conseguir acessar:

1. **Compartilhe os erros do console do navegador** (F12 → Console)
2. **Compartilhe os erros do Network tab** (F12 → Network)
3. **Execute o diagnóstico completo:**
   ```powershell
   cd E:\SGSB-master\SGSB_INSP
   .\diagnosticar-acesso.ps1
   ```
4. **Verifique os logs do servidor** no terminal onde você rodou `pnpm start`

