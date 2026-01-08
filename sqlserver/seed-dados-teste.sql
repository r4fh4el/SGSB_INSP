-- ============================================================================
-- SCRIPT DE SEED - DADOS DE TESTE PARA SGSB_INSP
-- Cadastra 3-4 registros de cada tabela principal para verificação
-- ============================================================================

USE [sgsb_insp];
GO

PRINT '';
PRINT '========================================';
PRINT 'Inserindo dados de teste...';
PRINT '========================================';
PRINT '';

-- ============================================================================
-- USUARIOS (4 registros)
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM dbo.users)
BEGIN
  INSERT INTO dbo.users (id, name, email, loginMethod, role, ativo, createdAt, lastSignedIn)
  VALUES
    ('user-001', 'João Silva', 'joao.silva@exemplo.com', 'email', 'administrador', 1, SYSDATETIME(), SYSDATETIME()),
    ('user-002', 'Maria Santos', 'maria.santos@exemplo.com', 'email', 'inspetor', 1, SYSDATETIME(), SYSDATETIME()),
    ('user-003', 'Pedro Oliveira', 'pedro.oliveira@exemplo.com', 'email', 'visualizador', 1, SYSDATETIME(), SYSDATETIME()),
    ('user-004', 'Ana Costa', 'ana.costa@exemplo.com', 'email', 'gestor', 1, SYSDATETIME(), SYSDATETIME());
  
  PRINT '✓ 4 usuários inseridos.';
END
ELSE
BEGIN
  PRINT '⚠ Usuários já existem.';
END
GO

-- ============================================================================
-- BARRAGENS (4 registros)
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM dbo.barragens)
BEGIN
  SET IDENTITY_INSERT dbo.barragens ON;
  
  INSERT INTO dbo.barragens (id, codigo, nome, rio, bacia, municipio, estado, latitude, longitude, tipo, finalidade, altura, comprimento, volumeReservatorio, areaReservatorio, categoriaRisco, danoPotencialAssociado, status, proprietario, operador, anoInicioConstrucao, anoInicioOperacao, createdAt, updatedAt)
  VALUES
    (1, 'BARR-001', 'Barragem do Rio Verde', 'Rio Verde', 'Bacia do Alto Paranaíba', 'Patos de Minas', 'MG', '-18.5786', '-46.5181', 'Terra/Zona-Não-Nuclear', 'Abastecimento', '45', '350', '25000000', '120', 'C', 'M', 'ativa', 'Companhia de Saneamento', 'Companhia de Saneamento', 1985, 1990, SYSDATETIME(), SYSDATETIME()),
    (2, 'BARR-002', 'Barragem São Francisco', 'Rio São Francisco', 'Bacia do São Francisco', 'Três Marias', 'MG', '-18.2075', '-45.2344', 'Concreto', 'Geração de Energia', '75', '2700', '21000000000', '1100', 'A', 'A', 'ativa', 'CEMIG', 'CEMIG', 1976, 1979, SYSDATETIME(), SYSDATETIME()),
    (3, 'BARR-003', 'Barragem do Peixe', 'Rio do Peixe', 'Bacia do Paraná', 'Araxá', 'MG', '-19.5933', '-46.9403', 'Terra', 'Contenção de Rejeitos', '38', '180', '1500000', '45', 'B', 'M', 'ativa', 'Mineração XYZ', 'Mineração XYZ', 2005, 2008, SYSDATETIME(), SYSDATETIME()),
    (4, 'BARR-004', 'Barragem Nova Esperança', 'Córrego Esperança', 'Bacia do Paraopeba', 'Brumadinho', 'MG', '-20.1433', '-44.1997', 'Terra/Zona-Não-Nuclear', 'Abastecimento', '28', '120', '800000', '25', 'D', 'B', 'ativa', 'Prefeitura Municipal', 'SAAE', 2010, 2012, SYSDATETIME(), SYSDATETIME());
  
  SET IDENTITY_INSERT dbo.barragens OFF;
  
  PRINT '✓ 4 barragens inseridas.';
