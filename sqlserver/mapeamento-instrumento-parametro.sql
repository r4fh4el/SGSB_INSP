-- ============================================================================
-- TABELA: mapeamentoInstrumentoParametro
-- Descrição: Mapeia instrumentos para parâmetros de cálculo no SGSB-FINAL
--            Permite que leituras de instrumentos atualizem automaticamente
--            os dados de caracterização e disparem cálculos
-- ============================================================================

USE [sgsb_insp];
GO

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'mapeamentoInstrumentoParametro' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
  CREATE TABLE dbo.mapeamentoInstrumentoParametro (
    id INT IDENTITY(1,1) PRIMARY KEY,
    instrumentoCodigo NVARCHAR(50) NOT NULL,
    barragemId INT NOT NULL,
    parametroCalculo NVARCHAR(100) NOT NULL,
    -- Parâmetros possíveis: 
    -- Para IndiceCaracterizacaoBH: AreaBaciaHidrografica, Perimetro, ComprimentoRioPrincipal, 
    --   AltitudeMinimaBacia, AltitudeMaximaBacia, etc.
    -- Para TempoConcentracao: declividadeBacia_S, areaDrenagem_A, comprimentoRioPrincipal_L
    -- Para VazaoPico: larguraBarragem, alturaMaciçoPrincipal, volumeReservatorio, etc.
    tipoCalculo NVARCHAR(50) NOT NULL,
    -- Tipos: 'IndiceCaracterizacaoBH', 'TempoConcentracao', 'VazaoPico'
    fatorConversao DECIMAL(10,4) DEFAULT 1.0,
    -- Fator para converter valor do instrumento para unidade esperada
    unidadeEsperada NVARCHAR(20) NULL,
    -- Unidade esperada: 'm', 'Km', 'Km²', 'm³', 'm²', etc.
    campoCaracterizacao NVARCHAR(100) NOT NULL,
    -- Campo na tabela caracterizacaoBarragem correspondente
    -- Ex: 'areaBaciaHidrografica', 'altitudeMaximaBacia', 'alturaMaciçoPrincipal'
    ativo BIT DEFAULT 1,
    observacoes NVARCHAR(MAX) NULL,
    createdAt DATETIME2 DEFAULT SYSDATETIME(),
    updatedAt DATETIME2 DEFAULT SYSDATETIME(),
    
    CONSTRAINT FK_mapeamentoInstrumentoParametro_barragens 
      FOREIGN KEY (barragemId) REFERENCES dbo.barragens(id) ON DELETE CASCADE
  );

  CREATE INDEX IX_mapeamentoInstrumentoParametro_instrumentoCodigo 
    ON dbo.mapeamentoInstrumentoParametro(instrumentoCodigo);
  CREATE INDEX IX_mapeamentoInstrumentoParametro_barragemId 
    ON dbo.mapeamentoInstrumentoParametro(barragemId);
  CREATE INDEX IX_mapeamentoInstrumentoParametro_ativo 
    ON dbo.mapeamentoInstrumentoParametro(ativo, barragemId);
  
  PRINT '✓ Tabela mapeamentoInstrumentoParametro criada.';
END
ELSE
BEGIN
  PRINT '⚠ Tabela mapeamentoInstrumentoParametro já existe.';
END
GO

-- ============================================================================
-- DADOS DE EXEMPLO - Mapeamentos para teste
-- ============================================================================
-- Exemplo: Mapear instrumentos para parâmetros de cálculo

-- Mapeamento 1: Instrumento de altitude máxima -> AltitudeMaximaBacia
IF NOT EXISTS (SELECT 1 FROM dbo.mapeamentoInstrumentoParametro WHERE instrumentoCodigo = 'ALT_MAX_001' AND parametroCalculo = 'AltitudeMaximaBacia')
BEGIN
  INSERT INTO dbo.mapeamentoInstrumentoParametro 
    (instrumentoCodigo, barragemId, parametroCalculo, tipoCalculo, fatorConversao, unidadeEsperada, campoCaracterizacao, ativo, observacoes)
  VALUES
    ('ALT_MAX_001', 1, 'AltitudeMaximaBacia', 'IndiceCaracterizacaoBH', 1.0, 'm', 'altitudeMaximaBacia', 1, 'Instrumento de altitude máxima para caracterização da bacia');
  PRINT '✓ Mapeamento ALT_MAX_001 criado.';
END
GO

-- Mapeamento 2: Instrumento de altura da barragem -> alturaMaciçoPrincipal
IF NOT EXISTS (SELECT 1 FROM dbo.mapeamentoInstrumentoParametro WHERE instrumentoCodigo = 'ALT_BARR_001' AND parametroCalculo = 'alturaMaciçoPrincipal')
BEGIN
  INSERT INTO dbo.mapeamentoInstrumentoParametro 
    (instrumentoCodigo, barragemId, parametroCalculo, tipoCalculo, fatorConversao, unidadeEsperada, campoCaracterizacao, ativo, observacoes)
  VALUES
    ('ALT_BARR_001', 1, 'alturaMaciçoPrincipal', 'VazaoPico', 1.0, 'm', 'alturaMaciçoPrincipal', 1, 'Instrumento medindo altura do maciço principal');
  PRINT '✓ Mapeamento ALT_BARR_001 criado.';
END
GO

PRINT '';
PRINT '========================================';
PRINT 'Tabela de mapeamento criada e configurada!';
PRINT '========================================';
GO




