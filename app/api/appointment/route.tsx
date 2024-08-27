import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { name, company, email, telephone, startTime, endTime, date } = await request.json();

    const appointment = await prisma.appointment.create({
      data: {
        name,
        company,
        email,
        telephone,
        startTime,
        endTime,
        date: new Date(date),
        
      },
    });

    return NextResponse.json(
      {
        message: "Appointment successfully created",
        appointment,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error creating appointment:", error);
    return NextResponse.json(
      { error: "Failed to create appointment" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(request: NextRequest) {
  try {
    const appointments = await prisma.appointment.findMany();

    return NextResponse.json(
      {
        appointments,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}


