import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const companyId = params.id;

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