END
ELSE
BEGIN
  PRINT '⚠ Barragens já existem.';
END
GO

-- ============================================================================
-- ESTRUTURAS (4 registros - 1 por barragem)
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM dbo.estruturas)
BEGIN
  INSERT INTO dbo.estruturas (barragemId, codigo, nome, tipo, descricao, localizacao, coordenadas, ativo, createdAt)
  VALUES
    (1, 'EST-001', 'Macico Principal', 'Macico', 'Macico principal da barragem', 'Talude de montante', '-18.5786, -46.5181', 1, SYSDATETIME()),
    (2, 'EST-002', 'Casa de Força', 'Casa de Força', 'Estrutura de geração de energia', 'Pé da barragem', '-18.2075, -45.2344', 1, SYSDATETIME()),
    (3, 'EST-003', 'Vertedouro', 'Vertedouro', 'Estrutura de extravasão', 'Lado direito', '-19.5933, -46.9403', 1, SYSDATETIME()),
    (4, 'EST-004', 'Sistema de Drenagem', 'Drenagem', 'Sistema de drenagem interna', 'Base da barragem', '-20.1433, -44.1997', 1, SYSDATETIME());
  
  PRINT '✓ 4 estruturas inseridas.';
END
ELSE
BEGIN
  PRINT '⚠ Estruturas já existem.';
END
GO

-- ============================================================================
-- INSTRUMENTOS (4 registros - 1 por barragem)
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM dbo.instrumentos)
BEGIN
  INSERT INTO dbo.instrumentos (barragemId, estruturaId, codigo, tipo, localizacao, estaca, cota, dataInstalacao, fabricante, modelo, nivelNormal, nivelAlerta, nivelCritico, unidadeMedida, limiteInferior, limiteSuperior, frequenciaLeitura, status, ativo, createdAt, updatedAt)
  VALUES
    (1, 1, 'PIEZ-001', 'Piezômetro', 'Estaca 10+50', '10+50', '850', '2020-01-15', 'Geokon', 'Model 4500', '850', '855', '860', 'm', '840', '865', 'Semanal', 'ativo', 1, SYSDATETIME(), SYSDATETIME()),
    (2, 2, 'NIVEL-002', 'Medidor de Nível', 'Casa de Força', NULL, NULL, '2018-03-20', 'Vega', 'VEGAPULS 64', '745', '750', '755', 'm', '740', '760', 'Diária', 'ativo', 1, SYSDATETIME(), SYSDATETIME()),
    (3, 3, 'INCLI-003', 'Inclinômetro', 'Estaca 5+25', '5+25', '720', '2019-06-10', 'Sisgeo', 'Model 6000', '0', '5', '10', 'mm', '-10', '15', 'Quinzenal', 'ativo', 1, SYSDATETIME(), SYSDATETIME()),
    (4, 4, 'VAZAO-004', 'Medidor de Vazão', 'Entrada do reservatório', NULL, NULL, '2021-02-08', 'Krohne', 'Waterflux 3070', '50', '60', '70', 'm³/s', '40', '80', 'Diária', 'ativo', 1, SYSDATETIME(), SYSDATETIME());
  
  PRINT '✓ 4 instrumentos inseridos.';
END
ELSE
BEGIN
  PRINT '⚠ Instrumentos já existem.';
END
GO

