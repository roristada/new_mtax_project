/*
  Warnings:

  - You are about to drop the column `company` on the `User` table. All the data in the column will be lost.
  - Added the required column `companyId` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Employee` ADD COLUMN `companyId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `company`,
    ADD COLUMN `companyId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Employee` ADD CONSTRAINT `Employee_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
