ALTER TABLE `hidrometria` MODIFY COLUMN `nivelMontante` varchar(50);--> statement-breakpoint
ALTER TABLE `hidrometria` ADD `dataLeitura` datetime NOT NULL;--> statement-breakpoint
ALTER TABLE `hidrometria` ADD `nivelReservatorio` varchar(50);--> statement-breakpoint
ALTER TABLE `hidrometria` ADD `vazaoAfluente` varchar(50);--> statement-breakpoint
ALTER TABLE `hidrometria` ADD `vazaoDefluente` varchar(50);--> statement-breakpoint
ALTER TABLE `hidrometria` ADD `vazaoVertedouro` varchar(50);--> statement-breakpoint
ALTER TABLE `hidrometria` ADD `volumeArmazenado` varchar(50);