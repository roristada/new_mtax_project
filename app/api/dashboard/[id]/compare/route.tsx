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
    // Fetch employees for the given company ID
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
      distinct: ['year'],
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

    // Aggregate data on the server
    const aggregatedData: AggregatedData = {};

    data_employee_details.forEach(({ monthlySummaries }) => {
      monthlySummaries.forEach((summary) => {
        const key = `${summary.year}-${summary.month}`;
        if (!aggregatedData[key]) {
          aggregatedData[key] = {
            month: summary.month,
            year: summary.year,
            totalIncome: 0,
            totalExpense: 0,
            totalTax: 0,
            netIncome: 0,
          };
        }
        aggregatedData[key].totalIncome += summary.totalIncome;
        aggregatedData[key].totalExpense += summary.totalExpense;
        aggregatedData[key].totalTax += summary.totalTax;
        aggregatedData[key].netIncome += summary.netIncome;
      });
    });

    // Prepare formatted data for the client
    const formattedChartData = Object.keys(aggregatedData).map((key) => ({
      month: new Date(
        aggregatedData[key].year,
        aggregatedData[key].month - 1
      ).toLocaleString("default", { month: "short" }),
      Income: aggregatedData[key].totalIncome,
      Expense: aggregatedData[key].totalExpense,
      Tax: aggregatedData[key].totalTax,
      netIncome: aggregatedData[key].netIncome,
      year: aggregatedData[key].year,
      monthIndex: aggregatedData[key].month - 1,
    }));

    return NextResponse.json(
      {
        message: "Employee financial data retrieved successfully",
        data: formattedChartData,
        uniqueYears: uniqueYears.map((y) => y.year),
        count: formattedChartData.length,
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

  expense.forEach((exp) => {
    const key = `${exp.year}-${exp.month}`;
    if (monthlyData[key]) {
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
