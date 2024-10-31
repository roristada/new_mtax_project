import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

async function verifyCaptcha(token: string) {
  const response = await fetch(
    `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
    {
      method: "POST",
    }
  );
  const data = await response.json();
  return data.success;
}

export async function POST(request: NextRequest) {
  try {
    const { name, company, email, telephone, startTime, note, endTime, date, captchaToken } =
      await request.json();

    const isCaptchaValid = await verifyCaptcha(captchaToken);
    if (!isCaptchaValid) {
      return NextResponse.json(
        { error: "Invalid captcha verification" },
        { status: 400 }
      );
    }

    const appointment = await prisma.appointment.create({
      data: {
        name,
        company,
        email,
        telephone,
        startTime,
        endTime,
        note,
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
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Appointment Confirmation",
        text: `Dear ${name},\n\nYour appointment has been successfully created.\n\nDetails:\nCompany: ${company}\nDate: ${formattedDate}\nStart Time: ${startTime}\nEnd Time: ${endTime}\n\nThank you.`,
      };

      await transporter.sendMail(mailOptions);
    }

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
