import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface Employee {
  name: string;
  totalCommission?: number;
  totalDiligence?: number;
}

interface CommissionRange {
  min: number;
  max: number;
  count: number;
  employees: Employee[];
  range?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get("year");

  try {
    let targetYear: number;

    if (!year) {
      // If no year is provided, get the latest year
      const latestYear = await prisma.employee.findFirst({
        select: { year: true },
        orderBy: { year: 'desc' },
      });
      targetYear = latestYear?.year || new Date().getFullYear();
    } else {
      targetYear = parseInt(year);
    }

    // Fetch data for the target year
    const employees = await prisma.employee.findMany({
      where: { year: targetYear },
      include: {
        incomes: {
          where: { year: targetYear },
          select: {
            commission: true,
            diligence: true,
          },
        },
      },
    });

    // Process the data to create commission and diligence ranges
    const commissionRanges = processRanges(employees, 'commission');
    const diligenceRanges = processRanges(employees, 'diligence');

    // Get all unique years
    const allYears = await prisma.employee.findMany({
      select: { year: true },
      distinct: ['year'],
      orderBy: { year: 'desc' },
    });

    return NextResponse.json({
      year: targetYear,
      commissionRanges,
      diligenceRanges,
      years: allYears.map(y => y.year),
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "An error occurred while fetching data" },
      { status: 500 }
    );
  }
}

function processRanges(employees: any[], field: 'commission' | 'diligence') {
    const ranges: CommissionRange[] = [
      { min: 0, max: 10000, count: 0, employees: [] },
      { min: 10001, max: 20000, count: 0, employees: [] },
      { min: 20001, max: 30000, count: 0, employees: [] },
      { min: 30001, max: 40000, count: 0, employees: [] },
      { min: 40001, max: Infinity, count: 0, employees: [] },
    ];
  
    employees.forEach(emp => {
      const total = emp.incomes.reduce((sum: number, income: any) => sum + (income[field] || 0), 0);
      const range = ranges.find(r => total >= r.min && total <= r.max);
      if (range) {
        range.count++;
        const employeeData: Employee = {
          name: `${emp.firstName} ${emp.lastName}`,
          totalCommission: field === 'commission' ? total : 0,
          totalDiligence: field === 'diligence' ? total : 0,
        };
        range.employees.push(employeeData);
      }
    });
  
    return ranges;
  }
