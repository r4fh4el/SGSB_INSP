# ✅ Configuração de Integração SGSB-WEB - COMPLETA

## ✅ Status

A integração foi configurada com sucesso!

## 📋 Configuração Atual

**Arquivo:** `.env`

```env
# URL do SGSB-WEB para o servidor Node.js
HIDRO_API_URL=http://72.60.57.220:5204

# URL do SGSB-WEB para o frontend React
VITE_SGSB_FINAL_API_URL=http://72.60.57.220:5204
```

## 🔗 Endpoints da API

### Swagger/Documentação
- **URL:** http://72.60.57.220:5204/swagger/index.html

### Cálculo Automático
- **Endpoint:** `GET /API/BuscarCalculosAutomaticosPorBarragem?barragemId={id}`
- **URL Completa:** http://72.60.57.220:5204/API/BuscarCalculosAutomaticosPorBarragem?barragemId=1

## ✅ O que foi feito

1. ✅ URL atualizada no `.env` para `http://72.60.57.220:5204`
2. ✅ Frontend recompilado com a nova URL
3. ✅ Servidor reiniciado

## 🧪 Como Testar

### 1. Testar no Navegador

Acesse a página de Cálculo Automático:
```
http://localhost:3000/calculo-automatico
```

1. Selecione uma barragem
2. Verifique o status de conexão (deve mostrar "Conectado")
3. Clique em "Buscar Cálculos"
4. Os dados devem ser carregados do SGSB-WEB

### 2. Testar API Diretamente

No navegador ou Postman:
```
http://72.60.57.220:5204/API/BuscarCalculosAutomaticosPorBarragem?barragemId=1
```

Deve retornar JSON com:
- `tempoConcentracao`
- `indiceCaracterizacao`
- `vazaoPico`

### 3. Verificar Console do Navegador

1. Abra o navegador (F12)
2. Vá na aba **Console**
3. Procure por mensagens como:
   - `[CalculoAutomatico] Tentando buscar de: ...`
   - `[CalculoAutomatico] Dados recebidos do SGSB-WEB: ...`

## 🔍 Troubleshooting

### Problema: Status mostra "Erro"

**Verifique:**
1. O SGSB-WEB está rodando em `http://72.60.57.220:5204`?
2. O Swagger está acessível? (http://72.60.57.220:5204/swagger/index.html)
3. Há firewall bloqueando a conexão?

**Solução:**
- Teste o endpoint diretamente no navegador
- Verifique os logs do SGSB-WEB
- Verifique o console do navegador (F12) para erros específicos

### Problema: Dados não aparecem

**Possíveis causas:**
1. Barragem não existe no SGSB-WEB
2. Barragem não tem caracterização cadastrada
3. API retorna dados vazios

**Solução:**
- Verifique se a barragem existe no banco de dados
- Verifique se há caracterização cadastrada para a barragem
- Teste com diferentes `barragemId`

### Problema: Timeout na requisição

**Possíveis causas:**
1. SGSB-WEB está lento para processar
2. Problema de rede
3. Endpoint não está respondendo

**Solução:**
- Aumente o timeout no código (se necessário)
- Verifique se o SGSB-WEB está processando corretamente
- Verifique os logs do SGSB-WEB

## 📝 Notas Importantes

1. **VITE_SGSB_FINAL_API_URL** é incorporada no build do frontend
   - Se alterar, precisa recompilar: `npm run build`
   - Depois reiniciar o servidor

2. **HIDRO_API_URL** é usada pelo backend Node.js
   - Pode ser alterada sem recompilar
   - Mas precisa reiniciar o servidor

3. **CORS**: Certifique-se de que o SGSB-WEB permite requisições do SGSB_INSP

## 🎯 Próximos Passos

1. Teste a integração na página de Cálculo Automático
2. Verifique se os dados estão sendo exibidos corretamente
3. Se houver erros, verifique os logs e o console do navegador

## 📞 Suporte

Se ainda houver problemas:
1. Verifique os logs do servidor Node.js
2. Verifique o console do navegador (F12)
3. Teste o endpoint diretamente no navegador
4. Verifique os logs do SGSB-WEB



