/*
  Warnings:

  - You are about to drop the column `is_email_verified` on the `account_deletion_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `is_email_verified` on the `password_update_sessions` table. All the data in the column will be lost.
  - Added the required column `is_password_confirmed` to the `account_deletion_sessions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `is_password_confirmed` to the `password_update_sessions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `account_deletion_sessions` DROP COLUMN `is_email_verified`,
    ADD COLUMN `is_password_confirmed` BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE `password_update_sessions` DROP COLUMN `is_email_verified`,
    ADD COLUMN `is_password_confirmed` BOOLEAN NOT NULL;
