import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

export async function GET(req: Request ,{ params }: { params: { id: string } }) {
  const id = params.id;

  if (!id) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  try {
    const appointment = await prisma.appointment.findUnique({
    where: { id: Number(id) },
  });

  if (!appointment) {
    return NextResponse.json(
      { error: "Appointment not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(appointment);
  }catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch appointment" }, { status: 500 });
  }
  
}


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
    return NextResponse.json(
      { error: "Appointment not found" },
      { status: 404 }
    );
  }

  const email = appointment.email;
  const name = appointment.name;
  const company = appointment.company; 
  const formattedDate = appointment.date.toLocaleDateString(); 
  const startTime = appointment.startTime; 
  const endTime = appointment.endTime; 

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
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333;">Appointment Cancellation</h2>
            <p>Dear ${name},</p>
            <p>We regret to inform you that your appointment has been canceled.</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #444; margin-top: 0;">Appointment Details:</h3>
              <p><strong>Company:</strong> ${company}</p>
              <p><strong>Date:</strong> ${formattedDate}</p>
              <p><strong>Time:</strong> ${startTime} - ${endTime}</p>
            </div>
            
            <p>If you have any questions, please don't hesitate to contact us.</p>
            <p>Thank you for your understanding.</p>
            
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 12px;">Best regards,<br>MTax Online Accounting<br>Payroll Outsourcing</p>
            </div>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);

      return NextResponse.json(
        {
          message:
            "Appointment successfully deleted and cancellation email sent",
        },
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

  const { status } = await req.json(); 

  if (!["completed", "canceled", "confirmed"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  try {
    const appointment = await prisma.appointment.update({
      where: { id: Number(id) },
      data: { status },
    });
    
    if (status === "canceled" || status === "confirmed") {
      
      const transporter = nodemailer.createTransport({
        service: "gmail", 
        auth: {
          user: process.env.EMAIL_USER, 
          pass: process.env.EMAIL_PASS, 
        },
      });
    
      const emailContent = status === "canceled" 
        ? `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #d32f2f;">Appointment Canceled</h2>
            <p>Dear ${appointment.name},</p>
            <p>Your appointment has been canceled.</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #444; margin-top: 0;">Appointment Details:</h3>
              <p><strong>Date:</strong> ${appointment.date.toLocaleDateString()}</p>
              <p><strong>Time:</strong> ${appointment.startTime} - ${appointment.endTime}</p>
            </div>
            
            <p>Please contact us if you need further assistance.</p>
            
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 12px;">Best regards,<br>MTax Online Accounting<br>Payroll Outsourcing</p>
            </div>
          </div>
        `
        : `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2e7d32;">Appointment Confirmed</h2>
            <p>Dear ${appointment.name},</p>
            <p>Your appointment has been confirmed.</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #444; margin-top: 0;">Appointment Details:</h3>
              <p><strong>Date:</strong> ${appointment.date.toLocaleDateString()}</p>
              <p><strong>Time:</strong> ${appointment.startTime} - ${appointment.endTime}</p>
            </div>
            
            <p>We look forward to seeing you!</p>
            
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 12px;">Best regards,<br>MTax Online Accounting<br>Payroll Outsourcing</p>
            </div>
          </div>
        `;
    
      const mailOptions = {
        from: process.env.EMAIL_USER, 
        to: appointment.email, 
        subject: status === "canceled" ? "Appointment Canceled" : "Appointment Confirmed",
        html: emailContent,
      };
    
      if (mailOptions) {
        // Send email
        await transporter.sendMail(mailOptions);
      }
    }

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

