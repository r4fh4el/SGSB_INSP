-- ============================================================================
-- VERIFICAR SE A TABELA ALERTAS EXISTE E ESTÁ CORRETAMENTE CONFIGURADA
-- ============================================================================

-- 1. Verificar se a tabela existe
IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'alertas' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    PRINT '✅ Tabela alertas existe';
END
ELSE
BEGIN
    PRINT '❌ Tabela alertas NÃO existe - Criando...';
    
    CREATE TABLE dbo.alertas (
        id INT IDENTITY(1,1) PRIMARY KEY,
        barragemId INT NOT NULL,
        tipo NVARCHAR(100) NOT NULL,
        severidade NVARCHAR(16) NOT NULL,
        titulo NVARCHAR(255) NOT NULL,
        mensagem NVARCHAR(MAX) NOT NULL,
        instrumentoId INT NULL,
        leituraId INT NULL,
        ocorrenciaId INT NULL,
        destinatarios NVARCHAR(MAX) NULL,
        lido BIT NOT NULL CONSTRAINT DF_alertas_lido DEFAULT 0,
        dataLeitura DATETIME2 NULL,
        acaoTomada NVARCHAR(MAX) NULL,
        dataAcao DATETIME2 NULL,
        createdAt DATETIME2 NOT NULL CONSTRAINT DF_alertas_createdAt DEFAULT SYSDATETIME(),
        CONSTRAINT FK_alertas_barragens FOREIGN KEY (barragemId) REFERENCES dbo.barragens(id) ON DELETE CASCADE,
        CONSTRAINT FK_alertas_instrumentos FOREIGN KEY (instrumentoId) REFERENCES dbo.instrumentos(id) ON DELETE NO ACTION,
        CONSTRAINT FK_alertas_leituras FOREIGN KEY (leituraId) REFERENCES dbo.leituras(id) ON DELETE NO ACTION,
        CONSTRAINT FK_alertas_ocorrencias FOREIGN KEY (ocorrenciaId) REFERENCES dbo.ocorrencias(id) ON DELETE NO ACTION
    );

    CREATE INDEX IX_alertas_barragemId ON dbo.alertas(barragemId, lido, createdAt DESC);
    
    PRINT '✅ Tabela alertas criada com sucesso!';
END
GO

-- 2. Verificar estrutura da tabela
PRINT '';
PRINT '=== ESTRUTURA DA TABELA ALERTAS ===';
SELECT 
    COLUMN_NAME as 'Coluna',
    DATA_TYPE as 'Tipo',
    IS_NULLABLE as 'Pode Null',
    COLUMN_DEFAULT as 'Valor Padrão'
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'alertas'
ORDER BY ORDINAL_POSITION;
GO

-- 3. Verificar Foreign Keys
PRINT '';
PRINT '=== FOREIGN KEYS (RELACIONAMENTOS) ===';
SELECT 
    fk.name AS 'FK_Name',
    OBJECT_NAME(fk.parent_object_id) AS 'Tabela',
    COL_NAME(fc.parent_object_id, fc.parent_column_id) AS 'Coluna',
    OBJECT_NAME(fk.referenced_object_id) AS 'Tabela Referenciada',
    COL_NAME(fc.referenced_object_id, fc.referenced_column_id) AS 'Coluna Referenciada'
FROM sys.foreign_keys AS fk
INNER JOIN sys.foreign_key_columns AS fc ON fk.object_id = fc.constraint_object_id
WHERE OBJECT_NAME(fk.parent_object_id) = 'alertas';
GO

-- 4. Verificar índices
PRINT '';
PRINT '=== ÍNDICES ===';
SELECT 
    i.name AS 'Nome',
    i.type_desc AS 'Tipo',
    STRING_AGG(c.name, ', ') AS 'Colunas'
FROM sys.indexes i
INNER JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
INNER JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
WHERE i.object_id = OBJECT_ID('dbo.alertas')
GROUP BY i.name, i.type_desc;
GO

-- 5. Contar alertas existentes
PRINT '';
PRINT '=== ALERTAS EXISTENTES ===';
SELECT 
    COUNT(*) as 'Total de Alertas',
    SUM(CASE WHEN lido = 0 THEN 1 ELSE 0 END) as 'Não Lidos',
    SUM(CASE WHEN lido = 1 THEN 1 ELSE 0 END) as 'Lidos'
FROM dbo.alertas;
GO

-- 6. Últimos 5 alertas criados
PRINT '';
PRINT '=== ÚLTIMOS 5 ALERTAS ===';
SELECT TOP 5
    id,
    tipo,
    severidade,
    titulo,
    instrumentoId,
    leituraId,
    barragemId,
    lido,
    createdAt
FROM dbo.alertas
ORDER BY createdAt DESC;
GO

PRINT '';
PRINT '✅ Verificação concluída!';