-- ============================================================================
-- LEITURAS (4 registros - 1 por instrumento)
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM dbo.leituras)
BEGIN
  INSERT INTO dbo.leituras (instrumentoId, usuarioId, dataHora, valor, nivelMontante, inconsistencia, origem, observacoes, createdAt)
  VALUES
    (1, 'user-002', DATEADD(DAY, -1, SYSDATETIME()), '852.5', '852.0', 0, 'mobile', 'Leitura realizada conforme protocolo', SYSDATETIME()),
    (2, 'user-002', DATEADD(HOUR, -6, SYSDATETIME()), '747.2', '747.0', 0, 'web', 'Nível dentro do normal', SYSDATETIME()),
    (3, 'user-002', DATEADD(DAY, -2, SYSDATETIME()), '2.3', '852.0', 0, 'mobile', 'Leitura estável', SYSDATETIME()),
    (4, 'user-002', DATEADD(HOUR, -3, SYSDATETIME()), '55.8', '852.0', 0, 'automatico', 'Vazão normal', SYSDATETIME());
  
  PRINT '✓ 4 leituras inseridas.';
END
ELSE
BEGIN
  PRINT '⚠ Leituras já existem.';
END
GO

-- ============================================================================
-- CHECKLISTS (4 registros - 1 por barragem)
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM dbo.checklists)
BEGIN
  INSERT INTO dbo.checklists (barragemId, usuarioId, data, tipo, inspetor, climaCondicoes, status, observacoesGerais, latitude, longitude, createdAt, updatedAt)
  VALUES
    (1, 'user-002', DATEADD(DAY, -5, SYSDATETIME()), 'mensal', 'Maria Santos', 'Ensolarado', 'concluida', 'Inspeção mensal realizada sem problemas identificados', '-18.5786', '-46.5181', SYSDATETIME(), SYSDATETIME()),
    (2, 'user-002', DATEADD(DAY, -3, SYSDATETIME()), 'mensal', 'Maria Santos', 'Nublado', 'concluida', 'Todas as estruturas em bom estado', '-18.2075', '-45.2344', SYSDATETIME(), SYSDATETIME()),
    (3, 'user-002', DATEADD(DAY, -7, SYSDATETIME()), 'ISE', 'Pedro Oliveira', 'Chuva leve', 'em_andamento', 'Inspeção especial em andamento', '-19.5933', '-46.9403', SYSDATETIME(), SYSDATETIME()),
    (4, 'user-002', DATEADD(DAY, -1, SYSDATETIME()), 'mensal', 'Ana Costa', 'Ensolarado', 'concluida', 'Inspeção realizada com sucesso', '-20.1433', '-44.1997', SYSDATETIME(), SYSDATETIME());
  
  PRINT '✓ 4 checklists inseridos.';
END
ELSE
BEGIN
  PRINT '⚠ Checklists já existem.';
END
GO

-- ============================================================================
-- PERGUNTAS CHECKLIST (4 registros)
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM dbo.perguntasChecklist)
BEGIN
  INSERT INTO dbo.perguntasChecklist (barragemId, categoria, pergunta, ordem, ativo, createdAt)
  VALUES
    (NULL, 'Estrutura Principal', 'Existe algum sinal de trincas no maciço?', 1, 1, SYSDATETIME()),
    (NULL, 'Estrutura Principal', 'Há presença de erosão superficial?', 2, 1, SYSDATETIME()),
    (NULL, 'Drenagem', 'Os sistemas de drenagem estão funcionando corretamente?', 3, 1, SYSDATETIME()),
    (NULL, 'Vegetação', 'A vegetação está adequada e controlada?', 4, 1, SYSDATETIME());
  
  PRINT '✓ 4 perguntas de checklist inseridas.';
END
ELSE
BEGIN
  PRINT '⚠ Perguntas de checklist já existem.';
END
GO

-- ============================================================================
-- RESPOSTAS CHECKLIST (4 registros - 1 por checklist e pergunta)
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM dbo.respostasChecklist)
BEGIN
  INSERT INTO dbo.respostasChecklist (checklistId, perguntaId, resposta, situacaoAnterior, comentario, createdAt)
  VALUES
    (1, 1, 'NO', 'NO', 'Nenhuma trinca observada', SYSDATETIME()),
    (2, 2, 'PC', 'PC', 'Situação permanece constante', SYSDATETIME()),
    (3, 3, 'PC', 'PC', 'Sistemas funcionando normalmente', SYSDATETIME()),
    (4, 4, 'PC', 'PC', 'Vegetação controlada adequadamente', SYSDATETIME());
  
  PRINT '✓ 4 respostas de checklist inseridas.';
