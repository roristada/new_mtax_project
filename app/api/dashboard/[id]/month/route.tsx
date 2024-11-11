import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient(); // Assuming your Prisma instance is set up in `lib/prisma.ts`

interface FinancialSummary {
  month: number;
  year: number;
  totalIncome: number;
  totalExpense: number;
  totalTax: number;
  netIncome: number;
  incomeBreakdown: Record<string, number>;
  expenseBreakdown: Record<string, number>;
  taxBreakdown: Record<string, number>;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get('companyId');
  const year = searchParams.get('year');

  if (!companyId || !year) {
    return NextResponse.json({ error: 'companyId and year are required' }, { status: 400 });
  }

  const incomeData = await prisma.income.findMany({
    where: {
      companyId: parseInt(companyId),
      year: parseInt(year),
    },
  });

  const expenseData = await prisma.expense.findMany({
    where: {
      companyId: parseInt(companyId),
      year: parseInt(year),
    },
  });

  const taxData = await prisma.tax.findMany({
    where: {
      companyId: parseInt(companyId),
      year: parseInt(year),
    },
  });

  
  const summaries = calculateMonthlyFinancialSummaries(incomeData, expenseData, taxData);

  return NextResponse.json(summaries);
}

// Utility function for calculating monthly financial summaries
function calculateMonthlyFinancialSummaries(income: any[], expense: any[], tax: any[]): FinancialSummary[] {
  const monthlyData: { [key: string]: FinancialSummary } = {};

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
      monthlyData[key].expenseBreakdown.commissionDeduction += exp.commissionDeduction || 0;
      monthlyData[key].expenseBreakdown.otherDeductions += exp.otherDeductions || 0;

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
      monthlyData[key].taxBreakdown.socialSecurityEmployee += t.socialSecurityEmployee || 0;
      monthlyData[key].taxBreakdown.socialSecurityCompany += t.socialSecurityCompany || 0;
      monthlyData[key].taxBreakdown.providentFund += t.providentFund || 0;

      monthlyData[key].totalTax +=
        t.employeeTax +
        t.socialSecurityEmployee +
        t.socialSecurityCompany +
        t.providentFund;
    }
  });

  
  Object.values(monthlyData).forEach((data) => {
    data.netIncome = data.totalIncome - data.totalExpense - data.totalTax;
  });

  return Object.values(monthlyData);
}
