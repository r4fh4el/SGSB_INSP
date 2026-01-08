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
END
GO

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
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'estruturas' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
  CREATE TABLE dbo.estruturas (
    id INT IDENTITY(1,1) PRIMARY KEY,
    barragemId INT NOT NULL,
    codigo NVARCHAR(50) NOT NULL,
    nome NVARCHAR(255) NOT NULL,
    tipo NVARCHAR(100) NOT NULL,
    descricao NVARCHAR(MAX) NULL,
    localizacao NVARCHAR(255) NULL,
    coordenadas NVARCHAR(100) NULL,
    ativo BIT NOT NULL CONSTRAINT DF_estruturas_ativo DEFAULT 1,
    createdAt DATETIME2 NOT NULL CONSTRAINT DF_estruturas_createdAt DEFAULT SYSDATETIME(),
    CONSTRAINT FK_estruturas_barragens FOREIGN KEY (barragemId) REFERENCES dbo.barragens(id) ON DELETE CASCADE
  );

  CREATE INDEX IX_estruturas_barragemId ON dbo.estruturas(barragemId);
  CREATE UNIQUE INDEX UX_estruturas_codigo ON dbo.estruturas(barragemId, codigo);
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'instrumentos' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
  CREATE TABLE dbo.instrumentos (
    id INT IDENTITY(1,1) PRIMARY KEY,
    barragemId INT NOT NULL,
    estruturaId INT NULL,
    codigo NVARCHAR(50) NOT NULL,
    tipo NVARCHAR(100) NOT NULL,
    localizacao NVARCHAR(255) NULL,
    estaca NVARCHAR(50) NULL,
    cota NVARCHAR(50) NULL,
    coordenadas NVARCHAR(100) NULL,
    dataInstalacao DATETIME2 NULL,
    fabricante NVARCHAR(255) NULL,
    modelo NVARCHAR(255) NULL,
    numeroSerie NVARCHAR(100) NULL,
    nivelNormal NVARCHAR(50) NULL,
    nivelAlerta NVARCHAR(50) NULL,
    nivelCritico NVARCHAR(50) NULL,
    formula NVARCHAR(MAX) NULL,
    unidadeMedida NVARCHAR(50) NULL,
    limiteInferior NVARCHAR(50) NULL,
    limiteSuperior NVARCHAR(50) NULL,
    frequenciaLeitura NVARCHAR(100) NULL,
    responsavel NVARCHAR(255) NULL,
    qrCode NVARCHAR(255) NULL,
    codigoBarras NVARCHAR(255) NULL,
    status NVARCHAR(32) NOT NULL CONSTRAINT DF_instrumentos_status DEFAULT 'ativo',
    observacoes NVARCHAR(MAX) NULL,
    ativo BIT NOT NULL CONSTRAINT DF_instrumentos_ativo DEFAULT 1,
    createdAt DATETIME2 NOT NULL CONSTRAINT DF_instrumentos_createdAt DEFAULT SYSDATETIME(),
    updatedAt DATETIME2 NOT NULL CONSTRAINT DF_instrumentos_updatedAt DEFAULT SYSDATETIME(),
    CONSTRAINT FK_instrumentos_barragens FOREIGN KEY (barragemId) REFERENCES dbo.barragens(id) ON DELETE CASCADE,
    CONSTRAINT FK_instrumentos_estruturas FOREIGN KEY (estruturaId) REFERENCES dbo.estruturas(id) ON DELETE NO ACTION
  );

  CREATE UNIQUE INDEX UX_instrumentos_codigo ON dbo.instrumentos(codigo);
  CREATE INDEX IX_instrumentos_barragemId ON dbo.instrumentos(barragemId);
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'leituras' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
  CREATE TABLE dbo.leituras (
    id INT IDENTITY(1,1) PRIMARY KEY,
    instrumentoId INT NOT NULL,
    usuarioId NVARCHAR(64) NOT NULL,
    dataHora DATETIME2 NOT NULL,
    valor NVARCHAR(50) NOT NULL,
    nivelMontante NVARCHAR(50) NULL,
    inconsistencia BIT NOT NULL CONSTRAINT DF_leituras_inconsistencia DEFAULT 0,
    tipoInconsistencia NVARCHAR(100) NULL,
    observacoes NVARCHAR(MAX) NULL,
    origem NVARCHAR(16) NOT NULL CONSTRAINT DF_leituras_origem DEFAULT 'mobile',
    latitude NVARCHAR(50) NULL,
    longitude NVARCHAR(50) NULL,
    createdAt DATETIME2 NOT NULL CONSTRAINT DF_leituras_createdAt DEFAULT SYSDATETIME(),
    CONSTRAINT FK_leituras_instrumentos FOREIGN KEY (instrumentoId) REFERENCES dbo.instrumentos(id) ON DELETE CASCADE,
    CONSTRAINT FK_leituras_users FOREIGN KEY (usuarioId) REFERENCES dbo.users(id)
  );

  CREATE INDEX IX_leituras_instrumentoId ON dbo.leituras(instrumentoId, dataHora DESC);
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'checklists' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
  CREATE TABLE dbo.checklists (
    id INT IDENTITY(1,1) PRIMARY KEY,
    barragemId INT NOT NULL,
    usuarioId NVARCHAR(64) NOT NULL,
    data DATETIME2 NOT NULL,
    tipo NVARCHAR(32) NOT NULL CONSTRAINT DF_checklists_tipo DEFAULT 'mensal',
    inspetor NVARCHAR(255) NULL,
    climaCondicoes NVARCHAR(255) NULL,
    status NVARCHAR(32) NOT NULL CONSTRAINT DF_checklists_status DEFAULT 'em_andamento',
    consultorId NVARCHAR(64) NULL,
    dataAvaliacao DATETIME2 NULL,
    comentariosConsultor NVARCHAR(MAX) NULL,
    observacoesGerais NVARCHAR(MAX) NULL,
    latitude NVARCHAR(50) NULL,
    longitude NVARCHAR(50) NULL,
    createdAt DATETIME2 NOT NULL CONSTRAINT DF_checklists_createdAt DEFAULT SYSDATETIME(),
    updatedAt DATETIME2 NOT NULL CONSTRAINT DF_checklists_updatedAt DEFAULT SYSDATETIME(),
    CONSTRAINT FK_checklists_barragens FOREIGN KEY (barragemId) REFERENCES dbo.barragens(id) ON DELETE CASCADE,
    CONSTRAINT FK_checklists_users FOREIGN KEY (usuarioId) REFERENCES dbo.users(id)
  );

  CREATE INDEX IX_checklists_barragemId ON dbo.checklists(barragemId, data DESC);
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'perguntasChecklist' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
  CREATE TABLE dbo.perguntasChecklist (
    id INT IDENTITY(1,1) PRIMARY KEY,
    barragemId INT NULL,
    categoria NVARCHAR(100) NOT NULL,
    pergunta NVARCHAR(MAX) NOT NULL,
    ordem INT NOT NULL,
    ativo BIT NOT NULL CONSTRAINT DF_perguntasChecklist_ativo DEFAULT 1,
    createdAt DATETIME2 NOT NULL CONSTRAINT DF_perguntasChecklist_createdAt DEFAULT SYSDATETIME(),
    CONSTRAINT FK_perguntasChecklist_barragens FOREIGN KEY (barragemId) REFERENCES dbo.barragens(id) ON DELETE CASCADE
  );

  CREATE INDEX IX_perguntasChecklist_barragemId ON dbo.perguntasChecklist(barragemId, categoria, ordem);
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'respostasChecklist' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
  CREATE TABLE dbo.respostasChecklist (
    id INT IDENTITY(1,1) PRIMARY KEY,
    checklistId INT NOT NULL,
    perguntaId INT NOT NULL,
    resposta NVARCHAR(4) NOT NULL,
    situacaoAnterior NVARCHAR(4) NULL,
    comentario NVARCHAR(MAX) NULL,
    fotos NVARCHAR(MAX) NULL,
    createdAt DATETIME2 NOT NULL CONSTRAINT DF_respostasChecklist_createdAt DEFAULT SYSDATETIME(),
    CONSTRAINT FK_respostasChecklist_checklists FOREIGN KEY (checklistId) REFERENCES dbo.checklists(id) ON DELETE CASCADE,
    CONSTRAINT FK_respostasChecklist_perguntas FOREIGN KEY (perguntaId) REFERENCES dbo.perguntasChecklist(id)
  );

  CREATE INDEX IX_respostasChecklist_checklistId ON dbo.respostasChecklist(checklistId);
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'ocorrencias' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
  CREATE TABLE dbo.ocorrencias (
    id INT IDENTITY(1,1) PRIMARY KEY,
    barragemId INT NOT NULL,
    estruturaId INT NULL,
    usuarioRegistroId NVARCHAR(64) NOT NULL,
    dataHoraRegistro DATETIME2 NOT NULL,
    estrutura NVARCHAR(255) NOT NULL,
    relato NVARCHAR(MAX) NOT NULL,
    fotos NVARCHAR(MAX) NULL,
    titulo NVARCHAR(255) NULL,
    descricao NVARCHAR(MAX) NULL,
    dataOcorrencia DATETIME2 NULL,
    localOcorrencia NVARCHAR(255) NULL,
    acaoImediata NVARCHAR(MAX) NULL,
    responsavel NVARCHAR(255) NULL,
    categoria NVARCHAR(100) NULL,
    severidade NVARCHAR(16) NULL,
    tipo NVARCHAR(100) NULL,
    status NVARCHAR(32) NOT NULL CONSTRAINT DF_ocorrencias_status DEFAULT 'pendente',
    usuarioAvaliacaoId NVARCHAR(64) NULL,
    dataAvaliacao DATETIME2 NULL,
    comentariosAvaliacao NVARCHAR(MAX) NULL,
    dataConclusao DATETIME2 NULL,
    comentariosConclusao NVARCHAR(MAX) NULL,
    latitude NVARCHAR(50) NULL,
    longitude NVARCHAR(50) NULL,
    createdAt DATETIME2 NOT NULL CONSTRAINT DF_ocorrencias_createdAt DEFAULT SYSDATETIME(),
    updatedAt DATETIME2 NOT NULL CONSTRAINT DF_ocorrencias_updatedAt DEFAULT SYSDATETIME(),
    CONSTRAINT FK_ocorrencias_barragens FOREIGN KEY (barragemId) REFERENCES dbo.barragens(id) ON DELETE CASCADE,
    CONSTRAINT FK_ocorrencias_estruturas FOREIGN KEY (estruturaId) REFERENCES dbo.estruturas(id) ON DELETE NO ACTION,
    CONSTRAINT FK_ocorrencias_users_registro FOREIGN KEY (usuarioRegistroId) REFERENCES dbo.users(id),
    CONSTRAINT FK_ocorrencias_users_avaliacao FOREIGN KEY (usuarioAvaliacaoId) REFERENCES dbo.users(id)
  );

  CREATE INDEX IX_ocorrencias_barragemId ON dbo.ocorrencias(barragemId, dataHoraRegistro DESC);
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'hidrometria' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
  CREATE TABLE dbo.hidrometria (
    id INT IDENTITY(1,1) PRIMARY KEY,
    barragemId INT NOT NULL,
    usuarioId NVARCHAR(64) NOT NULL,
    dataLeitura DATETIME2 NOT NULL,
    dataHora DATETIME2 NOT NULL,
    nivelMontante NVARCHAR(50) NULL,
    nivelJusante NVARCHAR(50) NULL,
    nivelReservatorio NVARCHAR(50) NULL,
    vazao NVARCHAR(50) NULL,
    vazaoAfluente NVARCHAR(50) NULL,
    vazaoDefluente NVARCHAR(50) NULL,
    vazaoVertedouro NVARCHAR(50) NULL,
    volumeReservatorio NVARCHAR(50) NULL,
    volumeArmazenado NVARCHAR(50) NULL,
    observacoes NVARCHAR(MAX) NULL,
    createdAt DATETIME2 NOT NULL CONSTRAINT DF_hidrometria_createdAt DEFAULT SYSDATETIME(),
    CONSTRAINT FK_hidrometria_barragens FOREIGN KEY (barragemId) REFERENCES dbo.barragens(id) ON DELETE CASCADE,
    CONSTRAINT FK_hidrometria_users FOREIGN KEY (usuarioId) REFERENCES dbo.users(id)
  );

  CREATE INDEX IX_hidrometria_barragemId ON dbo.hidrometria(barragemId, dataHora DESC);
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'documentos' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
  CREATE TABLE dbo.documentos (
    id INT IDENTITY(1,1) PRIMARY KEY,
    barragemId INT NOT NULL,
    usuarioId NVARCHAR(64) NOT NULL,
    tipo NVARCHAR(100) NOT NULL,
    categoria NVARCHAR(100) NULL,
    titulo NVARCHAR(255) NOT NULL,
    descricao NVARCHAR(MAX) NULL,
    arquivoUrl NVARCHAR(500) NOT NULL,
    arquivoNome NVARCHAR(255) NOT NULL,
    arquivoTamanho INT NULL,
    arquivoTipo NVARCHAR(100) NULL,
    versao NVARCHAR(50) NULL,
    documentoPaiId INT NULL,
    dataValidade DATETIME2 NULL,
    tags NVARCHAR(500) NULL,
    createdAt DATETIME2 NOT NULL CONSTRAINT DF_documentos_createdAt DEFAULT SYSDATETIME(),
    updatedAt DATETIME2 NOT NULL CONSTRAINT DF_documentos_updatedAt DEFAULT SYSDATETIME(),
    CONSTRAINT FK_documentos_barragens FOREIGN KEY (barragemId) REFERENCES dbo.barragens(id) ON DELETE CASCADE,
    CONSTRAINT FK_documentos_users FOREIGN KEY (usuarioId) REFERENCES dbo.users(id),
    CONSTRAINT FK_documentos_documentoPai FOREIGN KEY (documentoPaiId) REFERENCES dbo.documentos(id)
  );

  CREATE INDEX IX_documentos_barragemId ON dbo.documentos(barragemId, tipo);
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'manutencoes' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
  CREATE TABLE dbo.manutencoes (
    id INT IDENTITY(1,1) PRIMARY KEY,
    barragemId INT NOT NULL,
    estruturaId INT NULL,
    ocorrenciaId INT NULL,
    tipo NVARCHAR(32) NOT NULL,
    titulo NVARCHAR(255) NOT NULL,
    descricao NVARCHAR(MAX) NULL,
    dataProgramada DATETIME2 NULL,
    responsavel NVARCHAR(255) NULL,
    dataInicio DATETIME2 NULL,
    dataConclusao DATETIME2 NULL,
    status NVARCHAR(32) NOT NULL CONSTRAINT DF_manutencoes_status DEFAULT 'planejada',
    custoEstimado NVARCHAR(50) NULL,
    custoReal NVARCHAR(50) NULL,
    observacoes NVARCHAR(MAX) NULL,
    createdAt DATETIME2 NOT NULL CONSTRAINT DF_manutencoes_createdAt DEFAULT SYSDATETIME(),
    updatedAt DATETIME2 NOT NULL CONSTRAINT DF_manutencoes_updatedAt DEFAULT SYSDATETIME(),
    CONSTRAINT FK_manutencoes_barragens FOREIGN KEY (barragemId) REFERENCES dbo.barragens(id) ON DELETE CASCADE,
    CONSTRAINT FK_manutencoes_estruturas FOREIGN KEY (estruturaId) REFERENCES dbo.estruturas(id) ON DELETE NO ACTION,
    CONSTRAINT FK_manutencoes_ocorrencias FOREIGN KEY (ocorrenciaId) REFERENCES dbo.ocorrencias(id) ON DELETE NO ACTION
  );

  CREATE INDEX IX_manutencoes_barragemId ON dbo.manutencoes(barragemId, dataProgramada DESC);
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'alertas' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
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
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'relatorios' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
  CREATE TABLE dbo.relatorios (
    id INT IDENTITY(1,1) PRIMARY KEY,
    barragemId INT NOT NULL,
    usuarioId NVARCHAR(64) NOT NULL,
    tipo NVARCHAR(100) NOT NULL,
    titulo NVARCHAR(255) NOT NULL,
    checklistId INT NULL,
    arquivoUrl NVARCHAR(500) NULL,
    formato NVARCHAR(20) NULL,
    createdAt DATETIME2 NOT NULL CONSTRAINT DF_relatorios_createdAt DEFAULT SYSDATETIME(),
    CONSTRAINT FK_relatorios_barragens FOREIGN KEY (barragemId) REFERENCES dbo.barragens(id) ON DELETE CASCADE,
    CONSTRAINT FK_relatorios_users FOREIGN KEY (usuarioId) REFERENCES dbo.users(id),
    CONSTRAINT FK_relatorios_checklists FOREIGN KEY (checklistId) REFERENCES dbo.checklists(id) ON DELETE NO ACTION
  );

  CREATE INDEX IX_relatorios_barragemId ON dbo.relatorios(barragemId, tipo);
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'auditoria' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
  CREATE TABLE dbo.auditoria (
    id INT IDENTITY(1,1) PRIMARY KEY,
    usuarioId NVARCHAR(64) NULL,
    acao NVARCHAR(100) NOT NULL,
    entidade NVARCHAR(100) NOT NULL,
    entidadeId INT NULL,
    detalhes NVARCHAR(MAX) NULL,
    ip NVARCHAR(50) NULL,
    userAgent NVARCHAR(500) NULL,
    createdAt DATETIME2 NOT NULL CONSTRAINT DF_auditoria_createdAt DEFAULT SYSDATETIME(),
    CONSTRAINT FK_auditoria_users FOREIGN KEY (usuarioId) REFERENCES dbo.users(id)
  );

  CREATE INDEX IX_auditoria_entidade ON dbo.auditoria(entidade, entidadeId);
END
GO
