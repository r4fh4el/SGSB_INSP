CREATE TABLE `alertas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`barragemId` int NOT NULL,
	`tipo` varchar(100) NOT NULL,
	`severidade` enum('info','aviso','alerta','critico') NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`mensagem` text NOT NULL,
	`instrumentoId` int,
	`leituraId` int,
	`ocorrenciaId` int,
	`destinatarios` text,
	`lido` boolean NOT NULL DEFAULT false,
	`dataLeitura` datetime,
	`acaoTomada` text,
	`dataAcao` datetime,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `alertas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `auditoria` (
	`id` int AUTO_INCREMENT NOT NULL,
	`usuarioId` varchar(64),
	`acao` varchar(100) NOT NULL,
	`entidade` varchar(100) NOT NULL,
	`entidadeId` int,
	`detalhes` text,
	`ip` varchar(50),
	`userAgent` varchar(500),
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `auditoria_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `barragens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`codigo` varchar(50) NOT NULL,
	`nome` varchar(255) NOT NULL,
	`rio` varchar(255),
	`bacia` varchar(255),
	`municipio` varchar(255),
	`estado` varchar(2),
	`latitude` varchar(50),
	`longitude` varchar(50),
	`tipo` varchar(100),
	`finalidade` varchar(255),
	`altura` varchar(50),
	`comprimento` varchar(50),
	`volumeReservatorio` varchar(50),
	`areaReservatorio` varchar(50),
	`nivelMaximoNormal` varchar(50),
	`nivelMaximoMaximorum` varchar(50),
	`nivelMinimo` varchar(50),
	`proprietario` varchar(255),
	`operador` varchar(255),
	`anoInicioConstrucao` int,
	`anoInicioOperacao` int,
	`categoriaRisco` enum('A','B','C','D','E'),
	`danoPotencialAssociado` enum('Alto','Medio','Baixo'),
	`status` enum('ativa','inativa','em_construcao') NOT NULL DEFAULT 'ativa',
	`observacoes` text,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `barragens_id` PRIMARY KEY(`id`),
	CONSTRAINT `barragens_codigo_unique` UNIQUE(`codigo`)
);
--> statement-breakpoint
CREATE TABLE `checklists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`barragemId` int NOT NULL,
	`usuarioId` varchar(64) NOT NULL,
	`data` datetime NOT NULL,
	`tipo` enum('mensal','especial','emergencial') NOT NULL DEFAULT 'mensal',
	`status` enum('em_andamento','concluido','aprovado') NOT NULL DEFAULT 'em_andamento',
	`consultorId` varchar(64),
	`dataAvaliacao` datetime,
	`comentariosConsultor` text,
	`observacoesGerais` text,
	`latitude` varchar(50),
	`longitude` varchar(50),
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `checklists_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `documentos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`barragemId` int NOT NULL,
	`usuarioId` varchar(64) NOT NULL,
	`tipo` varchar(100) NOT NULL,
	`categoria` varchar(100),
	`titulo` varchar(255) NOT NULL,
	`descricao` text,
	`arquivoUrl` varchar(500) NOT NULL,
	`arquivoNome` varchar(255) NOT NULL,
	`arquivoTamanho` int,
	`arquivoTipo` varchar(100),
	`versao` varchar(50),
	`documentoPaiId` int,
	`dataValidade` datetime,
	`tags` varchar(500),
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `documentos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `estruturas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`barragemId` int NOT NULL,
	`codigo` varchar(50) NOT NULL,
	`nome` varchar(255) NOT NULL,
	`tipo` varchar(100) NOT NULL,
	`descricao` text,
	`localizacao` varchar(255),
	`coordenadas` varchar(100),
	`ativo` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `estruturas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hidrometria` (
	`id` int AUTO_INCREMENT NOT NULL,
	`barragemId` int NOT NULL,
	`usuarioId` varchar(64) NOT NULL,
	`dataHora` datetime NOT NULL,
	`nivelMontante` varchar(50) NOT NULL,
	`nivelJusante` varchar(50),
	`vazao` varchar(50),
	`volumeReservatorio` varchar(50),
	`observacoes` text,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `hidrometria_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `instrumentos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`barragemId` int NOT NULL,
	`estruturaId` int,
	`codigo` varchar(50) NOT NULL,
	`tipo` varchar(100) NOT NULL,
	`localizacao` varchar(255),
	`estaca` varchar(50),
	`cota` varchar(50),
	`coordenadas` varchar(100),
	`dataInstalacao` datetime,
	`fabricante` varchar(255),
	`modelo` varchar(255),
	`numeroSerie` varchar(100),
	`nivelNormal` varchar(50),
	`nivelAlerta` varchar(50),
	`nivelCritico` varchar(50),
	`formula` text,
	`unidadeMedida` varchar(50),
	`qrCode` varchar(255),
	`codigoBarras` varchar(255),
	`observacoes` text,
	`ativo` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `instrumentos_id` PRIMARY KEY(`id`),
	CONSTRAINT `instrumentos_codigo_unique` UNIQUE(`codigo`)
);
--> statement-breakpoint
CREATE TABLE `leituras` (
	`id` int AUTO_INCREMENT NOT NULL,
	`instrumentoId` int NOT NULL,
	`usuarioId` varchar(64) NOT NULL,
	`dataHora` datetime NOT NULL,
	`valor` varchar(50) NOT NULL,
	`nivelMontante` varchar(50),
	`inconsistencia` boolean NOT NULL DEFAULT false,
	`tipoInconsistencia` varchar(100),
	`observacoes` text,
	`origem` enum('mobile','web','automatico') NOT NULL DEFAULT 'mobile',
	`latitude` varchar(50),
	`longitude` varchar(50),
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `leituras_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `manutencoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`barragemId` int NOT NULL,
	`estruturaId` int,
	`ocorrenciaId` int,
	`tipo` enum('preventiva','corretiva','preditiva') NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descricao` text,
	`dataProgramada` datetime,
	`responsavel` varchar(255),
	`dataInicio` datetime,
	`dataConclusao` datetime,
	`status` enum('planejada','em_andamento','concluida','cancelada') NOT NULL DEFAULT 'planejada',
	`custoEstimado` varchar(50),
	`custoReal` varchar(50),
	`observacoes` text,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `manutencoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ocorrencias` (
	`id` int AUTO_INCREMENT NOT NULL,
	`barragemId` int NOT NULL,
	`estruturaId` int,
	`usuarioRegistroId` varchar(64) NOT NULL,
	`dataHoraRegistro` datetime NOT NULL,
	`estrutura` varchar(255) NOT NULL,
	`relato` text NOT NULL,
	`fotos` text,
	`severidade` enum('baixa','media','alta','critica'),
	`tipo` varchar(100),
	`status` enum('pendente','em_analise','em_acao','concluida','cancelada') NOT NULL DEFAULT 'pendente',
	`usuarioAvaliacaoId` varchar(64),
	`dataAvaliacao` datetime,
	`comentariosAvaliacao` text,
	`dataConclusao` datetime,
	`comentariosConclusao` text,
	`latitude` varchar(50),
	`longitude` varchar(50),
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ocorrencias_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `perguntasChecklist` (
	`id` int AUTO_INCREMENT NOT NULL,
	`barragemId` int,
	`categoria` varchar(100) NOT NULL,
	`pergunta` text NOT NULL,
	`ordem` int NOT NULL,
	`ativo` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `perguntasChecklist_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `relatorios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`barragemId` int NOT NULL,
	`usuarioId` varchar(64) NOT NULL,
	`tipo` varchar(100) NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`checklistId` int,
	`arquivoUrl` varchar(500),
	`formato` varchar(20),
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `relatorios_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `respostasChecklist` (
	`id` int AUTO_INCREMENT NOT NULL,
	`checklistId` int NOT NULL,
	`perguntaId` int NOT NULL,
	`resposta` enum('NO','PV','PC','AM','DM','DS') NOT NULL,
	`situacaoAnterior` enum('NO','PV','PC','AM','DM','DS'),
	`comentario` text,
	`fotos` text,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `respostasChecklist_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('admin','gestor','consultor','inspetor','leiturista','visualizador') NOT NULL DEFAULT 'visualizador';--> statement-breakpoint
ALTER TABLE `users` ADD `ativo` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `alertas` ADD CONSTRAINT `alertas_barragemId_barragens_id_fk` FOREIGN KEY (`barragemId`) REFERENCES `barragens`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `alertas` ADD CONSTRAINT `alertas_instrumentoId_instrumentos_id_fk` FOREIGN KEY (`instrumentoId`) REFERENCES `instrumentos`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `alertas` ADD CONSTRAINT `alertas_leituraId_leituras_id_fk` FOREIGN KEY (`leituraId`) REFERENCES `leituras`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `alertas` ADD CONSTRAINT `alertas_ocorrenciaId_ocorrencias_id_fk` FOREIGN KEY (`ocorrenciaId`) REFERENCES `ocorrencias`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `auditoria` ADD CONSTRAINT `auditoria_usuarioId_users_id_fk` FOREIGN KEY (`usuarioId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `checklists` ADD CONSTRAINT `checklists_barragemId_barragens_id_fk` FOREIGN KEY (`barragemId`) REFERENCES `barragens`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `checklists` ADD CONSTRAINT `checklists_usuarioId_users_id_fk` FOREIGN KEY (`usuarioId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `checklists` ADD CONSTRAINT `checklists_consultorId_users_id_fk` FOREIGN KEY (`consultorId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `documentos` ADD CONSTRAINT `documentos_barragemId_barragens_id_fk` FOREIGN KEY (`barragemId`) REFERENCES `barragens`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `documentos` ADD CONSTRAINT `documentos_usuarioId_users_id_fk` FOREIGN KEY (`usuarioId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `estruturas` ADD CONSTRAINT `estruturas_barragemId_barragens_id_fk` FOREIGN KEY (`barragemId`) REFERENCES `barragens`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `hidrometria` ADD CONSTRAINT `hidrometria_barragemId_barragens_id_fk` FOREIGN KEY (`barragemId`) REFERENCES `barragens`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `hidrometria` ADD CONSTRAINT `hidrometria_usuarioId_users_id_fk` FOREIGN KEY (`usuarioId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `instrumentos` ADD CONSTRAINT `instrumentos_barragemId_barragens_id_fk` FOREIGN KEY (`barragemId`) REFERENCES `barragens`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `instrumentos` ADD CONSTRAINT `instrumentos_estruturaId_estruturas_id_fk` FOREIGN KEY (`estruturaId`) REFERENCES `estruturas`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `leituras` ADD CONSTRAINT `leituras_instrumentoId_instrumentos_id_fk` FOREIGN KEY (`instrumentoId`) REFERENCES `instrumentos`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `leituras` ADD CONSTRAINT `leituras_usuarioId_users_id_fk` FOREIGN KEY (`usuarioId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `manutencoes` ADD CONSTRAINT `manutencoes_barragemId_barragens_id_fk` FOREIGN KEY (`barragemId`) REFERENCES `barragens`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `manutencoes` ADD CONSTRAINT `manutencoes_estruturaId_estruturas_id_fk` FOREIGN KEY (`estruturaId`) REFERENCES `estruturas`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `manutencoes` ADD CONSTRAINT `manutencoes_ocorrenciaId_ocorrencias_id_fk` FOREIGN KEY (`ocorrenciaId`) REFERENCES `ocorrencias`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ocorrencias` ADD CONSTRAINT `ocorrencias_barragemId_barragens_id_fk` FOREIGN KEY (`barragemId`) REFERENCES `barragens`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ocorrencias` ADD CONSTRAINT `ocorrencias_estruturaId_estruturas_id_fk` FOREIGN KEY (`estruturaId`) REFERENCES `estruturas`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ocorrencias` ADD CONSTRAINT `ocorrencias_usuarioRegistroId_users_id_fk` FOREIGN KEY (`usuarioRegistroId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ocorrencias` ADD CONSTRAINT `ocorrencias_usuarioAvaliacaoId_users_id_fk` FOREIGN KEY (`usuarioAvaliacaoId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `perguntasChecklist` ADD CONSTRAINT `perguntasChecklist_barragemId_barragens_id_fk` FOREIGN KEY (`barragemId`) REFERENCES `barragens`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `relatorios` ADD CONSTRAINT `relatorios_barragemId_barragens_id_fk` FOREIGN KEY (`barragemId`) REFERENCES `barragens`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `relatorios` ADD CONSTRAINT `relatorios_usuarioId_users_id_fk` FOREIGN KEY (`usuarioId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `relatorios` ADD CONSTRAINT `relatorios_checklistId_checklists_id_fk` FOREIGN KEY (`checklistId`) REFERENCES `checklists`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `respostasChecklist` ADD CONSTRAINT `respostasChecklist_checklistId_checklists_id_fk` FOREIGN KEY (`checklistId`) REFERENCES `checklists`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `respostasChecklist` ADD CONSTRAINT `respostasChecklist_perguntaId_perguntasChecklist_id_fk` FOREIGN KEY (`perguntaId`) REFERENCES `perguntasChecklist`(`id`) ON DELETE no action ON UPDATE no action;