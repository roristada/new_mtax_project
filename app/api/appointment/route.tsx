import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { name, company, email, telephone, startTime, endTime, date } =
      await request.json();

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
    const formattedDate = new Intl.DateTimeFormat("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "Asia/Bangkok",
    }).format(new Date(date));

    if (appointment) {
      const transporter = nodemailer.createTransport({
        service: "gmail", // or another email service
        auth: {
          user: process.env.EMAIL_USER, // your email address
          pass: process.env.EMAIL_PASS, // your email password or app-specific password
        },
      });

      // Define the email options
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Appointment Confirmation",
        text: `Dear ${name},\n\nYour appointment has been successfully created.\n\nDetails:\nCompany: ${company}\nDate: ${formattedDate}\nStart Time: ${startTime}\nEnd Time: ${endTime}\n\nThank you.`,
      };

      // Send the email
      await transporter.sendMail(mailOptions);
    }
    // Configure Nodemailer transport

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
