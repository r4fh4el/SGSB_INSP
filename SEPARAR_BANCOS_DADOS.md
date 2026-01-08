# 🔄 Separar Bancos de Dados - SGSB_INSP e SGSB-FINAL

## 📋 Problema Identificado

Ambos os sistemas estão usando o mesmo banco de dados `sgsb`, o que pode causar conflitos:
- **SGSB_INSP** (sistema de inspeções): Usa banco `sgsb`
- **SGSB-FINAL** (sistema de cálculos): Usa banco `sgsb`

## ✅ Solução: Criar Banco Separado

### Novo esquema:
- **SGSB_INSP**: Usará banco `SGSB_INSP` (novo)
- **SGSB-FINAL**: Continuará usando banco `sgsb` (mantém estrutura atual)

---

## 🚀 Passo a Passo

### 1. Executar Script SQL para Criar Novo Banco

```sql
-- Executar no SQL Server Management Studio ou via linha de comando
-- Script: SGSB/sqlserver/separar-bancos-dados.sql
```

Ou executar diretamente:

```powershell
# Via SQLCMD
sqlcmd -S 108.181.193.92,15000 -U sa -P SenhaNova@123 -i SGSB\sqlserver\separar-bancos-dados.sql
```

### 2. Copiar Estrutura de Tabelas

**Opção A: Copiar estrutura completa do banco atual**

```sql
-- No SQL Server Management Studio
-- 1. Conectar ao servidor
-- 2. Selecionar banco SGSB
-- 3. Task > Generate Scripts
-- 4. Selecionar todas as tabelas
-- 5. Escolher destino: SGSB_INSP
-- 6. Executar script gerado no banco SGSB_INSP
```

**Opção B: Executar init.sql no novo banco**

```powershell
sqlcmd -S 108.181.193.92,15000 -U sa -P SenhaNova@123 -d SGSB_INSP -i SGSB\sqlserver\init.sql
```

### 3. Migrar Dados (Opcional)

Se você já tem dados no banco `sgsb` que pertencem ao SGSB_INSP:

```sql
-- Exemplo: Migrar barragens
USE SGSB_INSP;
INSERT INTO dbo.barragens 
SELECT * FROM sgsb.dbo.barragens;

-- Exemplo: Migrar instrumentos
INSERT INTO dbo.instrumentos 
SELECT * FROM sgsb.dbo.instrumentos;

-- Exemplo: Migrar leituras
INSERT INTO dbo.leituras 
SELECT * FROM sgsb.dbo.leituras;

-- Continuar com outras tabelas conforme necessário...
```

### 4. Atualizar Configuração do SGSB_INSP

Editar arquivo `.env` na pasta `SGSB/`:

```env
# ANTES
SQLSERVER_DATABASE=sgsb

# DEPOIS
SQLSERVER_DATABASE=SGSB_INSP
```

### 5. Verificar Configuração do SGSB-FINAL

Certifique-se que o `appsettings.json` do SGSB-FINAL ainda aponta para `sgsb`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=108.181.193.92,15000;Initial Catalog=sgsb;..."
  }
}
```

---

## ⚠️ Importante

1. **Backup**: Faça backup do banco `sgsb` antes de qualquer alteração
2. **Teste**: Teste a conexão com o novo banco antes de usar em produção
3. **IDs**: Se migrar dados, certifique-se de que os IDs de barragens sejam consistentes entre os sistemas

---

## 🔍 Verificar Separação

### Verificar banco do SGSB_INSP:
```sql
USE SGSB_INSP;
SELECT name FROM sys.tables ORDER BY name;
```

### Verificar banco do SGSB-FINAL:
```sql
USE sgsb;
SELECT name FROM sys.tables ORDER BY name;
```

---

## ✅ Após Separar

Depois de separar os bancos, você pode:

1. ✅ Cadastrar dados de caracterização no SGSB_INSP
2. ✅ Cadastrar instrumentos e leituras no SGSB_INSP
3. ✅ Integrar automaticamente com SGSB-FINAL via API
4. ✅ SGSB-FINAL receberá dados e calculará automaticamente

---

## 📝 Próximos Passos

Após separar os bancos, seguir com:
1. Integração automática de instrumentos/leituras → SGSB-FINAL
2. Criação de tela no SGSB-FINAL mostrando resultados automáticos
3. Cálculos automáticos de Caracterização da Bacia e Tempo de Concentração