END
ELSE
BEGIN
  PRINT '⚠ Respostas de checklist já existem.';
END
GO

-- ============================================================================
-- CARACTERIZACAO BARRAGEM (3 registros)
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM dbo.caracterizacaoBarragem)
BEGIN
  INSERT INTO dbo.caracterizacaoBarragem (checklistId, barragemId, areaBaciaHidrografica, perimetro, comprimentoRioPrincipal, altitudeMinimaBacia, altitudeMaximaBacia, larguraBarragem, alturaMaciçoPrincipal, validado, createdAt, updatedAt)
  VALUES
    (1, 1, 125.50, 45.20, 12.80, 840.00, 920.00, 350.00, 45.00, 1, SYSDATETIME(), SYSDATETIME()),
    (2, 2, 850.30, 180.50, 45.60, 720.00, 880.00, 2700.00, 75.00, 1, SYSDATETIME(), SYSDATETIME()),
    (4, 4, 35.20, 28.40, 8.90, 650.00, 720.00, 120.00, 28.00, 0, SYSDATETIME(), SYSDATETIME());
  
  PRINT '✓ 3 caracterizações de barragem inseridas.';
END
ELSE
BEGIN
  PRINT '⚠ Caracterizações já existem.';
END
GO

-- ============================================================================
-- OCORRENCIAS (4 registros)
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM dbo.ocorrencias)
BEGIN
  INSERT INTO dbo.ocorrencias (barragemId, estruturaId, usuarioRegistroId, dataHoraRegistro, estrutura, relato, titulo, categoria, severidade, status, createdAt, updatedAt)
  VALUES
    (1, 1, 'user-002', DATEADD(DAY, -10, SYSDATETIME()), 'Macico Principal', 'Observada pequena área de vegetação descontrolada no talude de montante', 'Vegetação Descontrolada', 'Vegetação', 'baixa', 'pendente', SYSDATETIME(), SYSDATETIME()),
    (2, 2, 'user-002', DATEADD(DAY, -8, SYSDATETIME()), 'Casa de Força', 'Verificação de equipamentos realizada com sucesso', 'Inspeção de Equipamentos', 'Manutenção', 'info', 'concluida', SYSDATETIME(), SYSDATETIME()),
    (3, 3, 'user-003', DATEADD(DAY, -5, SYSDATETIME()), 'Vertedouro', 'Pequena rachadura observada na estrutura, requer monitoramento', 'Rachadura no Vertedouro', 'Estrutural', 'media', 'em_avaliacao', SYSDATETIME(), SYSDATETIME()),
    (4, 4, 'user-004', DATEADD(DAY, -2, SYSDATETIME()), 'Sistema de Drenagem', 'Limpeza preventiva realizada no sistema', 'Limpeza Preventiva', 'Manutenção', 'info', 'concluida', SYSDATETIME(), SYSDATETIME());
  
  PRINT '✓ 4 ocorrências inseridas.';
END
ELSE
BEGIN
  PRINT '⚠ Ocorrências já existem.';
END
GO

-- ============================================================================
-- HIDROMETRIA (4 registros)
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM dbo.hidrometria)
BEGIN
  INSERT INTO dbo.hidrometria (barragemId, usuarioId, dataLeitura, dataHora, nivelMontante, nivelJusante, vazao, volumeReservatorio, observacoes, createdAt)
  VALUES
    (1, 'user-002', CAST(SYSDATETIME() AS DATE), SYSDATETIME(), '852.0', '840.5', '12.5', '18500000', 'Medições dentro do normal', SYSDATETIME()),
    (2, 'user-002', CAST(SYSDATETIME() AS DATE), SYSDATETIME(), '747.2', '720.1', '450.0', '19800000000', 'Operação normal', SYSDATETIME()),
    (3, 'user-002', CAST(SYSDATETIME() AS DATE), SYSDATETIME(), '715.8', '710.2', '8.2', '1450000', 'Sistema estável', SYSDATETIME()),
    (4, 'user-002', CAST(SYSDATETIME() AS DATE), SYSDATETIME(), '685.5', '675.3', '55.8', '750000', 'Vazão controlada', SYSDATETIME());
  
  PRINT '✓ 4 registros de hidrometria inseridos.';
