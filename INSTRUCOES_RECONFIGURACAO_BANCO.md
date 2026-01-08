# 🔄 Instruções para Reconfiguração do Banco SGSB_INSP

## 📋 Visão Geral

Este guia explica como recriar o banco de dados `sgsb_insp` separado do banco `sgsb` usado pelo SGSB-FINAL, e configurar dados de teste.

---

## ✅ O que será feito

1. ✅ Criar banco de dados `sgsb_insp` 
2. ✅ Criar todas as tabelas necessárias
3. ✅ Inserir dados de teste (3-4 registros de cada tabela)
4. ✅ Reconfigurar o sistema SGSB para usar o novo banco

---

## 🚀 Método 1: Script Automático (Recomendado)

### Passo 1: Executar Script PowerShell

Abra o PowerShell na pasta `SGSB` e execute:

```powershell
.\reconfigurar-banco-sgsb-insp.ps1
```

**Ou com parâmetros customizados:**

```powershell
.\reconfigurar-banco-sgsb-insp.ps1 -SqlServer "108.181.193.92,15000" -SqlUser "sa" -SqlPassword "SenhaNova@123"
```

O script irá:
- ✅ Criar o banco `sgsb_insp`
- ✅ Criar todas as tabelas
- ✅ Inserir dados de teste
- ✅ Atualizar arquivo `.env` automaticamente

---

## 🔧 Método 2: Manual (Passo a Passo)

### Passo 1: Criar Banco e Tabelas

Execute o script SQL no SQL Server Management Studio ou via sqlcmd:

```powershell
sqlcmd -S 108.181.193.92,15000 -U sa -P SenhaNova@123 -i sqlserver\criar-banco-sgsb-insp.sql
```

### Passo 2: Inserir Dados de Teste

```powershell
sqlcmd -S 108.181.193.92,15000 -U sa -P SenhaNova@123 -i sqlserver\seed-dados-teste.sql
```

### Passo 3: Atualizar Configuração

Edite o arquivo `.env` na pasta `SGSB/` e configure:

```env
SQLSERVER_SERVER=108.181.193.92,15000
SQLSERVER_DATABASE=sgsb_insp
SQLSERVER_USER=sa
SQLSERVER_PASSWORD=SenhaNova@123
SQLSERVER_TRUSTED_CONNECTION=false
SQLSERVER_ODBC_DRIVER=ODBC Driver 17 for SQL Server
```

---

## 📊 Dados de Teste Inseridos

O script de seed insere os seguintes dados:

| Tabela | Quantidade | Descrição |
|--------|------------|-----------|
| **users** | 4 | Usuários de teste (administrador, inspetor, visualizador, gestor) |
| **barragens** | 4 | Barragens de exemplo em diferentes cidades de MG |
| **estruturas** | 4 | Estruturas associadas às barragens |
| **instrumentos** | 4 | Instrumentos de monitoramento (piezômetro, medidor de nível, etc.) |
| **leituras** | 4 | Leituras dos instrumentos |
| **checklists** | 4 | Checklists de inspeção |
| **perguntasChecklist** | 4 | Perguntas para os checklists |
| **respostasChecklist** | 4 | Respostas dos checklists |
| **caracterizacaoBarragem** | 3 | Dados de caracterização para cálculos |
| **ocorrencias** | 4 | Ocorrências registradas |
| **hidrometria** | 4 | Medições hidrométricas |
| **documentos** | 4 | Documentos associados |
| **manutencoes** | 4 | Manutenções planejadas/em execução |
| **alertas** | 3 | Alertas do sistema |
| **relatorios** | 3 | Relatórios gerados |
| **auditoria** | 4 | Registros de auditoria |

---

## ✅ Verificação

### 1. Verificar Banco Criado

```sql
USE master;
SELECT name FROM sys.databases WHERE name = 'sgsb_insp';
```

### 2. Verificar Tabelas

```sql
USE sgsb_insp;
SELECT name FROM sys.tables ORDER BY name;
```

### 3. Verificar Dados

```sql
USE sgsb_insp;
SELECT COUNT(*) as total_barragens FROM barragens;
SELECT COUNT(*) as total_instrumentos FROM instrumentos;
SELECT COUNT(*) as total_leituras FROM leituras;
SELECT COUNT(*) as total_checklists FROM checklists;
```

### 4. Testar Conexão do Sistema

```powershell
cd SGSB
pnpm dev
```

Acesse `http://localhost:3000` e verifique se os dados aparecem corretamente.

---

## 🔍 Detalhes dos Dados de Teste

### Barragens

1. **BARR-001** - Barragem do Rio Verde (Patos de Minas)
2. **BARR-002** - Barragem São Francisco (Três Marias) 
3. **BARR-003** - Barragem do Peixe (Araxá)
4. **BARR-004** - Barragem Nova Esperança (Brumadinho)

### Instrumentos

1. **PIEZ-001** - Piezômetro (Barragem 1)
2. **NIVEL-002** - Medidor de Nível (Barragem 2)
3. **INCLI-003** - Inclinômetro (Barragem 3)
4. **VAZAO-004** - Medidor de Vazão (Barragem 4)

### Usuários

1. **user-001** - João Silva (Administrador)
2. **user-002** - Maria Santos (Inspetor)
3. **user-003** - Pedro Oliveira (Visualizador)
4. **user-004** - Ana Costa (Gestor)

---

## ⚠️ Importante

1. **Backup**: Se você já tem dados no banco antigo, faça backup antes!
2. **Separação**: O banco `sgsb_insp` agora está separado do banco `sgsb` usado pelo SGSB-FINAL
3. **Teste**: Sempre teste a conexão após reconfigurar

---

## 🐛 Solução de Problemas

### Erro: "Banco já existe"

Se o banco já existir, o script tentará criar apenas as tabelas que não existem. Para recriar tudo do zero:

```sql
USE master;
DROP DATABASE IF EXISTS sgsb_insp;
GO
```

Depois execute novamente o script de criação.

### Erro: "Dados já existem"

Os dados de teste só são inseridos se as tabelas estiverem vazias. Para limpar e reinserir:

```sql
USE sgsb_insp;
-- Cuidado! Isso apaga TODOS os dados
TRUNCATE TABLE leituras;
TRUNCATE TABLE respostasChecklist;
-- ... (truncar outras tabelas na ordem correta)
```

### Erro de Conexão

Verifique:
- Servidor SQL Server está acessível
- Credenciais estão corretas no `.env`
- Firewall permite conexão na porta 15000
- ODBC Driver 17 está instalado

---

## 📝 Próximos Passos

Após reconfigurar o banco:

1. ✅ Testar o sistema SGSB_INSP
2. ✅ Verificar se os dados aparecem corretamente
3. ✅ Prosseguir com a integração automática com SGSB-FINAL

---

## 📞 Suporte

Se encontrar problemas, verifique:
- Logs do sistema em `SGSB/`
- Mensagens do SQL Server
- Arquivo `.env` está configurado corretamente




