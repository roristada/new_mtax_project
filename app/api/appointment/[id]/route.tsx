import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  if (!id) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const appointment = await prisma.appointment.findUnique({
    where: { id: Number(id) },
  });

  if (!appointment) {
    return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
  }

  const email = appointment.email;
  const name = appointment.name;
  const company = appointment.company; // Assuming you have a company field
  const formattedDate = appointment.date.toLocaleDateString(); // Assuming date is a Date object
  const startTime = appointment.startTime; // Assuming this is a string or formatted time
  const endTime = appointment.endTime; // Assuming this is a string or formatted time

  if (appointment.status === "pending") {
    try {
      await prisma.appointment.delete({
        where: { id: Number(id) },
      });

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
        subject: "Appointment Cancellation Confirmation",
        text: `Dear ${name},\n\nWe regret to inform you that your appointment has been canceled.\n\nDetails:\nCompany: ${company}\nDate: ${formattedDate}\nStart Time: ${startTime}\nEnd Time: ${endTime}\n\nIf you have any questions, please contact us.\n\nThank you.`,
      };

      await transporter.sendMail(mailOptions);

      return NextResponse.json(
        { message: "Appointment successfully deleted and cancellation email sent" },
        { status: 200 }
      );
    } catch (error) {
      console.error("Failed to delete appointment or send email:", error);
      return NextResponse.json(
        { error: "Failed to delete appointment or send email" },
        { status: 500 }
      );
    }
  }

  try {
    await prisma.appointment.delete({
      where: { id: Number(id) },
    });
    return NextResponse.json(
      { message: "Appointment successfully deleted" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to delete appointment:", error);
    return NextResponse.json(
      { error: "Failed to delete appointment" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  if (!id) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    await prisma.appointment.update({
      where: { id: Number(id) },
      data: { status: "completed" },
    });
    return NextResponse.json(
      { message: "Appointment successfully updated" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to update appointment:", error);
    return NextResponse.json(
      { error: "Failed to update appointment" },
      { status: 500 }
    );
  }
}
