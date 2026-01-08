-- Script para adicionar coluna BLOB para armazenar arquivos diretamente no banco
-- Execute este script no SQL Server

USE sgsb;
GO

-- Adicionar coluna VARBINARY(MAX) para armazenar o conteúdo do arquivo
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE name = 'arquivoConteudo' AND object_id = OBJECT_ID('dbo.documentos'))
BEGIN
    ALTER TABLE dbo.documentos
    ADD arquivoConteudo VARBINARY(MAX) NULL;
    
    PRINT 'Coluna arquivoConteudo adicionada com sucesso!';
END
ELSE
BEGIN
    PRINT 'Coluna arquivoConteudo já existe.';
END
GO

-- Tornar arquivoUrl opcional (já que agora podemos armazenar no banco)
IF EXISTS (SELECT 1 FROM sys.columns WHERE name = 'arquivoUrl' AND object_id = OBJECT_ID('dbo.documentos') AND is_nullable = 0)
BEGIN
    ALTER TABLE dbo.documentos
    ALTER COLUMN arquivoUrl NVARCHAR(500) NULL;
    
    PRINT 'Coluna arquivoUrl alterada para permitir NULL.';
END
GO

-- Criar índice para melhorar performance em consultas
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_documentos_barragemId_tipo' AND object_id = OBJECT_ID('dbo.documentos'))
BEGIN
    CREATE INDEX IX_documentos_barragemId_tipo ON dbo.documentos(barragemId, tipo);
    PRINT 'Índice criado com sucesso!';
END
GO

PRINT 'Script executado com sucesso!';
GO




