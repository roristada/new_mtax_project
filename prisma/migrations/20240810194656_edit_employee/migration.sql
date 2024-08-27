/*
  Warnings:

  - You are about to alter the column `currentSalary` on the `Employee` table. The data in that column could be lost. The data in that column will be cast from `Double` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `Employee` MODIFY `startDate` VARCHAR(191) NULL,
    MODIFY `endDate` VARCHAR(191) NULL,
    MODIFY `currentSalary` VARCHAR(191) NULL,
    MODIFY `age` VARCHAR(191) NULL,
    MODIFY `birthDate` VARCHAR(191) NULL;
