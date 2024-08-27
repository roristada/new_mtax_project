-- AlterTable
ALTER TABLE `Employee` MODIFY `title` VARCHAR(191) NULL,
    MODIFY `gender` VARCHAR(191) NULL,
    MODIFY `department` VARCHAR(191) NULL,
    MODIFY `position` VARCHAR(191) NULL,
    MODIFY `startDate` DATETIME(3) NULL,
    MODIFY `citizenId` VARCHAR(191) NULL,
    MODIFY `currentSalary` DOUBLE NULL,
    MODIFY `age` INTEGER NULL,
    MODIFY `birthDate` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `Expense` MODIFY `loan` DOUBLE NULL,
    MODIFY `salaryAdvance` DOUBLE NULL,
    MODIFY `commissionDeduction` DOUBLE NULL,
    MODIFY `otherDeductions` DOUBLE NULL;

-- AlterTable
ALTER TABLE `Income` MODIFY `salary` DOUBLE NULL,
    MODIFY `shiftAllowance` DOUBLE NULL,
    MODIFY `foodAllowance` DOUBLE NULL,
    MODIFY `overtime` DOUBLE NULL,
    MODIFY `diligence` DOUBLE NULL,
    MODIFY `beverage` DOUBLE NULL,
    MODIFY `commission` DOUBLE NULL,
    MODIFY `brokerFee` DOUBLE NULL,
    MODIFY `otherIncome` DOUBLE NULL,
    MODIFY `bonus` DOUBLE NULL;

-- AlterTable
ALTER TABLE `Tax` MODIFY `employeeTax` DOUBLE NULL,
    MODIFY `companyTax` DOUBLE NULL,
    MODIFY `socialSecurityEmployee` DOUBLE NULL,
    MODIFY `socialSecurityCompany` DOUBLE NULL,
    MODIFY `providentFund` DOUBLE NULL;
