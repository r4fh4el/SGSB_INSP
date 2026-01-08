# 🔗 Relacionamento entre Alertas, Leituras e Instrumentos

## ✅ ESTRUTURA DO BANCO DE DADOS

### Tabela: `alertas`

A tabela `alertas` está **corretamente criada** e **relacionada** com as outras tabelas:

```
alertas
├── id (PK) - Identificador único do alerta
├── barragemId (FK → barragens) - Barragem relacionada
├── instrumentoId (FK → instrumentos) - Instrumento que gerou o alerta
├── leituraId (FK → leituras) - Leitura que gerou o alerta
├── tipo - Tipo do alerta (ex: "Leitura fora dos limites")
├── severidade - Severidade (info, aviso, alerta, critico)
├── titulo - Título do alerta
├── mensagem - Mensagem detalhada
├── lido - Se foi lido ou não
└── createdAt - Data de criação
```

---

## 🔗 RELACIONAMENTOS

### 1. **alertas → instrumentos**
```
alertas.instrumentoId → instrumentos.id
```
- **Relação**: Um alerta está relacionado a UM instrumento
- **Quando**: O alerta foi gerado por uma leitura desse instrumento
- **Foreign Key**: `FK_alertas_instrumentos`
- **ON DELETE**: `NO ACTION` (não deleta alerta se instrumento for deletado)

### 2. **alertas → leituras**
```
alertas.leituraId → leituras.id
```
- **Relação**: Um alerta está relacionado a UMA leitura específica
- **Quando**: A leitura que ultrapassou os limites e gerou o alerta
- **Foreign Key**: `FK_alertas_leituras`
- **ON DELETE**: `NO ACTION` (não deleta alerta se leitura for deletada)

### 3. **alertas → barragens**
```
alertas.barragemId → barragens.id
```
- **Relação**: Um alerta está relacionado a UMA barragem
- **Quando**: A barragem onde o instrumento está instalado
- **Foreign Key**: `FK_alertas_barragens`
- **ON DELETE**: `CASCADE` (deleta alertas se barragem for deletada)

---

## 🔄 FLUXO DE CRIAÇÃO DO ALERTA

### Quando uma leitura é registrada:

```
1. Usuário registra leitura
   ↓
2. createLeitura() é chamado
   ↓
3. Sistema busca instrumento: getInstrumentoById(leitura.instrumentoId)
   ↓
4. Sistema calcula severidade: calcularSeveridadeAlerta(valor, instrumento)
   ↓
5. Se deveAlertar = true:
   a) Marca leitura como inconsistente
   b) Cria alerta no banco: createAlerta()
      - barragemId = instrumento.barragemId
      - instrumentoId = leitura.instrumentoId
      - leituraId = leitura.id (já inserida)
      - tipo = baseado no tipo do instrumento
      - severidade = calculada pela função
      - titulo = "[SEVERIDADE] Código - Tipo de inconsistência"
      - mensagem = detalhada com limites e recomendações
   ↓
6. Alerta aparece na página de Alertas
```

---

## 📊 EXEMPLO DE DADOS

### Instrumento:
```sql
id: 1
codigo: "SEN-001"
tipo: "Medidor de Nível"
barragemId: 1
limiteSuperior: "30.0"
nivelCritico: "28.0"
```

### Leitura:
```sql
id: 100
instrumentoId: 1
valor: "32.0"
inconsistencia: true
tipoInconsistencia: "Ultrapassou o limite superior crítico"
```

### Alerta Criado:
```sql
id: 50
barragemId: 1           ← da barragem do instrumento
instrumentoId: 1        ← do instrumento da leitura
leituraId: 100          ← da leitura que gerou o alerta
tipo: "Nível d'água fora dos limites"
severidade: "critico"
titulo: "[CRITICO] SEN-001 - Ultrapassou o limite superior crítico"
mensagem: "O instrumento SEN-001 - Medidor de Nível apresentou leitura fora dos limites estabelecidos..."
lido: false
createdAt: 2026-01-07 22:30:00
```

---

## ✅ VERIFICAÇÃO NO BANCO DE DADOS

### Script SQL para verificar:

Execute o arquivo `sqlserver/verificar_alertas.sql` para:
1. ✅ Verificar se a tabela existe
2. ✅ Verificar estrutura da tabela
3. ✅ Verificar Foreign Keys (relacionamentos)
4. ✅ Verificar índices
5. ✅ Contar alertas existentes
6. ✅ Ver últimos alertas criados

---

## 🐛 POSSÍVEIS PROBLEMAS

### Problema 1: Tabela não existe no banco
**Solução:**
- Execute o script `sqlserver/init.sql` no banco de dados
- Ou execute o script `sqlserver/verificar_alertas.sql` (ele cria se não existir)

### Problema 2: Foreign Keys faltando
**Solução:**
- Execute o script de criação da tabela novamente
- As Foreign Keys serão criadas automaticamente

### Problema 3: Alerta não está sendo criado
**Verificar:**
1. Logs do servidor - procure por `[ALERTA DEBUG]`
2. Se `createAlerta` está sendo chamado
3. Se há erros na inserção

---

## 🔍 CONSULTAS ÚTEIS

### Ver alertas de uma barragem:
```sql
SELECT * FROM dbo.alertas 
WHERE barragemId = 1 
ORDER BY createdAt DESC;
```

### Ver alertas relacionados a uma leitura:
```sql
SELECT a.*, i.codigo as instrumento_codigo
FROM dbo.alertas a
INNER JOIN dbo.instrumentos i ON a.instrumentoId = i.id
WHERE a.leituraId = 100;
```

### Ver alertas não lidos de uma barragem:
```sql
SELECT * FROM dbo.alertas 
WHERE barragemId = 1 AND lido = 0 
ORDER BY createdAt DESC;
```

### Ver alertas por severidade:
```sql
SELECT severidade, COUNT(*) as quantidade
FROM dbo.alertas
WHERE barragemId = 1
GROUP BY severidade;
```

---

## 📝 RESUMO

✅ **Tabela existe** no banco de dados  
✅ **Relacionada corretamente** com instrumentos, leituras e barragens  
✅ **Foreign Keys** configuradas corretamente  
✅ **Função createAlerta** está criando os alertas com os relacionamentos corretos  

**Se os alertas não aparecem, verifique:**
1. Se a tabela existe no banco (execute `verificar_alertas.sql`)
2. Se a leitura ultrapassou os limites configurados
3. Se o instrumento tem limites configurados
4. Se há erros nos logs do servidor

