# 🚨 Quando os Alertas São Enviados Automaticamente?

## 📋 Resumo Executivo

Os alertas são **enviados automaticamente** sempre que uma **leitura é registrada** (via app mobile, web ou automático) e o **valor ultrapassa os limites configurados** no instrumento.

---

## ⚡ Momento Exato do Envio

**O alerta é criado NO MOMENTO em que:**
1. ✅ Uma leitura é registrada no sistema (função `createLeitura`)
2. ✅ O sistema verifica automaticamente os limites do instrumento
3. ✅ Se o valor ultrapassar qualquer limite → **ALERTA É CRIADO IMEDIATAMENTE**
4. ✅ O alerta aparece na página de Alertas instantaneamente

---

## 🎯 Condições para Gerar Alerta

### ✅ **PRÉ-REQUISITO OBRIGATÓRIO:**

O instrumento **DEVE TER pelo menos UM dos seguintes campos configurados:**

- `limiteInferior` (Valor mínimo aceitável)
- `limiteSuperior` (Valor máximo aceitável)  
- `nivelAlerta` (Valor que indica alerta)
- `nivelCritico` (Valor que indica situação crítica)

**❌ Se NENHUM limite estiver configurado → NENHUM alerta será gerado**

---

## 📊 CENÁRIOS DE ALERTA POR SEVERIDADE

### 🔴 **CRÍTICO** - Ação Imediata Necessária

O alerta será enviado quando:

#### 1. **Ultrapassar Limite Superior**
```
Valor ≥ Limite Superior
```
**Exemplo:**
- Limite Superior: 30.0 m
- Leitura: 30.5 m → **ALERTA CRÍTICO**

#### 2. **Próximo ao Limite Superior (95-100%)**
```
Valor entre 95% e 100% do Limite Superior
```
**Exemplo:**
- Limite Superior: 30.0 m
- Leitura: 28.5 m (95% de 30.0) → **ALERTA CRÍTICO**

#### 3. **Abaixo do Limite Inferior**
```
Valor ≤ Limite Inferior
```
**Exemplo:**
- Limite Inferior: 0.5 m
- Leitura: 0.3 m → **ALERTA CRÍTICO**

#### 4. **Muito Abaixo do Limite Inferior (≤50%)**
```
Valor ≤ 50% do Limite Inferior
```
**Exemplo:**
- Limite Inferior: 0.5 m
- Leitura: 0.2 m (40% de 0.5) → **ALERTA CRÍTICO**

#### 5. **Muito Próximo do Limite Inferior (0-5% acima)**
```
Valor entre 100% e 105% do Limite Inferior
```
**Exemplo:**
- Limite Inferior: 50 kPa
- Leitura: 52 kPa (4% acima) → **ALERTA CRÍTICO**

#### 6. **Ultrapassar Nível Crítico Configurado**
```
Valor ≥ Nível Crítico
```
**Exemplo:**
- Nível Crítico: 28.0 m
- Leitura: 28.5 m → **ALERTA CRÍTICO**

#### 7. **Valor Não Numérico com Palavras-Chave**
```
Valor contém: "erro", "falha" ou "crítico"
```
**Exemplo:**
- Leitura: "ERRO DE SENSOR" → **ALERTA CRÍTICO**
- Leitura: "Falha na comunicação" → **ALERTA CRÍTICO**

---

### 🟠 **ALERTA** - Atenção Imediata

O alerta será enviado quando:

#### 1. **Próximo ao Limite Superior (90-95%)**
```
Valor entre 90% e 95% do Limite Superior
```
**Exemplo:**
- Limite Superior: 30.0 m
- Leitura: 27.5 m (91.7% de 30.0) → **ALERTA**

#### 2. **Próximo ao Limite Inferior (5-10% acima)**
```
Valor entre 105% e 110% do Limite Inferior
```
**Exemplo:**
- Limite Inferior: 50 kPa
- Leitura: 55 kPa (10% acima) → **ALERTA**

#### 3. **Ultrapassar Nível de Alerta (sem ultrapassar crítico)**
```
Valor ≥ Nível Alerta E Valor < Nível Crítico
```
**Exemplo:**
- Nível Alerta: 25.0 m
- Nível Crítico: 28.0 m
- Leitura: 26.5 m → **ALERTA**

---

### 🟡 **AVISO** - Monitoramento

O alerta será enviado quando:

#### 1. **Aproximando-se do Limite Superior (80-90%)**
```
Valor entre 80% e 90% do Limite Superior
```
**Exemplo:**
- Limite Superior: 30.0 m
- Leitura: 24.0 m (80% de 30.0) → **AVISO**

#### 2. **Aproximando-se do Limite Inferior (10-20% acima)**
```
Valor entre 110% e 120% do Limite Inferior
```
**Exemplo:**
- Limite Inferior: 50 kPa
- Leitura: 60 kPa (20% acima) → **AVISO**

#### 3. **Próximo aos Limites da Faixa Normal**
```
Valor entre 80-90% OU 10-20% da faixa normal
```
**Exemplo:**
- Faixa Normal: 10.0 m a 20.0 m
- Leitura: 18.0 m (80% da faixa) → **AVISO**

---

### 🔵 **INFO** - Informação (NÃO GERA ALERTA)

