/*
  Warnings:

  - You are about to drop the column `is_password_verified` on the `account_deletion_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `is_email_verified` on the `email_address_update_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `is_email_verified` on the `password_reset_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `is_password_verified` on the `password_update_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `is_email_verified` on the `signup_sessions` table. All the data in the column will be lost.
  - You are about to alter the column `password_hash` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Blob` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `account_deletion_sessions` DROP COLUMN `is_password_verified`,
    ADD COLUMN `password_verified_at` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `email_address_update_sessions` DROP COLUMN `is_email_verified`,
    ADD COLUMN `email_verified_at` DATETIME(3) NULL,
    MODIFY `email_code_hash` BLOB NOT NULL;

-- AlterTable
ALTER TABLE `password_reset_sessions` DROP COLUMN `is_email_verified`,
    ADD COLUMN `email_verified_at` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `password_update_sessions` DROP COLUMN `is_password_verified`,
    ADD COLUMN `password_verified_at` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `signup_sessions` DROP COLUMN `is_email_verified`,
    ADD COLUMN `email_verified_at` DATETIME(3) NULL,
    MODIFY `email_code_hash` BLOB NOT NULL;

-- AlterTable
ALTER TABLE `users` MODIFY `password_hash` VARCHAR(191) NOT NULL;
