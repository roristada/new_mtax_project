import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

interface TimeSlot {
  date: string;
  startTime: string;
  endTime: string;
}

interface AppointmentData {
  name: string;
  company: string;
  email: string;
  telephone: string;
  timeSlots: TimeSlot[];
  note: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: AppointmentData = await request.json();

    const { name, company, email, telephone, timeSlots, note } = body;

    // Log the received data to ensure correctness
    console.log("Received appointment data:", {
      name,
      company,
      email,
      telephone,
      timeSlots,
      note,
    });

    // Map over timeSlots and create each appointment
    const appointmentPromises = timeSlots.map(async (slot: TimeSlot) => {
      try {
        return await prisma.appointment.create({
          data: {
            name,
            company,
            email,
            telephone,
            startTime: slot.startTime,
            endTime: slot.endTime,
            date: new Date(slot.date),
            status: "pending",
          },
        });
      } catch (err) {
        console.error("Failed to create appointment for slot:", slot, err);
        throw err; // rethrow to catch in the main block
      }
    });

    
    

    return NextResponse.json(
      {
        message: "Appointments successfully created",
        data:appointmentPromises
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error creating appointments:", error);
    return NextResponse.json(
      { error: "Failed to create appointments" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}


