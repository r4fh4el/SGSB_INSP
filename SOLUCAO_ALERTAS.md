# 🔧 Solução - Alertas Não Aparecem

## ✅ CORREÇÕES APLICADAS

### 1. **Tratamento de Strings Vazias**
Os campos de limites agora tratam strings vazias (`""`) como `null`, evitando erros de parsing.

### 2. **Logs de Debug Melhorados**
Agora você pode ver nos logs do servidor exatamente o que está acontecendo quando uma leitura é registrada.

---

## 🧪 TESTE AGORA

### Passo 1: Edite o Instrumento
1. Vá para página **Instrumentos**
2. Selecione uma barragem
3. Clique no ícone de **editar** (✏️) no instrumento que você cadastrou
4. **Verifique e configure:**
   - Limite Superior: `30.0` (ou outro valor)
   - OU Nível Alerta: `25.0`
   - OU Nível Crítico: `28.0`
   - Unidade de Medida: `m` (ou outra)

5. **Salve** o instrumento

### Passo 2: Registre uma Leitura
1. No mesmo instrumento, clique em **"Registrar Leitura"**
2. Digite um valor que **ULTRApasse** o limite configurado:
   - Se limite superior é `30.0`, digite `32.0` (ou maior)
   - Se nível crítico é `28.0`, digite `29.0` (ou maior)
   - Se nível alerta é `25.0`, digite `26.0` (ou maior)

3. Clique em **"Salvar"**

### Passo 3: Verifique os Logs
No terminal onde o servidor está rodando, você verá logs como:

```
[ALERTA DEBUG] Verificando limites: {
  valor: 32.0,
  limites: { limiteSuperior: '30.0', ... },
  parseados: { limiteSuperior: 30, ... }
}
[ALERTA DEBUG] Leitura criada: {
  inconsistencia: true,
  severidadeAlerta: 'critico',
  ...
}
[ALERTA DEBUG] Alerta criado com sucesso: 123
```

### Passo 4: Verifique a Página de Alertas
1. Vá para página **Alertas** (no menu lateral)
2. **Selecione a barragem** no dropdown
3. Você deve ver o alerta aparecendo!

---

## ⚠️ IMPORTANTE

### Se o alerta ainda não aparecer:

1. **Verifique os logs do servidor:**
   - Procure por `[ALERTA DEBUG]`
   - Veja se há erros ou mensagens

2. **Verifique se o instrumento tem limites:**
   - Os logs mostram quais limites foram encontrados
   - Se todos são `null`, significa que não há limites configurados

3. **Verifique se o valor ultrapassa:**
   - Se limite superior é `30.0`, precisa ler `> 30.0` (ou `≥ 28.5` para alerta crítico)

4. **Verifique a barragem:**
   - Na página de Alertas, você precisa selecionar a barragem correta
   - Deve ser a mesma barragem onde o instrumento está cadastrado

---

## 🐛 PROBLEMAS COMUNS

### Problema: "Nenhum limite configurado"
**Solução:**
- Edite o instrumento
- Preencha pelo menos UM dos campos:
  - Limite Superior OU
  - Limite Inferior OU
  - Nível Alerta OU
  - Nível Crítico

### Problema: "Valor não ultrapassa limite"
**Solução:**
- Verifique se o valor da leitura é MAIOR que o limite superior
- Exemplo: Se limite superior é `30.0`, precisa ler `> 30.0`

### Problema: "Barragem não selecionada"
**Solução:**
- Na página de Alertas, selecione a barragem no dropdown
- Deve ser a mesma barragem onde o instrumento está cadastrado

---

## 📝 RESUMO

1. ✅ Campos de limites agora tratam strings vazias corretamente
2. ✅ Logs de debug mostram o que está acontecendo
3. ✅ Sistema verifica limites automaticamente ao registrar leitura
4. ✅ Alertas são criados automaticamente quando limites são ultrapassados

**Teste agora registrando uma leitura que ultrapasse os limites!**

