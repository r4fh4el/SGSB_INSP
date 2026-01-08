ALTER TABLE `checklists` MODIFY COLUMN `tipo` enum('ISR','ISE','ISP','mensal','especial','emergencial') NOT NULL DEFAULT 'mensal';--> statement-breakpoint
ALTER TABLE `checklists` MODIFY COLUMN `status` enum('em_andamento','concluida','cancelada','concluido','aprovado') NOT NULL DEFAULT 'em_andamento';--> statement-breakpoint
ALTER TABLE `checklists` ADD `inspetor` varchar(255);--> statement-breakpoint
ALTER TABLE `checklists` ADD `climaCondicoes` varchar(255);