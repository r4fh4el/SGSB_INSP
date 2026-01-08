# 📋 Guia de Logs de Debug - Sistema de Alertas

## 🔍 Logs Implementados

Adicionei logs detalhados em todo o fluxo de criação de alertas. Agora você pode ver exatamente o que está acontecendo em cada etapa.

---

## 📊 Onde Ver os Logs

Os logs aparecem no **terminal onde o servidor está rodando**.

### Como ver os logs:

1. **Abra o terminal** onde você executou `npm run dev`
2. **Procure por** `[ALERTA DEBUG]` ou `[CREATE ALERTA DEBUG]`
3. **Registre uma leitura** que ultrapasse os limites
4. **Observe os logs** que aparecem automaticamente

---

## 🔍 Tipos de Logs

### 1. **Início da Criação de Leitura**
```
[ALERTA DEBUG] ============================================
[ALERTA DEBUG] INICIANDO CRIAÇÃO DE LEITURA
[ALERTA DEBUG] ============================================
```

Mostra:
- Dados recebidos (instrumentoId, valor, dataHora, usuarioId)

---

### 2. **Instrumento Encontrado**
```
[ALERTA DEBUG] Instrumento encontrado:
```

Mostra:
- Se o instrumento foi encontrado
- ID, código, barragemId
- Todos os limites configurados

---

### 3. **Valor Parseado**
```
[ALERTA DEBUG] Valor parseado:
```

Mostra:
- Valor original (string)
- Valor numérico (number)
- Se é NaN ou não

---

### 4. **Cálculo de Severidade**
```
[ALERTA DEBUG] Calculando severidade do alerta...
[ALERTA DEBUG] Resultado do cálculo:
```

Mostra:
- Severidade calculada
- Tipo de inconsistência
- Se deve alertar ou não

---

### 5. **Verificação de Limites**
```
[ALERTA DEBUG] Verificando limites:
```

Mostra:
- Valor da leitura
- Todos os limites do instrumento (raw e parseados)
- Código do instrumento

---

### 6. **Condições para Criar Alerta**
```
[ALERTA DEBUG] ============================================
[ALERTA DEBUG] VERIFICANDO CONDIÇÕES PARA CRIAR ALERTA
[ALERTA DEBUG] ============================================
```

Mostra:
- ✅ ou ❌ para cada condição:
  - temInconsistencia
  - temInstrumento
  - temInsertedId
  - temTipoInconsistencia

---

### 7. **Dados do Alerta**
```
[ALERTA DEBUG] Dados do alerta a ser criado:
```

Mostra:
- barragemId
- tipo
- severidade
- título
- tamanho da mensagem
- instrumentoId
- leituraId

---

### 8. **Criação no Banco**
```
[CREATE ALERTA DEBUG] Criando alerta no banco de dados...
[CREATE ALERTA DEBUG] Resultado da inserção:
```

Mostra:
- ID do alerta criado
- Se foi criado com sucesso
- Recordset completo (em caso de erro)

---

## ✅ Exemplo de Logs (Sucesso)

Quando tudo funciona corretamente, você verá:

```
[ALERTA DEBUG] ============================================
[ALERTA DEBUG] INICIANDO CRIAÇÃO DE LEITURA
[ALERTA DEBUG] ============================================
[ALERTA DEBUG] Dados recebidos: { instrumentoId: 1, valor: '32.0', ... }
[ALERTA DEBUG] Instrumento encontrado: { encontrado: true, codigo: 'SEN-001', ... }
[ALERTA DEBUG] Valor parseado: { valorNumerico: 32, isNaN: false }
[ALERTA DEBUG] Calculando severidade do alerta...
[ALERTA DEBUG] Verificando limites: { valor: 32, limites: { limiteSuperior: '30.0' }, ... }
[ALERTA DEBUG] ✅ ALERTA DEVE SER CRIADO! { severidade: 'critico', ... }
[ALERTA DEBUG] ✅ TODAS AS CONDIÇÕES ATENDIDAS - Criando alerta...
[CREATE ALERTA DEBUG] Criando alerta no banco de dados...
[CREATE ALERTA DEBUG] ✅✅✅ ALERTA CRIADO COM SUCESSO NO BANCO! ✅✅✅
[CREATE ALERTA DEBUG] ID do Alerta: 123
```

---

## ❌ Exemplo de Logs (Erro)

Quando algo não funciona, você verá:

```
[ALERTA DEBUG] Instrumento encontrado: { encontrado: true, ... }
[ALERTA DEBUG] Valor parseado: { valorNumerico: 32, ... }
[ALERTA DEBUG] ⚠️ Alerta NÃO deve ser criado - valores dentro dos limites
[ALERTA DEBUG] ⚠️⚠️⚠️ ALERTA NÃO FOI CRIADO ⚠️⚠️⚠️
[ALERTA DEBUG] Razões: { temInconsistencia: false, ... }
```

Ou:

```
[ALERTA DEBUG] ❌ Instrumento não encontrado! ID: 999
[ALERTA DEBUG] ⚠️⚠️⚠️ ALERTA NÃO FOI CRIADO ⚠️⚠️⚠️
```

---

## 🔍 Problemas Comuns e Soluções

### Problema 1: "Instrumento não encontrado"
**Causa:** ID do instrumento não existe no banco
**Solução:** Verifique se o instrumentoId está correto

---

### Problema 2: "Nenhum limite configurado"
**Causa:** Instrumento não tem limites configurados
**Solução:** Edite o instrumento e configure pelo menos um limite

---

### Problema 3: "Valor não ultrapassa limites"
**Causa:** Valor da leitura está dentro dos limites
**Solução:** Registre uma leitura com valor que ultrapasse os limites

---

### Problema 4: "Alerta NÃO foi criado (ID = 0)"
**Causa:** Erro ao inserir no banco de dados
**Solução:** 
- Verifique se a tabela existe
- Verifique as Foreign Keys
- Veja o erro completo nos logs

---

## 📝 Checklist de Verificação

Quando registrar uma leitura, verifique nos logs:

- [ ] ✅ Instrumento foi encontrado?
- [ ] ✅ Valor foi parseado corretamente?
- [ ] ✅ Limites estão configurados no instrumento?
- [ ] ✅ Valor ultrapassa os limites?
- [ ] ✅ Cálculo de severidade funcionou?
- [ ] ✅ Todas as condições para criar alerta foram atendidas?
- [ ] ✅ Alerta foi criado no banco (ID > 0)?

---

## 🚀 Próximos Passos

1. **Registre uma leitura** que ultrapasse os limites
2. **Observe os logs** no terminal
3. **Identifique** qual etapa está falhando
4. **Corrija** o problema baseado nos logs
5. **Teste novamente**

Os logs agora mostram **TUDO** que está acontecendo! 🎯

