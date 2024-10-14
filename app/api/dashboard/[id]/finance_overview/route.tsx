import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

interface FinanceOverviewData {
  year: number;
  Income: number;
  Expense: number;
  Tax: number;
  netIncome: number;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const companyId = Number(params.id);

    const [uniqueYears, financeOverviewData] = await prisma.$transaction([
      prisma.income.findMany({
        where: { employee: { companyId } },
        select: { year: true },
        distinct: ["year"],
        orderBy: { year: "asc" },
      }),
      prisma.$queryRaw<FinanceOverviewData[]>`
        SELECT 
          i.year,
          SUM(i.salary + i.shiftAllowance + i.foodAllowance + i.overtime + i.diligence + i.beverage + i.commission + i.brokerFee + i.otherIncome + i.bonus) as Income,
          SUM(e.loan + e.salaryAdvance + e.commissionDeduction + e.otherDeductions) as Expense,
          SUM(t.employeeTax + t.socialSecurityEmployee + t.socialSecurityCompany + t.providentFund) as Tax,
          SUM(i.salary + i.shiftAllowance + i.foodAllowance + i.overtime + i.diligence + i.beverage + i.commission + i.brokerFee + i.otherIncome + i.bonus) - 
          SUM(e.loan + e.salaryAdvance + e.commissionDeduction + e.otherDeductions) - 
          SUM(t.employeeTax + t.socialSecurityEmployee + t.socialSecurityCompany + t.providentFund) as netIncome
        FROM Income i
        JOIN Employee emp ON i.employeeCode = emp.employeeCode AND i.companyId = emp.companyId AND i.year = emp.year
        LEFT JOIN Expense e ON i.employeeCode = e.employeeCode AND i.companyId = e.companyId AND i.year = e.year AND i.month = e.month
        LEFT JOIN Tax t ON i.employeeCode = t.employeeCode AND i.companyId = t.companyId AND i.year = t.year AND i.month = t.month
        WHERE emp.companyId = ${companyId}
        GROUP BY i.year
        ORDER BY i.year
      `,
    ]);

    const formattedData = financeOverviewData.map(data => ({
      year: data.year,
      Income: Number(data.Income),
      Expense: Number(data.Expense),
      Tax: Number(data.Tax),
      netIncome: Number(data.netIncome)
    }));

    return NextResponse.json(
      {
        message: "Finance overview data retrieved successfully",
        data: formattedData,
        uniqueYears: uniqueYears.map(y => y.year),
        count: formattedData.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch finance overview data" },
      { status: 500 }
    );
  }
}
