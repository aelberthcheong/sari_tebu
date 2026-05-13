/*
  Warnings:

  - Added the required column `user_id` to the `authentications` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `authentications` ADD COLUMN `user_id` VARCHAR(32) NOT NULL;

-- CreateIndex
CREATE INDEX `authentications_user_id_idx` ON `authentications`(`user_id`);

-- AddForeignKey
ALTER TABLE `authentications` ADD CONSTRAINT `authentications_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