O alerta **NÃO será enviado** quando:

- Valor está dentro dos limites normais
- Valor está longe dos limites configurados
- Não há limites configurados no instrumento

---

## 🔄 FLUXO AUTOMÁTICO

```
1. Usuário registra leitura
   ↓
2. Sistema busca instrumento no banco
   ↓
3. Sistema calcula severidade (calcularSeveridadeAlerta)
   ↓
4. Verifica limites em ordem de prioridade:
   a) Nível Crítico
   b) Limite Superior (100% → 95% → 90% → 80%)
   c) Nível Alerta
   d) Limite Inferior (≤100% → ≤105% → ≤110% → ≤120%)
   e) Faixa Normal próxima aos limites
   ↓
5. Se deveAlertar = true:
   ✅ Marca leitura como inconsistente
   ✅ Cria alerta no banco
   ✅ Alerta aparece na página de Alertas
   ↓
6. Se deveAlertar = false:
   ❌ Não gera alerta
   ✅ Leitura registrada normalmente
```

---

## 📝 EXEMPLOS PRÁTICOS

### Exemplo 1: Sensor de Nível d'Água

**Configuração:**
```
Limite Inferior: 0.5 m
Limite Superior: 30.0 m
Nível Normal: 15.0 m
Nível Alerta: 25.0 m
Nível Crítico: 28.0 m
```

**Leituras e Alertas:**

| Leitura | Percentual | Severidade | Alerta Enviado? |
|---------|------------|------------|-----------------|
| 0.2 m | 40% do inferior | 🔴 CRÍTICO | ✅ SIM |
| 0.6 m | 120% do inferior | 🟡 AVISO | ✅ SIM |
| 10.0 m | Normal | 🔵 INFO | ❌ NÃO |
| 24.0 m | 80% do superior | 🟡 AVISO | ✅ SIM |
| 27.0 m | 90% do superior | 🟠 ALERTA | ✅ SIM |
| 28.5 m | 95% do superior | 🔴 CRÍTICO | ✅ SIM |
| 30.5 m | ≥100% superior | 🔴 CRÍTICO | ✅ SIM |

---

### Exemplo 2: Piezômetro (Pressão)

**Configuração:**
```
Limite Inferior: 50 kPa
Limite Superior: 500 kPa
Nível Crítico: 450 kPa
```

**Leituras e Alertas:**

| Leitura | Situação | Severidade | Alerta Enviado? |
|---------|----------|------------|-----------------|
| 45 kPa | Abaixo do inferior | 🔴 CRÍTICO | ✅ SIM |
| 52 kPa | 4% acima inferior | 🔴 CRÍTICO | ✅ SIM |
| 55 kPa | 10% acima inferior | 🟠 ALERTA | ✅ SIM |
| 200 kPa | Normal | 🔵 INFO | ❌ NÃO |
| 400 kPa | 80% do superior | 🟡 AVISO | ✅ SIM |
| 455 kPa | Acima crítico | 🔴 CRÍTICO | ✅ SIM |
| 510 kPa | Acima superior | 🔴 CRÍTICO | ✅ SIM |

---

### Exemplo 3: Sem Limites Configurados

**Configuração:**
```
Limite Inferior: (vazio)
Limite Superior: (vazio)
Nível Alerta: (vazio)
Nível Crítico: (vazio)
```

**Resultado:**
- ❌ **NENHUM alerta será gerado**, independente do valor lido
- ✅ Leituras são registradas normalmente
- ⚠️ Sistema precisa de pelo menos UM limite configurado

---

## ⚠️ IMPORTANTE

1. **Alertas são AUTOMÁTICOS**: Não precisa fazer nada além de registrar a leitura
2. **Alertas são IMEDIATOS**: Criados no mesmo momento da leitura
3. **Cada leitura é verificada**: Sistema não "lembra" leituras anteriores
4. **Prioridade de verificação**: Sistema verifica do mais crítico para o menos crítico
5. **Um alerta por leitura**: Se uma leitura ultrapassar limites, gera 1 alerta

---

## 🎯 RESUMO

| Situação | Alerta Enviado? | Severidade |
|----------|-----------------|------------|
| Valor ≥ Limite Superior | ✅ SIM | 🔴 CRÍTICO |
| Valor entre 95-100% do Superior | ✅ SIM | 🔴 CRÍTICO |
| Valor entre 90-95% do Superior | ✅ SIM | 🟠 ALERTA |
| Valor entre 80-90% do Superior | ✅ SIM | 🟡 AVISO |
| Valor ≤ Limite Inferior | ✅ SIM | 🔴 CRÍTICO |
| Valor entre 100-105% do Inferior | ✅ SIM | 🔴 CRÍTICO |
| Valor entre 105-110% do Inferior | ✅ SIM | 🟠 ALERTA |
| Valor entre 110-120% do Inferior | ✅ SIM | 🟡 AVISO |
| Valor ≥ Nível Crítico | ✅ SIM | 🔴 CRÍTICO |
| Valor ≥ Nível Alerta (sem crítico) | ✅ SIM | 🟠 ALERTA |
| Valor dentro dos limites normais | ❌ NÃO | 🔵 INFO |
| Nenhum limite configurado | ❌ NÃO | - |

