-- ============================================================================
-- CORREÇÃO: Renomear coluna alturaMaciçoPrincipal para alturaMacicoPrincipal
-- Problema: Caractere especial "ç" causa problemas de encoding com ODBC Driver 17
-- Solução: Renomear para alturaMacicoPrincipal (sem ç)
-- ============================================================================

-- Verificar se a tabela existe
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'caracterizacaoBarragem' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    PRINT 'ERRO: Tabela caracterizacaoBarragem não encontrada!';
    RETURN;
END

-- Verificar qual é o nome atual da coluna
DECLARE @colName NVARCHAR(128);
SELECT @colName = name 
FROM sys.columns 
WHERE object_id = OBJECT_ID('dbo.caracterizacaoBarragem') 
AND (name = 'alturaMaciçoPrincipal' OR name = 'alturaMacicoPrincipal' OR name LIKE 'alturaMaci%Principal');

IF @colName IS NULL
BEGIN
    PRINT 'AVISO: Coluna de altura do maciço não encontrada. Pode ser necessário criar a coluna.';
    -- Criar a coluna se não existir
    IF NOT EXISTS (
        SELECT 1 FROM sys.columns 
        WHERE object_id = OBJECT_ID('dbo.caracterizacaoBarragem') 
        AND name = 'alturaMacicoPrincipal'
    )
    BEGIN
        ALTER TABLE dbo.caracterizacaoBarragem
        ADD alturaMacicoPrincipal DECIMAL(15,4) NULL;
        PRINT 'Coluna alturaMacicoPrincipal criada com sucesso!';
    END
END
ELSE IF @colName = 'alturaMacicoPrincipal'
BEGIN
    PRINT 'Coluna já está com o nome correto: alturaMacicoPrincipal';
END
ELSE
BEGIN
    -- Renomear a coluna para versão sem caractere especial
    DECLARE @sql NVARCHAR(MAX);
    SET @sql = 'EXEC sp_rename ''dbo.caracterizacaoBarragem.' + @colName + ''', ''alturaMacicoPrincipal'', ''COLUMN'';';
    EXEC sp_executesql @sql;
    PRINT 'Coluna ' + @colName + ' renomeada para alturaMacicoPrincipal com sucesso!';
END
GO

