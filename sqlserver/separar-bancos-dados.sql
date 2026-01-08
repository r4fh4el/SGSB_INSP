-- ============================================================================
-- SCRIPT PARA SEPARAR BANCOS DE DADOS
-- ============================================================================
-- Este script cria um novo banco SGSB_INSP para o sistema de inspeções
-- e mantém o banco SGSB para o SGSB-FINAL
-- ============================================================================

-- Criar novo banco para SGSB_INSP
IF NOT EXISTS (SELECT 1 FROM sys.databases WHERE name = 'SGSB_INSP')
BEGIN
    CREATE DATABASE [SGSB_INSP]
    COLLATE SQL_Latin1_General_CP1_CI_AS;
    
    PRINT 'Banco SGSB_INSP criado com sucesso!';
END
ELSE
BEGIN
    PRINT 'Banco SGSB_INSP já existe.';
END
GO

-- Usar o novo banco
USE [SGSB_INSP]
GO

-- Criar todas as tabelas do SGSB_INSP no novo banco
-- (Copiar estrutura do banco SGSB atual)

PRINT 'Iniciando criação de tabelas no banco SGSB_INSP...';
GO

-- ============================================================================
-- TABELA: users
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'users' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
  CREATE TABLE dbo.users (
    id NVARCHAR(64) NOT NULL PRIMARY KEY,
    name NVARCHAR(255) NULL,
    email NVARCHAR(320) NULL,
    loginMethod NVARCHAR(64) NULL,
    role NVARCHAR(32) NOT NULL CONSTRAINT DF_users_role DEFAULT 'visualizador',
    ativo BIT NOT NULL CONSTRAINT DF_users_ativo DEFAULT 1,
    createdAt DATETIME2 NOT NULL CONSTRAINT DF_users_createdAt DEFAULT SYSDATETIME(),
    lastSignedIn DATETIME2 NOT NULL CONSTRAINT DF_users_lastSignedIn DEFAULT SYSDATETIME()
  );
  PRINT 'Tabela users criada.';
END
GO

-- ============================================================================
-- TABELA: barragens
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'barragens' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
  CREATE TABLE dbo.barragens (
    id INT IDENTITY(1,1) PRIMARY KEY,
    codigo NVARCHAR(50) NOT NULL UNIQUE,
    nome NVARCHAR(255) NOT NULL,
    rio NVARCHAR(255) NULL,
    bacia NVARCHAR(255) NULL,
    municipio NVARCHAR(255) NULL,
    estado NVARCHAR(2) NULL,
    latitude NVARCHAR(50) NULL,
    longitude NVARCHAR(50) NULL,
    tipo NVARCHAR(100) NULL,
    finalidade NVARCHAR(255) NULL,
    altura NVARCHAR(50) NULL,
    comprimento NVARCHAR(50) NULL,
    volumeReservatorio NVARCHAR(50) NULL,
    areaReservatorio NVARCHAR(50) NULL,
    nivelMaximoNormal NVARCHAR(50) NULL,
    nivelMaximoMaximorum NVARCHAR(50) NULL,
    nivelMinimo NVARCHAR(50) NULL,
    proprietario NVARCHAR(255) NULL,
    operador NVARCHAR(255) NULL,
    anoInicioConstrucao INT NULL,
    anoInicioOperacao INT NULL,
    categoriaRisco NVARCHAR(8) NULL,
    danoPotencialAssociado NVARCHAR(16) NULL,
    status NVARCHAR(32) NOT NULL CONSTRAINT DF_barragens_status DEFAULT 'ativa',
    observacoes NVARCHAR(MAX) NULL,
    createdAt DATETIME2 NOT NULL CONSTRAINT DF_barragens_createdAt DEFAULT SYSDATETIME(),
    updatedAt DATETIME2 NOT NULL CONSTRAINT DF_barragens_updatedAt DEFAULT SYSDATETIME()
  );

  CREATE INDEX IX_barragens_nome ON dbo.barragens(nome);
  PRINT 'Tabela barragens criada.';
END
GO

-- Continuar com todas as outras tabelas...
-- (Aqui você pode copiar todas as tabelas do init.sql ou executar o init.sql direto no novo banco)

PRINT '========================================';
PRINT 'IMPORTANTE:';
PRINT '1. Execute o arquivo init.sql no banco SGSB_INSP para criar todas as tabelas';
PRINT '2. Ou copie manualmente a estrutura do banco SGSB atual para SGSB_INSP';
PRINT '3. Atualize o arquivo .env do SGSB para usar SQLSERVER_DATABASE=SGSB_INSP';
PRINT '========================================';
GO




