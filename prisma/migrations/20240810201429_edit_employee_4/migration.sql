/*
  Warnings:

  - You are about to alter the column `currentSalary` on the `Employee` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Double`.
  - You are about to alter the column `age` on the `Employee` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- AlterTable
ALTER TABLE `Employee` MODIFY `currentSalary` DOUBLE NULL,
    MODIFY `age` INTEGER NULL;

-- AlterTable
ALTER TABLE `Income` MODIFY `month` INTEGER NULL;
