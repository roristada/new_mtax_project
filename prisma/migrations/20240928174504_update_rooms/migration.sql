/*
  Warnings:

  - A unique constraint covering the columns `[customerId]` on the table `Room` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Room_customerId_key` ON `Room`(`customerId`);
