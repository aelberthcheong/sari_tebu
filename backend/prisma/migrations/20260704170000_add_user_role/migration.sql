-- CreateEnum (MySQL tidak punya native ENUM type terpisah di Prisma, Prisma memetakannya jadi kolom ENUM langsung)
-- AlterTable
ALTER TABLE `users` ADD COLUMN `role` ENUM('OWNER', 'ADMIN', 'KASIR') NOT NULL DEFAULT 'KASIR';
