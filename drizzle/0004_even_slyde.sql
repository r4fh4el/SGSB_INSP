ALTER TABLE `ocorrencias` MODIFY COLUMN `status` enum('aberta','em_analise','em_tratamento','resolvida','fechada','pendente','em_acao','concluida','cancelada') NOT NULL DEFAULT 'pendente';--> statement-breakpoint
ALTER TABLE `ocorrencias` ADD `titulo` varchar(255);--> statement-breakpoint
ALTER TABLE `ocorrencias` ADD `descricao` text;--> statement-breakpoint
ALTER TABLE `ocorrencias` ADD `dataOcorrencia` datetime;--> statement-breakpoint
ALTER TABLE `ocorrencias` ADD `localOcorrencia` varchar(255);--> statement-breakpoint
ALTER TABLE `ocorrencias` ADD `acaoImediata` text;--> statement-breakpoint
ALTER TABLE `ocorrencias` ADD `responsavel` varchar(255);--> statement-breakpoint
ALTER TABLE `ocorrencias` ADD `categoria` varchar(100);