END
ELSE
BEGIN
  PRINT '⚠ Registros de hidrometria já existem.';
END
GO

-- ============================================================================
-- DOCUMENTOS (4 registros)
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM dbo.documentos)
BEGIN
  INSERT INTO dbo.documentos (barragemId, usuarioId, tipo, categoria, titulo, descricao, arquivoUrl, arquivoNome, arquivoTamanho, arquivoTipo, createdAt, updatedAt)
  VALUES
    (1, 'user-001', 'Relatório', 'Inspeção', 'Relatório Mensal - Janeiro 2024', 'Relatório de inspeção mensal', '/documentos/barr-001-rel-jan-2024.pdf', 'barr-001-rel-jan-2024.pdf', 524288, 'application/pdf', SYSDATETIME(), SYSDATETIME()),
    (2, 'user-001', 'Planta', 'Projeto', 'Planta Topográfica', 'Planta topográfica da barragem', '/documentos/barr-002-planta.pdf', 'barr-002-planta.pdf', 1048576, 'application/pdf', SYSDATETIME(), SYSDATETIME()),
    (3, 'user-001', 'Manual', 'Operação', 'Manual de Operação', 'Manual de operação e manutenção', '/documentos/barr-003-manual.pdf', 'barr-003-manual.pdf', 2097152, 'application/pdf', SYSDATETIME(), SYSDATETIME()),
    (4, 'user-001', 'Certificado', 'Licenciamento', 'Licença Ambiental', 'Licença ambiental vigente', '/documentos/barr-004-licenca.pdf', 'barr-004-licenca.pdf', 262144, 'application/pdf', SYSDATETIME(), SYSDATETIME());
  
  PRINT '✓ 4 documentos inseridos.';
END
ELSE
BEGIN
  PRINT '⚠ Documentos já existem.';
END
GO

-- ============================================================================
-- MANUTENCOES (4 registros)
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM dbo.manutencoes)
BEGIN
  INSERT INTO dbo.manutencoes (barragemId, estruturaId, ocorrenciaId, tipo, titulo, descricao, dataProgramada, responsavel, status, createdAt, updatedAt)
  VALUES
    (1, 1, 1, 'preventiva', 'Limpeza de Vegetação', 'Remoção de vegetação descontrolada no talude', DATEADD(DAY, 5, SYSDATETIME()), 'Equipe de Manutenção', 'planejada', SYSDATETIME(), SYSDATETIME()),
    (2, 2, 2, 'preventiva', 'Revisão de Equipamentos', 'Revisão periódica dos equipamentos da casa de força', DATEADD(DAY, 10, SYSDATETIME()), 'Técnico Especializado', 'planejada', SYSDATETIME(), SYSDATETIME()),
    (3, 3, 3, 'corretiva', 'Reparo de Rachadura', 'Reparo e monitoramento da rachadura observada', DATEADD(DAY, 2, SYSDATETIME()), 'Engenheiro Responsável', 'planejada', SYSDATETIME(), SYSDATETIME()),
    (4, 4, 4, 'preventiva', 'Manutenção de Drenagem', 'Manutenção preventiva do sistema de drenagem', DATEADD(DAY, 7, SYSDATETIME()), 'Equipe de Manutenção', 'em_execucao', SYSDATETIME(), SYSDATETIME());
  
  PRINT '✓ 4 manutenções inseridas.';
END
ELSE
BEGIN
  PRINT '⚠ Manutenções já existem.';
END
GO

