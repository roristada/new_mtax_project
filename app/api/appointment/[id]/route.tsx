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
        subject: "Mtax Online Accounting : ยกเลิกการนัดหมาย",
        html: `
          <div style="font-family: 'Sarabun', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #d32f2f;">ยกเลิกการนัดหมาย</h2>
            <p>เรียน คุณ${name},</p>
            <p>ทางเราขออภัยที่ต้องแจ้งให้ทราบว่าการนัดหมายของคุณได้ถูกยกเลิก</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #444; margin-top: 0;">รายละเอียดการนัดหมาย:</h3>
              <p><strong>บริษัท:</strong> ${company}</p>
              <p><strong>วันที่:</strong> ${formattedDate}</p>
              <p><strong>เวลา:</strong> ${startTime} - ${endTime}</p>
            </div>
            
            <p>หากคุณมีข้อสงสัยหรือต้องการสอบถามข้อมูลเพิ่มเติม กรุณาติดต่อเราตามช่องทางด้านล่าง</p>
            
            <div style="background-color: #e8f4f8; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h4 style="color: #2c3e50; margin-top: 0;">ช่องทางการติดต่อ</h4>
              <p style="color: #34495e; margin: 5px 0;">
                <strong>โทรศัพท์:</strong> 02-950-0525 , 089-113-8565<br>
                <strong>อีเมล:</strong> patinya@mtax.co.th , mtax@outlook.co.th<br>
                <strong>Line Official:</strong> @Mtax
              </p>
            </div>

            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 12px;">ขอแสดงความนับถือ<br>MTax Online Accounting<br>Payroll Outsourcing</p>
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
          <div style="font-family: 'Sarabun', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #d32f2f;">ยกเลิกการนัดหมาย</h2>
            <p>เรียน คุณ${appointment.name},</p>
            <p>การนัดหมายของคุณได้ถูกยกเลิก</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #444; margin-top: 0;">รายละเอียดการนัดหมาย:</h3>
              <p><strong>วันที่:</strong> ${appointment.date.toLocaleDateString('th-TH')}</p>
              <p><strong>เวลา:</strong> ${appointment.startTime} - ${appointment.endTime}</p>
            </div>
            
            <p>หากคุณมีข้อสงสัย กรุณาติดต่อเราตามช่องทางด้านล่าง</p>
            
            <div style="background-color: #e8f4f8; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h4 style="color: #2c3e50; margin-top: 0;">ช่องทางการติดต่อ</h4>
              <p style="color: #34495e; margin: 5px 0;">
                <strong>โทรศัพท์:</strong> 02-950-0525 , 089-113-8565<br>
                <strong>อีเมล:</strong> patinya@mtax.co.th , mtax@outlook.co.th<br>
                <strong>Line Official:</strong> @Mtax
              </p>
            </div>

            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 12px;">ขอแสดงความนับถือ<br>MTax Online Accounting<br>Payroll Outsourcing</p>
            </div>
          </div>
        `
        : `
          <div style="font-family: 'Sarabun', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2e7d32;">ยืนยันการนัดหมาย</h2>
            <p>เรียน คุณ${appointment.name},</p>
            <p>การนัดหมายของคุณได้รับการยืนยันเรียบร้อยแล้ว</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #444; margin-top: 0;">รายละเอียดการนัดหมาย:</h3>
              <p><strong>วันที่:</strong> ${appointment.date.toLocaleDateString('th-TH')}</p>
              <p><strong>เวลา:</strong> ${appointment.startTime} - ${appointment.endTime}</p>
            </div>
            
            <p>ขอบคุณที่ไว้วางใจใช้บริการของเรา</p>
            
            <div style="background-color: #e8f4f8; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h4 style="color: #2c3e50; margin-top: 0;">ช่องทางการติดต่อ</h4>
              <p style="color: #34495e; margin: 5px 0;">
                <strong>โทรศัพท์:</strong> 02-950-0525 , 089-113-8565<br>
                <strong>อีเมล:</strong> patinya@mtax.co.th , mtax@outlook.co.th<br>
                <strong>Line Official:</strong> @Mtax
              </p>
            </div>

            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 12px;">ขอแสดงความนับถือ<br>MTax Online Accounting<br>Payroll Outsourcing</p>
            </div>
          </div>
        `;
    
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: appointment.email,
        subject: status === "canceled" ? "Mtax Online Accounting : ยกเลิกการนัดหมาย" : "Mtax Online Accounting : ยืนยันการนัดหมาย",
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

