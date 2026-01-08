# Correção: Problema de Encoding com campo alturaMaciçoPrincipal

## Problema Identificado

O erro `Invalid column name 'alturaMacioPrincipal'` ocorre porque o ODBC Driver 17 for SQL Server não está lidando corretamente com o caractere especial "ç" no nome da coluna.

## Solução Implementada

### 1. Mapeamento de Campo no Código

O código TypeScript/JavaScript continua usando `alturaMaciçoPrincipal` (com ç), mas internamente mapeia para `alturaMacicoPrincipal` (sem ç) ao se comunicar com o banco de dados.

**Arquivo modificado:** `server/db.ts`

- Função `createCaracterizacaoBarragem`: Usa `alturaMacicoPrincipal` nas queries SQL
- Função `updateCaracterizacaoBarragem`: Mapeia `alturaMaciçoPrincipal` → `alturaMacicoPrincipal`
- Função `convertDecimalFields`: Mapeia `alturaMacicoPrincipal` (do banco) → `alturaMaciçoPrincipal` (no código)

### 2. Script SQL para Renomear Coluna

**Arquivo criado:** `sqlserver/corrigir-coluna-altura-macico.sql`

Este script:
- Verifica se a coluna existe com o nome antigo (`alturaMaciçoPrincipal`)
- Renomeia para `alturaMacicoPrincipal` (sem ç)
- Cria a coluna se ela não existir

## Como Aplicar a Correção

### Passo 1: Executar o Script SQL

Execute o script SQL no seu banco de dados:

```sql
-- Executar: sqlserver/corrigir-coluna-altura-macico.sql
```

Ou via PowerShell:

```powershell
# No diretório SGSB_INSP
sqlcmd -S seu_servidor -d seu_banco -i sqlserver\corrigir-coluna-altura-macico.sql
```

### Passo 2: Reiniciar o Servidor Node.js

Após executar o script SQL, reinicie o servidor Node.js do SGSB_INSP:

```powershell
# Parar o servidor atual (Ctrl+C)
# Reiniciar
npm start
```

## Verificação

Para verificar se a correção funcionou:

1. **Verificar nome da coluna no banco:**
   ```sql
   SELECT name FROM sys.columns 
   WHERE object_id = OBJECT_ID('dbo.caracterizacaoBarragem') 
   AND name LIKE '%altura%macico%';
   ```
   Deve retornar: `alturaMacicoPrincipal`

2. **Testar criação/atualização de caracterização:**
   - Acesse a página de Caracterização da Bacia
   - Preencha o campo "Altura do Maciço Principal"
   - Salve e verifique se não há erros no console

3. **Verificar logs do servidor:**
   - Não deve aparecer mais o erro `Invalid column name 'alturaMacioPrincipal'`
   - Os logs devem mostrar atualizações bem-sucedidas

## Notas Importantes

- O código TypeScript continua usando `alturaMaciçoPrincipal` (com ç) para manter compatibilidade
- O mapeamento é feito automaticamente nas funções de banco de dados
- Não é necessário alterar o código do frontend ou outros arquivos TypeScript
- Se a coluna já estiver com o nome correto (`alturaMacicoPrincipal`), o script SQL não fará alterações

## Arquivos Modificados

1. `server/db.ts`
   - `createCaracterizacaoBarragem()`: Usa `alturaMacicoPrincipal` no SQL
   - `updateCaracterizacaoBarragem()`: Mapeia campo corretamente
   - `convertDecimalFields()`: Mapeia de volta para o código

2. `sqlserver/corrigir-coluna-altura-macico.sql` (novo)
   - Script para renomear/criar a coluna no banco

## Suporte

Se ainda encontrar problemas após aplicar esta correção:

1. Verifique os logs do servidor Node.js
2. Verifique os logs do SQL Server
3. Confirme que o script SQL foi executado com sucesso
4. Verifique se a coluna foi renomeada corretamente

