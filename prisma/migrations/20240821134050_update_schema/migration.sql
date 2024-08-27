/*
  Warnings:

  - The primary key for the `Employee` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `employeeId` on the `Expense` table. All the data in the column will be lost.
  - You are about to drop the column `employeeId` on the `Income` table. All the data in the column will be lost.
  - You are about to drop the column `employeeId` on the `Tax` table. All the data in the column will be lost.
  - Added the required column `companyId` to the `Expense` table without a default value. This is not possible if the table is not empty.
  - Added the required column `employeeCode` to the `Expense` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `Income` table without a default value. This is not possible if the table is not empty.
  - Added the required column `employeeCode` to the `Income` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `Tax` table without a default value. This is not possible if the table is not empty.
  - Added the required column `employeeCode` to the `Tax` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Expense` DROP FOREIGN KEY `Expense_employeeId_fkey`;

-- DropForeignKey
ALTER TABLE `Income` DROP FOREIGN KEY `Income_employeeId_fkey`;

-- DropForeignKey
ALTER TABLE `Tax` DROP FOREIGN KEY `Tax_employeeId_fkey`;

-- DropIndex
DROP INDEX `Employee_employeeCode_key` ON `Employee`;

-- AlterTable
ALTER TABLE `Employee` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    ADD PRIMARY KEY (`employeeCode`, `companyId`);

-- AlterTable
ALTER TABLE `Expense` DROP COLUMN `employeeId`,
    ADD COLUMN `companyId` INTEGER NOT NULL,
    ADD COLUMN `employeeCode` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Income` DROP COLUMN `employeeId`,
    ADD COLUMN `companyId` INTEGER NOT NULL,
    ADD COLUMN `employeeCode` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Tax` DROP COLUMN `employeeId`,
    ADD COLUMN `companyId` INTEGER NOT NULL,
    ADD COLUMN `employeeCode` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE INDEX `Expense_employeeCode_companyId_year_month_idx` ON `Expense`(`employeeCode`, `companyId`, `year`, `month`);

-- CreateIndex
CREATE INDEX `Income_employeeCode_companyId_year_month_idx` ON `Income`(`employeeCode`, `companyId`, `year`, `month`);

-- CreateIndex
CREATE INDEX `Tax_employeeCode_companyId_year_month_idx` ON `Tax`(`employeeCode`, `companyId`, `year`, `month`);

-- AddForeignKey
ALTER TABLE `Income` ADD CONSTRAINT `Income_employeeCode_companyId_fkey` FOREIGN KEY (`employeeCode`, `companyId`) REFERENCES `Employee`(`employeeCode`, `companyId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Expense` ADD CONSTRAINT `Expense_employeeCode_companyId_fkey` FOREIGN KEY (`employeeCode`, `companyId`) REFERENCES `Employee`(`employeeCode`, `companyId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Tax` ADD CONSTRAINT `Tax_employeeCode_companyId_fkey` FOREIGN KEY (`employeeCode`, `companyId`) REFERENCES `Employee`(`employeeCode`, `companyId`) ON DELETE RESTRICT ON UPDATE CASCADE;
