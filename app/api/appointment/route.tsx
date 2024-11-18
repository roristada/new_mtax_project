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
        subject: "Mtax Online Accounting : ได้รับคำขอการนัดหมายของคุณแล้ว",
        html: `
          <div style="font-family: 'Sarabun', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2c3e50;">ได้รับคำขอการนัดหมายแล้ว</h2>
            <p style="color: #34495e;">เรียน คุณ${name},</p>
            <p style="color: #34495e;">ขอบคุณที่ส่งคำขอนัดหมายมายังเรา ทางเจ้าหน้าที่จะตรวจสอบคำขอของคุณและติดต่อกลับเพื่อยืนยันการนัดหมาย</p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #2c3e50; margin-top: 0;">รายละเอียดการนัดหมาย</h3>
              <table style="width: 100%; color: #34495e;">
                <tr>
                  <td style="padding: 8px 0;"><strong>บริษัท:</strong></td>
                  <td>${company}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>วันที่:</strong></td>
                  <td>${formattedDate}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>เวลาเริ่ม:</strong></td>
                  <td>${startTime}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>เวลาสิ้นสุด:</strong></td>
                  <td>${endTime}</td>
                </tr>
                ${note ? `
                <tr>
                  <td style="padding: 8px 0;"><strong>หมายเหตุ:</strong></td>
                  <td>${note}</td>
                </tr>
                ` : ''}
              </table>
            </div>
            
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <p style="color: #856404; margin: 0;">
                <strong>หมายเหตุ:</strong> อีเมลนี้ยังไม่ใช่การยืนยันการนัดหมาย 
                ทางเจ้าหน้าที่จะตรวจสอบคำขอของคุณและติดต่อกลับเพื่อยืนยันการนัดหมายอีกครั้ง
              </p>
            </div>

            <p style="color: #34495e;">หากคุณมีคำถามเร่งด่วน กรุณาติดต่อเราโดยตรงตามช่องทางด้านล่างนี้</p>
            
            <div style="background-color: #e8f4f8; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h4 style="color: #2c3e50; margin-top: 0;">ช่องทางการติดต่อ</h4>
              <p style="color: #34495e; margin: 5px 0;">
                <strong>โทรศัพท์:</strong> 02-950-0525 , 089-113-8565<br>
                <strong>อีเมล:</strong> patinya@mtax.co.th , mtax@outlook.co.th<br>
                <strong>Line Official:</strong> @Mtax
              </p>
            </div>

            <hr style="border: 1px solid #eee; margin: 20px 0;">
            <p style="color: #666; font-size: 12px; text-align: center;">
              © 2024 Mtax Online Accounting. All rights reserved.
            </p>
          </div>
        `,
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
