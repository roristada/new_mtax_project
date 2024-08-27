/*
  Warnings:

  - The primary key for the `Employee` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE `Expense` DROP FOREIGN KEY `Expense_employeeCode_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `Income` DROP FOREIGN KEY `Income_employeeCode_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `Tax` DROP FOREIGN KEY `Tax_employeeCode_companyId_fkey`;

-- AlterTable
ALTER TABLE `Employee` DROP PRIMARY KEY,
    ADD PRIMARY KEY (`employeeCode`, `companyId`, `year`);

-- AddForeignKey
ALTER TABLE `Income` ADD CONSTRAINT `Income_employeeCode_companyId_year_fkey` FOREIGN KEY (`employeeCode`, `companyId`, `year`) REFERENCES `Employee`(`employeeCode`, `companyId`, `year`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Expense` ADD CONSTRAINT `Expense_employeeCode_companyId_year_fkey` FOREIGN KEY (`employeeCode`, `companyId`, `year`) REFERENCES `Employee`(`employeeCode`, `companyId`, `year`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Tax` ADD CONSTRAINT `Tax_employeeCode_companyId_year_fkey` FOREIGN KEY (`employeeCode`, `companyId`, `year`) REFERENCES `Employee`(`employeeCode`, `companyId`, `year`) ON DELETE RESTRICT ON UPDATE CASCADE;
