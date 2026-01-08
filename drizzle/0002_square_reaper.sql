ALTER TABLE `instrumentos` ADD `limiteInferior` varchar(50);--> statement-breakpoint
ALTER TABLE `instrumentos` ADD `limiteSuperior` varchar(50);--> statement-breakpoint
ALTER TABLE `instrumentos` ADD `frequenciaLeitura` varchar(100);--> statement-breakpoint
ALTER TABLE `instrumentos` ADD `responsavel` varchar(255);--> statement-breakpoint
ALTER TABLE `instrumentos` ADD `status` enum('ativo','inativo','manutencao') DEFAULT 'ativo' NOT NULL;