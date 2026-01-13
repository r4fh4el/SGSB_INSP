# 🔧 Solução: Integração com SGSB-WEB

## ✅ Configuração Atualizada

A URL do SGSB-WEB foi atualizada no arquivo `.env`:
- **HIDRO_API_URL**: `http://72.60.57.220:8080`
- **VITE_SGSB_FINAL_API_URL**: `http://72.60.57.220:8080`

## ⚠️ IMPORTANTE: Recompilar o Frontend

A variável `VITE_SGSB_FINAL_API_URL` é **incorporada no build** do frontend. Após alterá-la, você **DEVE** recompilar:

```powershell
cd E:\SGSB-master\SGSB_INSP

# 1. Parar o servidor atual
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force

# 2. Recompilar o frontend
npm run build

# 3. Reiniciar o servidor
npx --yes pnpm start
```

## 🔍 Endpoint da API

O endpoint usado para buscar cálculos automáticos é:
```
GET http://72.60.57.220:8080/API/BuscarCalculosAutomaticosPorBarragem?barragemId={id}
```

## 🧪 Testar a Integração

Execute o script de teste:
```powershell
cd E:\SGSB-master\SGSB_INSP
.\testar-integracao-sgsb-web.ps1
```

Ou teste manualmente no navegador:
```
http://72.60.57.220:8080/API/BuscarCalculosAutomaticosPorBarragem?barragemId=1
```

## 📋 Checklist

- [x] URL atualizada no `.env`
- [ ] Frontend recompilado (`npm run build`)
- [ ] Servidor reiniciado
- [ ] Teste de conexão realizado
- [ ] Página de Cálculo Automático funcionando

## 🐛 Problemas Comuns

### 1. Ainda mostra erro de conexão após recompilar

**Solução:**
- Limpe o cache do navegador (Ctrl+Shift+Delete)
- Recarregue a página com Ctrl+F5 (hard refresh)
- Verifique o console do navegador (F12) para erros

### 2. API retorna 404

**Possíveis causas:**
- Endpoint incorreto
- Barragem não existe no SGSB-WEB
- Servidor SGSB-WEB não está rodando

**Solução:**
- Verifique se o SGSB-WEB está acessível em `http://72.60.57.220:8080`
- Teste o endpoint diretamente no navegador
- Verifique se a barragem existe no banco de dados do SGSB-WEB

### 3. API retorna 500 (Erro interno)

**Possíveis causas:**
- Erro no servidor SGSB-WEB
- Dados de caracterização não encontrados
- Problema de conexão entre SGSB-WEB e SGSB_INSP

**Solução:**
- Verifique os logs do SGSB-WEB
- Verifique se há dados de caracterização para a barragem
- Verifique a conexão entre os sistemas

## 💡 Como Funciona

1. **Usuário seleciona uma barragem** na página de Cálculo Automático
2. **Frontend faz requisição** para `VITE_SGSB_FINAL_API_URL/API/BuscarCalculosAutomaticosPorBarragem?barragemId={id}`
3. **SGSB-WEB busca dados** de caracterização do SGSB_INSP
4. **SGSB-WEB calcula** os índices, tempos e vazões
5. **SGSB-WEB retorna** os resultados em JSON
6. **Frontend exibe** os resultados na página

## 🔄 Fluxo de Dados

```
SGSB_INSP (Frontend)
    ↓ (requisição HTTP)
SGSB-WEB (API)
    ↓ (busca caracterização)
SGSB_INSP (Banco de Dados)
    ↓ (retorna dados)
SGSB-WEB (calcula)
    ↓ (retorna resultados)
SGSB_INSP (Frontend exibe)
```

