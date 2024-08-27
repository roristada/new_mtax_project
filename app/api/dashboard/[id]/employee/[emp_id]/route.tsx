import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(req: NextRequest, { params }: { params: { id: string, emp_id: string } }) {
    const empCode = params.emp_id; // Keep this as a string for employeeCode
    const companyId = parseInt(params.id); // Convert this to an integer for companyId
    console.log(empCode , companyId)

    const selectedYear = parseInt(req.nextUrl.searchParams.get('year') || `${new Date().getFullYear()}`);

    try {
        // Use findFirst since we're dealing with a composite key
        const employee = await prisma.employee.findFirst({
            where: {
                companyId: companyId,
                employeeCode: empCode,
                year: selectedYear,
            },
        });

        if (!employee) {
            return NextResponse.json({ message: "Not Found", error: "Employee not found" }, { status: 404 });
        }

        // Use employeeCode and companyId to fetch related data
        const incomes = await prisma.income.findMany({
            where: {
                employeeCode: empCode,
                companyId: companyId,
                year: selectedYear,
            },
        });

        const expenses = await prisma.expense.findMany({
            where: {
                employeeCode: empCode,
                companyId: companyId,
                year: selectedYear,
            },
        });

        const taxes = await prisma.tax.findMany({
            where: {
                employeeCode: empCode,
                companyId: companyId,
                year: selectedYear,
            },
        });

        // Construct the response with the fetched data
        const data = {
            ...employee,
            incomes,
            expenses,
            taxes,
        };

        console.log(data);

        return NextResponse.json({ message: "OK", data: data });
    } catch (error) {
        console.error("Error fetching employee details:", error);
        return NextResponse.json({ message: "Error", error: "Failed to fetch employee details" }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
