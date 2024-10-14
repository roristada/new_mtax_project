import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

interface FinancialBreakdown {
  year: number;
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
  loan: number;
  salaryAdvance: number;
  commissionDeduction: number;
  otherDeductions: number;
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
    const companyId = Number(params.id);

    const financialBreakdown = await prisma.$queryRaw<FinancialBreakdown[]>`
      SELECT 
        i.year,
        SUM(i.salary) as salary,
        SUM(i.shiftAllowance) as shiftAllowance,
        SUM(i.foodAllowance) as foodAllowance,
        SUM(i.overtime) as overtime,
        SUM(i.diligence) as diligence,
        SUM(i.beverage) as beverage,
        SUM(i.commission) as commission,
        SUM(i.brokerFee) as brokerFee,
        SUM(i.otherIncome) as otherIncome,
        SUM(i.bonus) as bonus,
        SUM(e.loan) as loan,
        SUM(e.salaryAdvance) as salaryAdvance,
        SUM(e.commissionDeduction) as commissionDeduction,
        SUM(e.otherDeductions) as otherDeductions,
        SUM(t.employeeTax) as employeeTax,
        SUM(t.companyTax) as companyTax,
        SUM(t.socialSecurityEmployee) as socialSecurityEmployee,
        SUM(t.socialSecurityCompany) as socialSecurityCompany,
        SUM(t.providentFund) as providentFund
      FROM Income i
      JOIN Employee emp ON i.employeeCode = emp.employeeCode AND i.companyId = emp.companyId AND i.year = emp.year
      LEFT JOIN Expense e ON i.employeeCode = e.employeeCode AND i.companyId = e.companyId AND i.year = e.year AND i.month = e.month
      LEFT JOIN Tax t ON i.employeeCode = t.employeeCode AND i.companyId = t.companyId AND i.year = t.year AND i.month = t.month
      WHERE emp.companyId = ${companyId}
      GROUP BY i.year
      ORDER BY i.year
    `;

    const formattedBreakdown = financialBreakdown.map((data) => ({
      year: data.year,
      incomeBreakdown: {
        salary: Number(data.salary),
        shiftAllowance: Number(data.shiftAllowance),
        foodAllowance: Number(data.foodAllowance),
        overtime: Number(data.overtime),
        diligence: Number(data.diligence),
        beverage: Number(data.beverage),
        commission: Number(data.commission),
        brokerFee: Number(data.brokerFee),
        otherIncome: Number(data.otherIncome),
        bonus: Number(data.bonus),
      },
      expenseBreakdown: {
        loan: Number(data.loan),
        salaryAdvance: Number(data.salaryAdvance),
        commissionDeduction: Number(data.commissionDeduction),
        otherDeductions: Number(data.otherDeductions),
      },
      taxBreakdown: {
        employeeTax: Number(data.employeeTax),
        companyTax: Number(data.companyTax),
        socialSecurityEmployee: Number(data.socialSecurityEmployee),
        socialSecurityCompany: Number(data.socialSecurityCompany),
        providentFund: Number(data.providentFund),
      },
    }));

    return NextResponse.json(
      {
        message: "Financial breakdown retrieved successfully",
        data: formattedBreakdown,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch financial breakdown" },
      { status: 500 }
    );
  }
}