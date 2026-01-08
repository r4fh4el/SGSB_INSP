# Como Criar a Tabela caracterizacaoBarragem

## ❌ Erro Atual

```
Invalid object name 'dbo.caracterizacaoBarragem'
```

Isso significa que a tabela não existe no banco de dados SQL Server.

## ✅ Solução

Execute o script SQL para criar a tabela. Você tem 3 opções:

### Opção 1: Via SQL Server Management Studio (SSMS) - RECOMENDADO

1. Abra o **SQL Server Management Studio (SSMS)**
2. Conecte ao seu servidor SQL Server
3. Selecione o banco de dados (geralmente `sgsb`)
4. Abra o arquivo: `SGSB\sqlserver\caracterizacao_barragem.sql`
5. Execute o script (F5 ou botão "Execute")

### Opção 2: Via Azure Data Studio

1. Abra o **Azure Data Studio**
2. Conecte ao seu servidor SQL Server
3. Selecione o banco de dados
4. Abra uma nova query
5. Copie e cole o conteúdo do arquivo `SGSB\sqlserver\caracterizacao_barragem.sql`
6. Execute o script

### Opção 3: Via PowerShell (se sqlcmd estiver instalado)

```powershell
cd SGSB
.\executar-script-sql.ps1
```

## 📋 Conteúdo do Script

O script cria a tabela `caracterizacaoBarragem` com:

- **Campos para Índice de Caracterização de Bacia Hidrográfica** (10 campos)
- **Campos para Tempo de Concentração** (3 campos)
- **Campos para Vazão de Pico** (6 campos)
- **Metadados** (método, equipamento, responsável, observações)
- **Status de validação e sincronização**

## ✅ Após Executar

Após executar o script com sucesso:

1. Recarregue a página do sistema
2. Tente acessar a caracterização novamente
3. O erro deve desaparecer

## 🔍 Verificar se a Tabela Foi Criada

Execute no SSMS:

```sql
SELECT * FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_NAME = 'caracterizacaoBarragem'
```

Se retornar uma linha, a tabela foi criada com sucesso!




