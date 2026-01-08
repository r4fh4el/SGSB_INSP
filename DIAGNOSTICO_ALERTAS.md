# 🔍 Diagnóstico - Alertas Não Aparecem

## ✅ CHECKLIST DE VERIFICAÇÃO

### 1. **Instrumento Configurado?**

Verifique se o instrumento tem **PELO MENOS UM** dos seguintes campos preenchidos:

- [ ] `limiteInferior` - Valor mínimo
- [ ] `limiteSuperior` - Valor máximo  
- [ ] `nivelAlerta` - Nível de alerta
- [ ] `nivelCritico` - Nível crítico

**Como verificar:**
1. Vá para página **Instrumentos**
2. Clique em editar o instrumento
3. Verifique se algum limite está preenchido

---

### 2. **Leitura Registrada?**

Verifique se foi registrada uma leitura para o instrumento:

- [ ] Leitura foi registrada após configurar os limites?
- [ ] O valor da leitura ultrapassa algum limite?

**Como verificar:**
1. Vá para página **Instrumentos**
2. Clique no instrumento
3. Clique em **"Visualizar Leituras"**
4. Verifique se há leituras registradas
5. Verifique se alguma leitura ultrapassa os limites

---

### 3. **Valor Ultrapassa Limites?**

Para gerar alerta, o valor precisa **ULTRApassar** os limites:

#### Exemplo:
```
Limite Superior: 30.0
Leitura: 32.0 → ✅ GERA ALERTA
Leitura: 25.0 → ❌ NÃO gera alerta (dentro do limite)
```

#### Cenários que geram alerta:
- Valor ≥ Limite Superior → 🔴 CRÍTICO
- Valor ≥ 95% do Limite Superior → 🔴 CRÍTICO
- Valor ≥ 90% do Limite Superior → 🟠 ALERTA
- Valor ≥ 80% do Limite Superior → 🟡 AVISO
- Valor ≤ Limite Inferior → 🔴 CRÍTICO
- Valor ≤ 105% do Limite Inferior → 🔴 CRÍTICO
- Valor ≥ Nível Crítico → 🔴 CRÍTICO
- Valor ≥ Nível Alerta (sem crítico) → 🟠 ALERTA

---

### 4. **Barragem Selecionada?**

Na página de Alertas, verifique:

- [ ] Barragem foi selecionada?
- [ ] É a barragem correta do instrumento?

**Como verificar:**
1. Vá para página **Alertas**
2. Verifique se há uma barragem selecionada no dropdown
3. Se não houver, selecione a barragem do instrumento

---

### 5. **Filtros Aplicados?**

Verifique se há filtros que estão ocultando os alertas:

- [ ] Filtro de Status: "Todos" ou "Não Lidos"?
- [ ] Filtro de Severidade: "Todas" ou específica?

**Como verificar:**
1. Na página de Alertas
2. Verifique os filtros no topo
3. Tente selecionar "Todos" e "Todas"

---

### 6. **Console do Navegador**

Abra o console do navegador (F12) e verifique:

- [ ] Há erros no console?
- [ ] A requisição para buscar alertas está sendo feita?
- [ ] A resposta contém alertas?

**Como verificar:**
1. Pressione F12 no navegador
2. Vá para aba **Console**
3. Vá para aba **Network**
4. Recarregue a página de Alertas
5. Procure por requisições para `/api/trpc/alertas.listByBarragem`
6. Verifique a resposta

---

### 7. **Logs do Servidor**

Verifique os logs do servidor para ver se:

- [ ] O alerta está sendo criado?
- [ ] Há erros na criação do alerta?

**Como verificar:**
1. Veja o terminal onde o servidor está rodando
2. Procure por logs começando com `[ALERTA DEBUG]`
3. Verifique se há mensagens de erro

---

## 🧪 TESTE RÁPIDO

### Passo a Passo para Testar:

1. **Crie um Instrumento de Teste:**
   ```
   Código: TESTE-ALERTA
   Tipo: Medidor de Nível
   Limite Superior: 10.0
   Unidade: m
   ```

2. **Registre uma Leitura que Ultrapasse:**
   ```
   Valor: 15.0 (acima do limite superior 10.0)
   ```

3. **Verifique o Alerta:**
   - Vá para página **Alertas**
   - Selecione a barragem
   - Você deve ver um alerta **CRÍTICO**

---

## 🐛 PROBLEMAS COMUNS

### Problema 1: Instrumento sem limites

**Sintoma:** Instrumento cadastrado mas nenhum alerta aparece

**Solução:**
- Edite o instrumento
- Configure pelo menos um limite (inferior, superior, alerta ou crítico)
- Salve o instrumento
- Registre uma nova leitura que ultrapasse o limite

---

### Problema 2: Leitura não ultrapassa limite

**Sintoma:** Leitura registrada mas não gera alerta

**Solução:**
- Verifique se o valor da leitura realmente ultrapassa os limites
- Exemplo: Se limite superior é 30.0, precisa ler > 30.0 (ou ≥ 28.5 para alerta crítico)

---

### Problema 3: Barragem não selecionada

**Sintoma:** Página de Alertas está vazia

**Solução:**
- Selecione uma barragem no dropdown no topo da página de Alertas
- Certifique-se de que é a barragem correta onde o instrumento está cadastrado

---

### Problema 4: Filtros ocultando alertas

**Sintoma:** Não vê alertas mesmo sabendo que existem

**Solução:**
- Na página de Alertas, verifique os filtros:
  - Status: Selecione "Todos"
  - Severidade: Selecione "Todas"

---

## 📋 RESUMO DO FLUXO

```
1. Instrumento cadastrado com limites
   ↓
2. Leitura registrada com valor que ultrapassa limite
   ↓
3. Sistema verifica limites automaticamente
   ↓
4. Sistema cria alerta no banco de dados
   ↓
5. Alerta aparece na página de Alertas
```

---

## 🆘 AINDA NÃO FUNCIONA?

Se após verificar todos os itens acima o problema persistir:

1. **Verifique os logs do servidor:**
   - Procure por `[ALERTA DEBUG]` no terminal
   - Verifique se há erros

2. **Verifique o banco de dados:**
   - Execute: `SELECT * FROM alertas WHERE barragemId = [ID]`
   - Verifique se os alertas estão sendo criados

3. **Limpe o cache do navegador:**
   - Pressione Ctrl+Shift+Delete
   - Limpe cache e cookies
   - Recarregue a página (F5)

4. **Reinicie o servidor:**
   - Pare o servidor (Ctrl+C)
   - Inicie novamente (`npm run dev`)

