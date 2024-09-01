import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

interface MonthlyFinancialSummary {
  month: number;
  year: number;
  totalIncome: number;
  totalExpense: number;
  totalTax: number;
  netIncome: number;
  incomeBreakdown: IncomeBreakdown;
  expenseBreakdown: ExpenseBreakdown;
  taxBreakdown: TaxBreakdown;
}

interface AggregatedData {
  [key: string]: {
    month: number;
    year: number;
    totalIncome: number;
    totalExpense: number;
    totalTax: number;
    netIncome: number;
  };
}

interface EmployeeFinancialData {
  monthlySummaries: MonthlyFinancialSummary[];
  totalSummary: {
    totalIncome: number;
    totalExpense: number;
    totalTax: number;
    netIncome: number;
  };
}

interface IncomeBreakdown {
  salary: number;
  shiftAllowance: number;
  foodAllowance: number;
  overtime: number;
  diligence: number;
  beverage: number;
  commission: number;
  brokerFee: number;
  otherIncome: number;
  bonus: number;
}

interface ExpenseBreakdown {
  loan: number;
  salaryAdvance: number;
  commissionDeduction: number;
  otherDeductions: number;
}

interface TaxBreakdown {
  employeeTax: number;
  companyTax: number;
  socialSecurityEmployee: number;
  socialSecurityCompany: number;
  providentFund: number;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const employees = await prisma.employee.findMany({
      where: {
        companyId: Number(params.id),
      },
    });

    const uniqueYears = await prisma.income.findMany({
      where: {
        employee: {
          companyId: Number(params.id),
        },
      },
      select: {
        year: true,
      },
      distinct: ["year"],
    });

    const data_employee_details: EmployeeFinancialData[] = await Promise.all(
      employees.map(async (employee) => {
        const income = await prisma.income.findMany({
          where: {
            employeeCode: employee.employeeCode,
            employee: {
              companyId: Number(params.id),
            },
          },
        });

        const expense = await prisma.expense.findMany({
          where: {
            employeeCode: employee.employeeCode,
            employee: {
              companyId: Number(params.id),
            },
          },
        });

        const tax = await prisma.tax.findMany({
          where: {
            employeeCode: employee.employeeCode,
            employee: {
              companyId: Number(params.id),
            },
          },
        });

        const monthlySummaries = calculateMonthlyFinancialSummaries(
          income,
          expense,
          tax
        );
        const totalSummary = calculateTotalFinancialSummary(monthlySummaries);

        return {
          monthlySummaries,
          totalSummary,
        };
      })
    );

    const aggregatedYearlyData = uniqueYears.map((year) => {
      const yearlyIncomeBreakdown: IncomeBreakdown = {
        salary: 0,
        shiftAllowance: 0,
        foodAllowance: 0,
        overtime: 0,
        diligence: 0,
        beverage: 0,
        commission: 0,
        brokerFee: 0,
        otherIncome: 0,
        bonus: 0,
      };
      const yearlyExpenseBreakdown: ExpenseBreakdown = {
        loan: 0,
        salaryAdvance: 0,
        commissionDeduction: 0,
        otherDeductions: 0,
      };
      const yearlyTaxBreakdown: TaxBreakdown = {
        employeeTax: 0,
        companyTax: 0,
        socialSecurityEmployee: 0,
        socialSecurityCompany: 0,
        providentFund: 0,
      };

      let totalIncome = 0;
      let totalExpense = 0;
      let totalTax = 0;
      let netIncome = 0;

      data_employee_details.forEach(({ monthlySummaries }) => {
        monthlySummaries
          .filter((summary) => summary.year === year.year)
          .forEach((summary) => {
            totalIncome += summary.totalIncome;
            totalExpense += summary.totalExpense;
            totalTax += summary.totalTax;
            netIncome += summary.netIncome;

            // Aggregate breakdowns
            Object.keys(yearlyIncomeBreakdown).forEach((key) => {
              yearlyIncomeBreakdown[key as keyof IncomeBreakdown] +=
                summary.incomeBreakdown[key as keyof IncomeBreakdown];
            });
            Object.keys(yearlyExpenseBreakdown).forEach((key) => {
              yearlyExpenseBreakdown[key as keyof ExpenseBreakdown] +=
                summary.expenseBreakdown[key as keyof ExpenseBreakdown];
            });
            Object.keys(yearlyTaxBreakdown).forEach((key) => {
              yearlyTaxBreakdown[key as keyof TaxBreakdown] +=
                summary.taxBreakdown[key as keyof TaxBreakdown];
            });
          });
      });

      return {
        year: year.year,
        Income:totalIncome,
        Expense:totalExpense,
        Tax:totalTax,
        netIncome,
        incomeBreakdown: yearlyIncomeBreakdown,
        expenseBreakdown: yearlyExpenseBreakdown,
        taxBreakdown: yearlyTaxBreakdown,
      };
    });

