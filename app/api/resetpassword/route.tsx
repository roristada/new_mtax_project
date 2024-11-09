import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import nodemailer from 'nodemailer';
import crypto from 'crypto';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // ค้นหา user จากอีเมล
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json(
        { error: "ไม่พบอีเมลนี้ในระบบ" },
        { status: 404 }
      );
    }

    // สร้าง token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 ชั่วโมง

    // บันทึก token
    await prisma.passwordResetToken.create({
      data: {
        token: resetToken,
        userId: user.id,
        expiresAt,
      },
    });

    // ส่งอีเมล
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/th/set-password?token=${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Mtax Online Accounting : รีเซ็ตรหัสผ่าน',
      html: `
        <div style="font-family: 'Prompt', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h1 style="color: #333333; text-align: center; margin-bottom: 30px;">รีเซ็ตรหัสผ่าน</h1>
            
            <p style="color: #666666; font-size: 16px; line-height: 1.6;">สวัสดีคุณ ${user.name},</p>
            
            <div style="margin: 20px 0;">
              <p style="color: #666666; font-size: 16px; line-height: 1.6;">
                คุณได้ขอรีเซ็ตรหัสผ่านสำหรับบัญชี:
              </p>
              <p style="color: #666666; font-size: 16px; line-height: 1.6;">
                อีเมล: <strong>${email}</strong>
              </p>
            </div>

            <p style="color: #666666; font-size: 16px; line-height: 1.6;">กรุณาคลิกที่ปุ่มด้านล่างเพื่อตั้งรหัสผ่านใหม่</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #4CAF50; 
                        color: white; 
                        padding: 12px 30px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        display: inline-block;
                        font-weight: bold;">
                ตั้งรหัสผ่านใหม่
              </a>
            </div>

            <p style="color: #ff0000; font-size: 14px; text-align: center;">
              * ลิงก์นี้จะหมดอายุใน 24 ชั่วโมง
            </p>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eeeeee; text-align: center; color: #999999; font-size: 14px;">
              <p>หากคุณไม่ได้เป็นผู้ขอรีเซ็ตรหัสผ่าน กรุณาละเว้นอีเมลฉบับนี้</p>
              <p>© ${new Date().getFullYear()} Mtax Online Accounting: Payroll Outsourcing.</p>
            </div>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { message: "ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในระบบ" },
      { status: 500 }
    );
  }
}