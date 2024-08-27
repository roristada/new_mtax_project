/*
  Warnings:

  - Added the required column `year` to the `Expense` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `Tax` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Expense` ADD COLUMN `month` INTEGER NULL,
    ADD COLUMN `year` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Tax` ADD COLUMN `month` INTEGER NULL,
    ADD COLUMN `year` INTEGER NOT NULL;
