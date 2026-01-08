-- Script para verificar documentos no banco de dados
-- Execute este script no SQL Server Management Studio ou sqlcmd

USE sgsb;
GO

-- Verificar se a tabela documentos existe
IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'documentos' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    PRINT 'Tabela documentos encontrada!';
    
    -- Contar total de documentos
    SELECT 
        COUNT(*) AS TotalDocumentos
    FROM dbo.documentos;
    
    -- Listar todos os documentos com informações básicas
    SELECT 
        id,
        barragemId,
        titulo,
        tipo,
        arquivoNome,
        arquivoUrl,
        arquivoTamanho,
        createdAt,
        updatedAt
    FROM dbo.documentos
    ORDER BY createdAt DESC;
    
    -- Documentos por barragem
    SELECT 
        b.nome AS Barragem,
        COUNT(d.id) AS TotalDocumentos,
        STRING_AGG(d.tipo, ', ') AS TiposDocumentos
    FROM dbo.documentos d
    INNER JOIN dbo.barragens b ON d.barragemId = b.id
    GROUP BY b.id, b.nome
    ORDER BY TotalDocumentos DESC;
    
    -- Documentos por tipo
    SELECT 
        tipo,
        COUNT(*) AS Quantidade
    FROM dbo.documentos
    GROUP BY tipo
    ORDER BY Quantidade DESC;
END
ELSE
BEGIN
    PRINT 'ERRO: Tabela documentos não encontrada!';
    PRINT 'Verifique se o script de inicialização (sqlserver/init.sql) foi executado.';
END
GO




