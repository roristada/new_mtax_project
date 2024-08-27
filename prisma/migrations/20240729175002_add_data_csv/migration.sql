-- CreateTable
CREATE TABLE `Employee` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employeeCode` VARCHAR(191) NOT NULL,
    `cardCode` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `gender` VARCHAR(191) NOT NULL,
    `department` VARCHAR(191) NOT NULL,
    `position` VARCHAR(191) NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NULL,
    `citizenId` VARCHAR(191) NOT NULL,
    `currentSalary` DOUBLE NOT NULL,
    `age` INTEGER NOT NULL,
    `birthDate` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Income` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employeeId` INTEGER NOT NULL,
    `month` INTEGER NOT NULL,
    `year` INTEGER NOT NULL,
    `salary` DOUBLE NOT NULL,
    `shiftAllowance` DOUBLE NOT NULL,
    `foodAllowance` DOUBLE NOT NULL,
    `overtime` DOUBLE NOT NULL,
    `diligence` DOUBLE NOT NULL,
    `beverage` DOUBLE NOT NULL,
    `commission` DOUBLE NOT NULL,
    `brokerFee` DOUBLE NOT NULL,
    `otherIncome` DOUBLE NOT NULL,
    `bonus` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Expense` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employeeId` INTEGER NOT NULL,
    `loan` DOUBLE NOT NULL,
    `salaryAdvance` DOUBLE NOT NULL,
    `commissionDeduction` DOUBLE NOT NULL,
    `otherDeductions` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tax` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employeeId` INTEGER NOT NULL,
    `employeeTax` DOUBLE NOT NULL,
    `companyTax` DOUBLE NOT NULL,
    `socialSecurityEmployee` DOUBLE NOT NULL,
    `socialSecurityCompany` DOUBLE NOT NULL,
    `providentFund` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Income` ADD CONSTRAINT `Income_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Expense` ADD CONSTRAINT `Expense_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Tax` ADD CONSTRAINT `Tax_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
