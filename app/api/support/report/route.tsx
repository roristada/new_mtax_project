import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, company, email, category, description , userId} = body;

    
    const report = await prisma.report.create({
      data: {
        userId: parseInt(userId),
        name,
        company,
        email,
        category,
        description,
        status: "pending",
        
      },
    });

    return NextResponse.json({ message: "Report submitted successfully", report });
  } catch (error) {
    console.error("Error submitting report:", error);
    return NextResponse.json({ message: "Error submitting report" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const reports = await prisma.report.findMany();
    return NextResponse.json({ message: "OK", data: reports });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json({ message: "Error fetching reports" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, problemReport } = body;

    const updatedReport = await prisma.report.update({
      where: { id },
      data: {
        problem_report: problemReport,
        status: "resolved", 
      },
    });

    return NextResponse.json({ message: "Report updated successfully", updatedReport });
  } catch (error) {
    console.error("Error updating report:", error);
    return NextResponse.json({ message: "Error updating report" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json(); 

    const deletedReport = await prisma.report.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Report deleted successfully", deletedReport });
  } catch (error) {
    console.error("Error deleting report:", error);
    return NextResponse.json({ message: "Error deleting report" }, { status: 500 });
  }
}