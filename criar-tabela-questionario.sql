-- Script para criar as tabelas do Questionário de Inspeção Regular de Barragem de Terra
-- Execute este script no banco de dados sgsb_insp

USE sgsb_insp;
GO

-- Tabela principal de questionários
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.questionarios') AND type in (N'U'))
BEGIN
    CREATE TABLE dbo.questionarios (
        id INT IDENTITY(1,1) PRIMARY KEY,
        barragemId INT NOT NULL,
        usuarioId NVARCHAR(64) NOT NULL,
        
        -- Dados Gerais
        nomeBarragem NVARCHAR(255) NULL,
        coordenadaLatGrau NVARCHAR(10) NULL,
        coordenadaLatMinuto NVARCHAR(10) NULL,
        coordenadaLatSegundo NVARCHAR(10) NULL,
        coordenadaLonGrau NVARCHAR(10) NULL,
        coordenadaLonMinuto NVARCHAR(10) NULL,
        coordenadaLonSegundo NVARCHAR(10) NULL,
        datum NVARCHAR(50) NULL,
        municipioEstado NVARCHAR(255) NULL,
        vistoriadoPor NVARCHAR(255) NULL,
        assinatura NVARCHAR(255) NULL,
        cargo NVARCHAR(255) NULL,
        dataVistoria DATETIME2 NULL,
        vistoriaNumero NVARCHAR(50) NULL,
        cotaAtualNivelAgua NVARCHAR(50) NULL,
        bacia NVARCHAR(255) NULL,
        cursoDAguaBarrado NVARCHAR(255) NULL,
        empreendedor NVARCHAR(255) NULL,
        nivelPerigoGlobal INT NULL, -- 0, 1, 2, 3
        
        -- Seções J e K
        outrosProblemas NVARCHAR(MAX) NULL,
        sugestoesRecomendacoes NVARCHAR(MAX) NULL,
        
        createdAt DATETIME2 DEFAULT GETDATE(),
        updatedAt DATETIME2 DEFAULT GETDATE(),
        
        CONSTRAINT FK_questionarios_barragem FOREIGN KEY (barragemId) REFERENCES dbo.barragens(id) ON DELETE CASCADE,
        CONSTRAINT FK_questionarios_usuario FOREIGN KEY (usuarioId) REFERENCES dbo.users(id)
    );
    
    CREATE INDEX IX_questionarios_barragemId ON dbo.questionarios(barragemId);
    CREATE INDEX IX_questionarios_usuarioId ON dbo.questionarios(usuarioId);
    CREATE INDEX IX_questionarios_createdAt ON dbo.questionarios(createdAt);
    
    PRINT 'Tabela questionarios criada com sucesso!';
END
ELSE
BEGIN
    PRINT 'Tabela questionarios já existe.';
END
GO

-- Tabela de itens do questionário
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.questionarioItens') AND type in (N'U'))
BEGIN
    CREATE TABLE dbo.questionarioItens (
        id INT IDENTITY(1,1) PRIMARY KEY,
        questionarioId INT NOT NULL,
        
        secao NVARCHAR(10) NOT NULL, -- A, B.1, B.2, etc
        numero INT NOT NULL,
        descricao NVARCHAR(MAX) NOT NULL,
        
        situacao NVARCHAR(10) NULL, -- NA, NE, PV, DS, DI, PC, AU, NI
        magnitude NVARCHAR(10) NULL, -- I, P, M, G
        nivelPerigo INT NULL, -- 0, 1, 2, 3
        
        comentario NVARCHAR(MAX) NULL,
        
        createdAt DATETIME2 DEFAULT GETDATE(),
        
        CONSTRAINT FK_questionarioItens_questionario FOREIGN KEY (questionarioId) REFERENCES dbo.questionarios(id) ON DELETE CASCADE
    );
    
    CREATE INDEX IX_questionarioItens_questionarioId ON dbo.questionarioItens(questionarioId);
    CREATE INDEX IX_questionarioItens_secao ON dbo.questionarioItens(secao);
    
    PRINT 'Tabela questionarioItens criada com sucesso!';
END
ELSE
BEGIN
    PRINT 'Tabela questionarioItens já existe.';
END
GO

-- Tabela de comentários por seção
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.questionarioComentariosSecoes') AND type in (N'U'))
BEGIN
    CREATE TABLE dbo.questionarioComentariosSecoes (
        id INT IDENTITY(1,1) PRIMARY KEY,
        questionarioId INT NOT NULL,
        codigoSecao NVARCHAR(10) NOT NULL, -- A, B.1, etc
        comentario NVARCHAR(MAX) NULL,
        createdAt DATETIME2 DEFAULT GETDATE(),
        
        CONSTRAINT FK_questionarioComentariosSecoes_questionario FOREIGN KEY (questionarioId) REFERENCES dbo.questionarios(id) ON DELETE CASCADE
    );
    
    CREATE INDEX IX_questionarioComentariosSecoes_questionarioId ON dbo.questionarioComentariosSecoes(questionarioId);
    
    PRINT 'Tabela questionarioComentariosSecoes criada com sucesso!';
END
ELSE
BEGIN
    PRINT 'Tabela questionarioComentariosSecoes já existe.';
END
GO

PRINT 'Script de criação de tabelas do questionário concluído!';
GO