    return NextResponse.json(
      {
        message: "Employee financial data retrieved successfully",
        data: aggregatedYearlyData,
        uniqueYears: uniqueYears.map((y) => y.year),
        count: aggregatedYearlyData.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}

function calculateMonthlyFinancialSummaries(
  income: any[],
  expense: any[],
  tax: any[]
): MonthlyFinancialSummary[] {
  const monthlyData: { [key: string]: MonthlyFinancialSummary } = {};

  income.forEach((inc) => {
    const key = `${inc.year}-${inc.month}`;
    if (!monthlyData[key]) {
      monthlyData[key] = {
        month: inc.month,
        year: inc.year,
        totalIncome: 0,
        totalExpense: 0,
        totalTax: 0,
        netIncome: 0,
        incomeBreakdown: {
          salary: 0,
          shiftAllowance: 0,
          foodAllowance: 0,
          overtime: 0,
          diligence: 0,
          beverage: 0,
          commission: 0,
          brokerFee: 0,
          otherIncome: 0,
          bonus: 0,
        },
        expenseBreakdown: {
          loan: 0,
          salaryAdvance: 0,
          commissionDeduction: 0,
          otherDeductions: 0,
        },
        taxBreakdown: {
          employeeTax: 0,
          companyTax: 0,
          socialSecurityEmployee: 0,
          socialSecurityCompany: 0,
          providentFund: 0,
        },
      };
    }

    // Summing up the income breakdown
    monthlyData[key].incomeBreakdown.salary += inc.salary || 0;
    monthlyData[key].incomeBreakdown.shiftAllowance += inc.shiftAllowance || 0;
    monthlyData[key].incomeBreakdown.foodAllowance += inc.foodAllowance || 0;
    monthlyData[key].incomeBreakdown.overtime += inc.overtime || 0;
    monthlyData[key].incomeBreakdown.diligence += inc.diligence || 0;
    monthlyData[key].incomeBreakdown.beverage += inc.beverage || 0;
    monthlyData[key].incomeBreakdown.commission += inc.commission || 0;
    monthlyData[key].incomeBreakdown.brokerFee += inc.brokerFee || 0;
    monthlyData[key].incomeBreakdown.otherIncome += inc.otherIncome || 0;
    monthlyData[key].incomeBreakdown.bonus += inc.bonus || 0;

    monthlyData[key].totalIncome +=
      inc.salary +
      inc.shiftAllowance +
      inc.foodAllowance +
      inc.overtime +
      inc.diligence +
      inc.beverage +
      inc.commission +
      inc.brokerFee +
      inc.otherIncome +
      inc.bonus;
  });

  expense.forEach((exp) => {
    const key = `${exp.year}-${exp.month}`;
    if (monthlyData[key]) {
      monthlyData[key].expenseBreakdown.loan += exp.loan || 0;
      monthlyData[key].expenseBreakdown.salaryAdvance += exp.salaryAdvance || 0;
      monthlyData[key].expenseBreakdown.commissionDeduction +=
        exp.commissionDeduction || 0;
      monthlyData[key].expenseBreakdown.otherDeductions +=
        exp.otherDeductions || 0;

      monthlyData[key].totalExpense +=
        exp.loan +
        exp.salaryAdvance +
        exp.commissionDeduction +
        exp.otherDeductions;
    }
  });

  tax.forEach((t) => {
    const key = `${t.year}-${t.month}`;
    if (monthlyData[key]) {
      monthlyData[key].taxBreakdown.employeeTax += t.employeeTax || 0;
      monthlyData[key].taxBreakdown.companyTax += t.companyTax || 0;
      monthlyData[key].taxBreakdown.socialSecurityEmployee +=
        t.socialSecurityEmployee || 0;
      monthlyData[key].taxBreakdown.socialSecurityCompany +=
        t.socialSecurityCompany || 0;
      monthlyData[key].taxBreakdown.providentFund += t.providentFund || 0;

      monthlyData[key].totalTax +=
        t.employeeTax +
        t.socialSecurityEmployee +
        t.socialSecurityCompany +
        t.providentFund;
    }
  });

  // Calculate net income for each month
  Object.values(monthlyData).forEach((data) => {
    data.netIncome = data.totalIncome - data.totalExpense - data.totalTax;
  });

  return Object.values(monthlyData);
}

function calculateTotalFinancialSummary(
  monthlySummaries: MonthlyFinancialSummary[]
) {
  return monthlySummaries.reduce(
    (total, month) => {
      total.totalIncome += month.totalIncome;
      total.totalExpense += month.totalExpense;
      total.totalTax += month.totalTax;
      total.netIncome += month.netIncome;
      return total;
    },
    { totalIncome: 0, totalExpense: 0, totalTax: 0, netIncome: 0 }
  );
}
