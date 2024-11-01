import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const companyId = params.id;
    //console.log(companyId)

    try {
        const employees = await prisma.employee.findMany({
            where: {
                companyId: parseInt(companyId)
            }
        });
        
        return NextResponse.json({ message: "OK", data: employees });
    } catch (error) {
        console.error("Error fetching employees:", error);
        return NextResponse.json({ message: "Error", error: "Failed to fetch employees" }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}

export async function generateStaticParams() {
  // Fetch all unique company IDs that you want to pre-render
  const companies = await prisma.employee.findMany({
    select: { companyId: true },
    distinct: ['companyId'], // Ensure you get unique company IDs
  });

  // Return an array of params objects
  return companies.map(company => ({
    id: company.companyId.toString(), // Convert the ID to a string if necessary
  }));
}