# 🚨 Como Configurar Alertas Automáticos

## 📍 ONDE CONFIGURAR OS LIMITES

Os limites são configurados na página de **Instrumentos**.

### Passo a Passo:

1. **Acesse a página de Instrumentos**
   - Menu lateral → **Instrumentos**

2. **Selecione uma Barragem**
   - No topo da página, escolha uma barragem no dropdown

3. **Criar ou Editar um Instrumento**
   - Clique em **"Novo Instrumento"** para criar
   - OU clique no ícone de editar (✏️) em um instrumento existente

4. **Configure os Limites**

   No formulário, você verá duas seções:

   #### **Seção: Limites de Leitura**
   - **Limite Inferior**: Valor mínimo aceitável
     - Exemplo: `0.5` (para nível d'água em metros)
   - **Limite Superior**: Valor máximo aceitável
     - Exemplo: `30.0` (para nível d'água em metros)

   #### **Seção: Níveis de Referência**
   - **Nível Normal**: Valor de referência normal
     - Exemplo: `15.0`
   - **Nível Alerta**: Valor que indica alerta
     - Exemplo: `25.0`
   - **Nível Crítico**: Valor que indica situação crítica
     - Exemplo: `28.0`

5. **Configure a Unidade de Medida**
   - Campo: **"Unidade de Medida"**
   - Exemplos: `m`, `m³/s`, `kPa`, `mm`

6. **Salve o Instrumento**
   - Clique em **"Salvar"**

---

## ✅ CONFIGURAÇÃO MÍNIMA NECESSÁRIA

**Para que os alertas funcionem, configure PELO MENOS UM dos seguintes:**

- ✅ `limiteInferior` OU
- ✅ `limiteSuperior` OU
- ✅ `nivelAlerta` OU
- ✅ `nivelCritico`

**Recomendação:** Configure pelo menos `limiteInferior` e `limiteSuperior` para alertas completos.

---

## 🧪 COMO TESTAR OS ALERTAS

### Teste Rápido:

1. **Configure um instrumento:**
   - Limite Superior: `30.0`
   - Unidade: `m`

2. **Registre uma leitura que ultrapasse o limite:**
   - Acesse o instrumento
   - Clique em **"Registrar Leitura"**
   - Digite um valor maior que o limite superior (ex: `32.0`)
   - Clique em **"Salvar"**

3. **Verifique o alerta:**
   - Vá para a página **"Alertas"**
   - Selecione a barragem
   - Você deve ver um alerta **CRÍTICO** aparecendo automaticamente

---

## 📊 EXEMPLOS DE CONFIGURAÇÃO

### Exemplo 1: Sensor de Nível d'Água

```
Código: SEN-001
Tipo: Medidor de Nível
Unidade de Medida: m

Limite Inferior: 0.5
Limite Superior: 30.0

Nível Normal: 15.0
Nível Alerta: 25.0
Nível Crítico: 28.0
```

**Leituras que geram alertas:**
- `0.3 m` → 🔴 CRÍTICO (abaixo do inferior)
- `24.0 m` → 🟡 AVISO (80% do superior)
- `27.0 m` → 🟠 ALERTA (90% do superior)
- `28.5 m` → 🔴 CRÍTICO (95% do superior)
- `30.5 m` → 🔴 CRÍTICO (acima do superior)

---

### Exemplo 2: Piezômetro (Pressão)

```
Código: PIEZ-001
Tipo: Piezômetro
Unidade de Medida: kPa

Limite Inferior: 50
Limite Superior: 500

Nível Crítico: 450
```

**Leituras que geram alertas:**
- `45 kPa` → 🔴 CRÍTICO (abaixo do inferior)
- `55 kPa` → 🔴 CRÍTICO (muito próximo do inferior)
- `400 kPa` → 🟡 AVISO (80% do superior)
- `455 kPa` → 🔴 CRÍTICO (acima do crítico)
- `510 kPa` → 🔴 CRÍTICO (acima do superior)

---

## 🔍 TROUBLESHOOTING

### Problema: Alertas não aparecem

**Verifique:**

1. ✅ **Limites configurados?**
   - O instrumento tem pelo menos um limite configurado?
   - Verifique na página de Instrumentos

2. ✅ **Leitura registrada?**
   - A leitura foi registrada após configurar os limites?
   - O valor da leitura ultrapassa algum limite?

3. ✅ **Barragem selecionada?**
   - Na página de Alertas, você selecionou a barragem correta?

4. ✅ **Filtros aplicados?**
   - Não há filtros que escondem os alertas?
   - Verifique os filtros de "Status" e "Severidade"

5. ✅ **Banco de dados?**
   - O sistema está conectado ao banco de dados correto?
   - Verifique as variáveis de ambiente

---

### Problema: Campos não aparecem no formulário

**Solução:**
- Certifique-se de que o sistema foi atualizado
- Recarregue a página (F5)
- Limpe o cache do navegador

---

## 📝 CHECKLIST DE CONFIGURAÇÃO

- [ ] Instrumento criado/editado
- [ ] Limite Inferior configurado (ou outro limite)
- [ ] Limite Superior configurado (ou outro limite)
- [ ] Unidade de Medida definida
- [ ] Instrumento salvo com sucesso
- [ ] Leitura registrada com valor que ultrapassa limite
- [ ] Página de Alertas acessada
- [ ] Barragem selecionada na página de Alertas
- [ ] Alertas visíveis na lista

---

## 💡 DICAS

1. **Configure sempre a Unidade de Medida** - Isso ajuda na compreensão dos alertas
2. **Use valores consistentes** - Todos os limites devem usar a mesma unidade
3. **Configure os 4 níveis** - Para alertas mais precisos, configure Normal, Alerta e Crítico
4. **Teste com valores conhecidos** - Use valores que você sabe que devem gerar alertas
5. **Verifique os filtros** - Na página de Alertas, certifique-se de que os filtros não estão ocultando nada

---

## 🆘 PRECISA DE AJUDA?

Se os alertas ainda não aparecem:

1. Verifique o console do navegador (F12) para erros
2. Verifique os logs do servidor
3. Confirme que a leitura foi registrada no banco de dados
4. Verifique se o instrumento tem os limites configurados no banco

