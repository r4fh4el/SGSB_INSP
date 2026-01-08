-- ============================================================================
-- TABELA: caracterizacaoBarragem
-- Descrição: Armazena dados de caracterização da barragem coletados durante
--            inspeções para uso nos cálculos hidrológicos do SGSB-HIDRO
-- ============================================================================

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'caracterizacaoBarragem' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
  CREATE TABLE dbo.caracterizacaoBarragem (
    id INT IDENTITY(1,1) PRIMARY KEY,
    checklistId INT NOT NULL,
    barragemId INT NOT NULL,
    
    -- Índice de Caracterização de Bacia Hidrográfica
    areaBaciaHidrografica DECIMAL(15,4) NULL,
    perimetro DECIMAL(15,4) NULL,
    comprimentoRioPrincipal DECIMAL(15,4) NULL,
    comprimentoVetorialRioPrincipal DECIMAL(15,4) NULL,
    comprimentoTotalRioBacia DECIMAL(15,4) NULL,
    altitudeMinimaBacia DECIMAL(15,4) NULL,
    altitudeMaximaBacia DECIMAL(15,4) NULL,
    altitudeAltimetricaBaciaM DECIMAL(15,4) NULL,
    altitudeAltimetricaBaciaKM DECIMAL(15,4) NULL,
    comprimentoAxialBacia DECIMAL(15,4) NULL,
    
    -- Tempo de Concentração
    comprimentoRioPrincipal_L DECIMAL(15,4) NULL,
    declividadeBacia_S DECIMAL(15,4) NULL,
    areaDrenagem_A DECIMAL(15,4) NULL,
    
    -- Vazão de Pico
    larguraBarragem DECIMAL(15,4) NULL,
    alturaMaciçoPrincipal DECIMAL(15,4) NULL,
    volumeReservatorio DECIMAL(15,4) NULL,
    cargaHidraulicaMaxima DECIMAL(15,4) NULL,
    profundidadeMediaReservatorio DECIMAL(15,4) NULL,
    areaReservatorio DECIMAL(15,4) NULL,
    
    -- Metadados
    metodoMedicao NVARCHAR(100) NULL,
    equipamentoUtilizado NVARCHAR(255) NULL,
    responsavelMedicao NVARCHAR(255) NULL,
    observacoes NVARCHAR(MAX) NULL,
    
    -- Status
    validado BIT NOT NULL CONSTRAINT DF_caracterizacaoBarragem_validado DEFAULT 0,
    validadoPor NVARCHAR(64) NULL,
    dataValidacao DATETIME2 NULL,
    
    -- Sincronização com SGSB-HIDRO
    sincronizadoComHidro BIT NOT NULL CONSTRAINT DF_caracterizacaoBarragem_sincronizadoComHidro DEFAULT 0,
    dataSincronizacao DATETIME2 NULL,
    
    createdAt DATETIME2 NOT NULL CONSTRAINT DF_caracterizacaoBarragem_createdAt DEFAULT SYSDATETIME(),
    updatedAt DATETIME2 NOT NULL CONSTRAINT DF_caracterizacaoBarragem_updatedAt DEFAULT SYSDATETIME(),
    
    CONSTRAINT FK_caracterizacaoBarragem_checklists FOREIGN KEY (checklistId) REFERENCES dbo.checklists(id) ON DELETE CASCADE,
    CONSTRAINT FK_caracterizacaoBarragem_barragens FOREIGN KEY (barragemId) REFERENCES dbo.barragens(id) ON DELETE CASCADE,
    CONSTRAINT FK_caracterizacaoBarragem_users FOREIGN KEY (validadoPor) REFERENCES dbo.users(id)
  );

  -- Índices para melhor performance
  CREATE INDEX IX_caracterizacaoBarragem_checklistId ON dbo.caracterizacaoBarragem(checklistId);
  CREATE INDEX IX_caracterizacaoBarragem_barragemId ON dbo.caracterizacaoBarragem(barragemId);
  CREATE INDEX IX_caracterizacaoBarragem_validado ON dbo.caracterizacaoBarragem(barragemId, validado, createdAt DESC);
  CREATE INDEX IX_caracterizacaoBarragem_sincronizadoComHidro ON dbo.caracterizacaoBarragem(barragemId, sincronizadoComHidro);
  
  PRINT 'Tabela caracterizacaoBarragem criada com sucesso!';
END
ELSE
BEGIN
  PRINT 'Tabela caracterizacaoBarragem já existe.';
END
GO




