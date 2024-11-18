import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get("year");
  const companyId = searchParams.get("companyId");
  console.log("check" ,year)

  interface Employee {
    name: string;
    totalCommission: number;
    totalDiligence: number;
  }

  interface CommissionRange {
    min: number;
    max: number;
    count: number;
    employees: Employee[];
  }

  interface DiligenceRange {
    min: number;
    max: number;
    count: number;
    employees: Employee[];
  }

  try {
    // Fetch employee data and commission from the database
    const employees = await prisma.employee.findMany({
      where: { year: Number(year), companyId: Number(companyId) },
      include: {
        incomes: {
          where: { year: Number(year), companyId: Number(companyId) },
          select: {
            commission: true,
            diligence: true,
          },
        },
      },
    });

    // Calculate total commission and diligence of employees for the specified year
    const results = employees.map((employee) => {
      const totalCommission = employee.incomes.reduce(
        (sum, income) => sum + (income.commission || 0),
        0
      );

      const totalDiligence = employee.incomes.reduce(
        (sum, income) => sum + (income.diligence || 0),
        0
      );

      return {
        employeeCode: employee.employeeCode,
        firstName: employee.firstName,
        lastName: employee.lastName,
        totalCommission,
        totalDiligence,
      };
    });

    // Define specific ranges for totalCommission
    const commissionRanges: CommissionRange[] = [
      { min: 0, max: 10000, count: 0, employees: [] },
      { min: 10001, max: 20000, count: 0, employees: [] },
      { min: 20001, max: 30000, count: 0, employees: [] },
      { min: 30001, max: 40000, count: 0, employees: [] },
      { min: 40001, max: Infinity, count: 0, employees: [] },
    ];

    // Define specific ranges for totalDiligence
    const diligenceRanges: DiligenceRange[] = [
      { min: 0, max: 10000, count: 0, employees: [] },
      { min: 10001, max: 20000, count: 0, employees: [] },
      { min: 20001, max: 30000, count: 0, employees: [] },
      { min: 30001, max: 40000, count: 0, employees: [] },
      { min: 40001, max: Infinity, count: 0, employees: [] },
    ];

    // Populate the ranges with employee names and their performance metrics
    results.forEach(emp => {
      // Find the commission range for the employee and add their performance metrics
      const commissionRange = commissionRanges.find(range => 
        emp.totalCommission >= range.min && emp.totalCommission <= range.max
      );
      if (commissionRange) {
        commissionRange.employees.push({
          name: `${emp.firstName} ${emp.lastName}`,
          totalCommission: emp.totalCommission,
          totalDiligence: emp.totalDiligence,
        });
        commissionRange.count++; // Increment count for this range
      }

      // Find the diligence range for the employee and add their performance metrics
      const diligenceRange = diligenceRanges.find(range => 
        emp.totalDiligence >= range.min && emp.totalDiligence <= range.max
      );
      if (diligenceRange) {
        diligenceRange.employees.push({
          name: `${emp.firstName} ${emp.lastName}`,
          totalCommission: emp.totalCommission,
          totalDiligence: emp.totalDiligence,
        });
        diligenceRange.count++; // Increment count for this range
      }
    });

    // Find the maximum total commission and total diligence
    const maxTotalCommission = Math.max(...results.map(emp => emp.totalCommission));
    const maxTotalDiligence = Math.max(...results.map(emp => emp.totalDiligence));

    // Find the employee with the highest commission
    const employeeWithMaxCommission = results.find(emp => emp.totalCommission === maxTotalCommission);
    
    // Find the employee with the highest diligence
    const employeeWithMaxDiligence = results.find(emp => emp.totalDiligence === maxTotalDiligence);

    return NextResponse.json({
      maxTotalCommission,
      maxTotalDiligence,
      employeeWithMaxCommission,  // Employee with the highest commission
      employeeWithMaxDiligence,   // Employee with the highest diligence
      commissionRanges,
      diligenceRanges,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "An error occurred while calculating commissions and diligence" },
      { status: 500 }
    );
  }
}