-- ============================================================================
-- ALERTAS (3 registros)
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM dbo.alertas)
BEGIN
  INSERT INTO dbo.alertas (barragemId, instrumentoId, leituraId, tipo, severidade, titulo, mensagem, lido, createdAt)
  VALUES
    (1, 1, 1, 'Nível', 'info', 'Leitura Normal', 'Piezômetro PIEZ-001 registrou leitura dentro do normal', 0, SYSDATETIME()),
    (3, 3, 3, 'Estrutural', 'aviso', 'Monitoramento Necessário', 'Inclinômetro INCLI-003 registrou pequeno deslocamento. Requer monitoramento', 0, SYSDATETIME()),
    (2, 2, 2, 'Operacional', 'info', 'Operação Normal', 'Medidor de nível registrou operação dentro dos parâmetros normais', 1, SYSDATETIME());
  
  PRINT '✓ 3 alertas inseridos.';
END
ELSE
BEGIN
  PRINT '⚠ Alertas já existem.';
END
GO

-- ============================================================================
-- RELATORIOS (3 registros)
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM dbo.relatorios)
BEGIN
  INSERT INTO dbo.relatorios (barragemId, usuarioId, tipo, titulo, checklistId, arquivoUrl, formato, createdAt)
  VALUES
    (1, 'user-001', 'Mensal', 'Relatório Mensal - Barragem 001', 1, '/relatorios/rel-mensal-barr-001.pdf', 'PDF', SYSDATETIME()),
    (2, 'user-001', 'Anual', 'Relatório Anual - Barragem 002', 2, '/relatorios/rel-anual-barr-002.pdf', 'PDF', SYSDATETIME()),
    (4, 'user-001', 'Mensal', 'Relatório Mensal - Barragem 004', 4, '/relatorios/rel-mensal-barr-004.pdf', 'PDF', SYSDATETIME());
  
  PRINT '✓ 3 relatórios inseridos.';
END
ELSE
BEGIN
  PRINT '⚠ Relatórios já existem.';
END
GO

-- ============================================================================
-- AUDITORIA (4 registros)
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM dbo.auditoria)
BEGIN
  INSERT INTO dbo.auditoria (usuarioId, acao, entidade, entidadeId, detalhes, ip, createdAt)
  VALUES
    ('user-002', 'CREATE', 'checklist', 1, 'Checklist mensal criado', '192.168.1.100', SYSDATETIME()),
    ('user-002', 'CREATE', 'leitura', 1, 'Leitura de instrumento registrada', '192.168.1.100', SYSDATETIME()),
    ('user-001', 'UPDATE', 'barragem', 1, 'Dados da barragem atualizados', '192.168.1.101', SYSDATETIME()),
    ('user-004', 'CREATE', 'ocorrencia', 1, 'Nova ocorrência registrada', '192.168.1.102', SYSDATETIME());
  
  PRINT '✓ 4 registros de auditoria inseridos.';
END
ELSE
BEGIN
  PRINT '⚠ Registros de auditoria já existem.';
END
GO

PRINT '';
PRINT '========================================';
PRINT 'Dados de teste inseridos com sucesso!';
PRINT '========================================';
PRINT '';
PRINT 'Resumo dos dados inseridos:';
PRINT '- 4 Usuários';
PRINT '- 4 Barragens';
PRINT '- 4 Estruturas';
PRINT '- 4 Instrumentos';
PRINT '- 4 Leituras';
PRINT '- 4 Checklists';
PRINT '- 4 Perguntas de Checklist';
PRINT '- 4 Respostas de Checklist';
PRINT '- 3 Caracterizações de Barragem';
PRINT '- 4 Ocorrências';
PRINT '- 4 Registros de Hidrometria';
PRINT '- 4 Documentos';
PRINT '- 4 Manutenções';
PRINT '- 3 Alertas';
PRINT '- 3 Relatórios';
PRINT '- 4 Registros de Auditoria';
PRINT '';
GO




