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
}

interface EmployeeFinancialData {
  employee: any;
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
    // Find the most recent year
    const recentYearIncome = await prisma.income.findFirst({
      where: {
        employee: {
          companyId: Number(params.id),
        },
      },
      orderBy: {
        year: "desc",
      },
      select: {
        year: true,
      },
    });

    //console.log("year" ,recentYearIncome)

    const recentYearExpense = await prisma.expense.findFirst({
      where: {
        employee: {
          companyId: Number(params.id),
        },
      },
      orderBy: {
        year: "desc",
      },
      select: {
        year: true,
      },
    });

    const recentYearTax = await prisma.tax.findFirst({
      where: {
        employee: {
          companyId: Number(params.id),
        },
      },
      orderBy: {
        year: "desc",
      },
      select: {
        year: true,
      },
    });

    // Find the maximum year across all tables
    const recentYear = Math.max(
      recentYearIncome?.year || 0,
      recentYearExpense?.year || 0,
      recentYearTax?.year || 0
    );

    

    if (recentYear === 0) {
      return NextResponse.json(
        { error: "No financial data found for the company" },
        { status: 404 }
      );
    }

    // Fetch employees for the given company ID
    const data_employee = await prisma.employee.findMany({
      where: {
        companyId: Number(params.id),
        year: recentYear,
      },
    });

    const data_employee_details: EmployeeFinancialData[] = await Promise.all(
      data_employee.map(async (employee) => {
        const income = await prisma.income.findMany({
          where: {
            employeeCode: employee.employeeCode,
            year: recentYear,
            employee: {
              companyId: Number(params.id),
            }, // Filter by the most recent year
          },
        });

        const expense = await prisma.expense.findMany({
          where: {
            employeeCode: employee.employeeCode,
            year: recentYear,
            employee: {
              companyId: Number(params.id),
            }, // Filter by the most recent year
          },
        });

        const tax = await prisma.tax.findMany({
          where: {
            employeeCode: employee.employeeCode,
            year: recentYear,
            employee: {
              companyId: Number(params.id),
            }, // Filter by the most recent year
          },
        });

        const monthlySummaries = calculateMonthlyFinancialSummaries(
          income,
          expense,
          tax
        );
        const totalSummary = calculateTotalFinancialSummary(monthlySummaries);
        const incomeBreakdown = calculateIncomeBreakdown(income);
        const expenseBreakdown = calculateExpenseBreakdown(expense);
        const taxBreakdown = calculateTaxBreakdown(tax)
        return {
          employee,
          monthlySummaries,
          totalSummary,
          incomeBreakdown,
          expenseBreakdown,
          taxBreakdown
        };
      })
    );

    return NextResponse.json(
      {
        message: "Employee financial data retrieved successfully",
        data: data_employee_details,
        count: data_employee_details.length,
      },
      { status: 200 }
    );
  } catch (error) {
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
      };
    }
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

  //console.log('Monthly Data after income calculation:', monthlyData);

  expense.forEach((exp) => {
    const key = `${exp.year}-${exp.month}`;
    if (monthlyData[key]) {
      monthlyData[key].totalExpense +=
        exp.loan +
        exp.salaryAdvance +
        exp.commissionDeduction +
        exp.otherDeductions;
    } else {
      //console.log(`No matching income record found for key ${key}`);
    }
  });

  tax.forEach((t) => {
    const key = `${t.year}-${t.month}`;
    if (monthlyData[key]) {
      monthlyData[key].totalTax +=
        t.employeeTax +
        t.socialSecurityEmployee +
        t.socialSecurityCompany +
        t.providentFund;
    } else {
      //console.log(`No matching income record found for key ${key}`);
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

function calculateIncomeBreakdown(income: any[]): IncomeBreakdown {
  // Initialize the breakdown with all values set to 0
  const incomeBreakdown: IncomeBreakdown = {
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

  // Iterate over the income data and sum up each category
  income.forEach((inc) => {
    incomeBreakdown.salary += inc.salary || 0;
    incomeBreakdown.shiftAllowance += inc.shiftAllowance || 0;
    incomeBreakdown.foodAllowance += inc.foodAllowance || 0;
    incomeBreakdown.overtime += inc.overtime || 0;
    incomeBreakdown.diligence += inc.diligence || 0;
    incomeBreakdown.beverage += inc.beverage || 0;
    incomeBreakdown.commission += inc.commission || 0;
    incomeBreakdown.brokerFee += inc.brokerFee || 0;
    incomeBreakdown.otherIncome += inc.otherIncome || 0;
    incomeBreakdown.bonus += inc.bonus || 0;
  });

  return incomeBreakdown;
}

function calculateExpenseBreakdown(expense: any[]): ExpenseBreakdown {
  // Initialize the breakdown with all values set to 0
  const expenseBreakdown: ExpenseBreakdown = {
    loan: 0,
    salaryAdvance: 0,
    commissionDeduction: 0,
    otherDeductions: 0,
  };

  // Iterate over the income data and sum up each category
  expense.forEach((exp) => {
    expenseBreakdown.loan += exp.loan || 0;
    expenseBreakdown.salaryAdvance += exp.salaryAdvance || 0;
    expenseBreakdown.commissionDeduction += exp.commissionDeduction || 0;
    expenseBreakdown.otherDeductions += exp.otherDeductions || 0;
  });

  return expenseBreakdown;
}

function calculateTaxBreakdown(tax: any[]): TaxBreakdown {
  // Initialize the breakdown with all values set to 0
  const taxBreakdown: TaxBreakdown = {
    employeeTax:0,
  companyTax:0,
  socialSecurityEmployee:0,
  socialSecurityCompany:0,
  providentFund:0
  };

 
  tax.forEach((tax) => {
    taxBreakdown.employeeTax += tax.loan || 0;
    taxBreakdown.companyTax += tax.salaryAdvance || 0;
    taxBreakdown.socialSecurityEmployee += tax.commissionDeduction || 0;
    taxBreakdown.socialSecurityCompany += tax.otherDeductions || 0;
    taxBreakdown.providentFund += tax.providentFund || 0;
  });

  return taxBreakdown;
}