/*
  Warnings:

  - You are about to alter the column `publish_date` on the `Post` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `DateTime(3)`.

*/
-- AlterTable
ALTER TABLE `Post` MODIFY `publish_date` DATETIME(3) NOT NULL;
