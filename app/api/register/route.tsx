import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import nodemailer from 'nodemailer';
import crypto from 'crypto';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const {name, company, email, address, telephone, role} = await request.json();
    
    // ตรวจสอบอีเมลซ้ำ
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "duplicate_email" },
        { status: 400 }
      );
    }

    // สร้าง token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 ชั่วโมง

    // Create user and token in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // สร้าง user
      const user = await tx.user.create({
        data: {
          name,
          company,
          email,
          address,
          telephone,
          role,
        },
      });

      // สร้าง password reset token
      const passwordResetToken = await tx.passwordResetToken.create({
        data: {
          token: resetToken,
          userId: user.id,
          expiresAt,
        },
      });

      return { user, passwordResetToken };
    });

    // ตั้งค่า transporter สำหรับส่งอีเมลผ่าน Gmail
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // URL สำหรับตั้งรหัสผ่าน
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/th/set-password?token=${resetToken}`;
    // ส่งอีเมล
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Mtax Online Accounting: ตั้งรหัสผ่านสำหรับบัญชีของคุณ',
      html: `
        <div style="font-family: 'Prompt', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h1 style="color: #333333; text-align: center; margin-bottom: 30px;">ยินดีต้อนรับสู่ระบบ</h1>
            
            <p style="color: #666666; font-size: 16px; line-height: 1.6;">สวัสดีคุณ ${name},</p>
            
            <div style="margin: 20px 0;">
              <p style="color: #666666; font-size: 16px; line-height: 1.6;">
                ขอบคุณที่ลงทะเบียนใช้งานระบบ ข้อมูลการเข้าสู่ระบบของคุณ:
              </p>
              <p style="color: #666666; font-size: 16px; line-height: 1.6;">
                อีเมล: <strong>${email}</strong>
              </p>
            </div>

            <p style="color: #666666; font-size: 16px; line-height: 1.6;">กรุณาคลิกที่ปุ่มด้านล่างเพื่อตั้งรหัสผ่านสำหรับบัญชีของคุณ</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #4CAF50; 
                        color: white; 
                        padding: 12px 30px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        display: inline-block;
                        font-weight: bold;">
                ตั้งรหัสผ่าน
              </a>
            </div>

            <p style="color: #ff0000; font-size: 14px; text-align: center;">
              * ลิงก์นี้จะหมดอายุใน 24 ชั่วโมง
            </p>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eeeeee; text-align: center; color: #999999; font-size: 14px;">
              <p>หากคุณไม่ได้ทำการลงทะเบียน กรุณาละเว้นอีเมลฉบับนี้</p>
              <p>© ${new Date().getFullYear()} Mtax Online Accounting: Payroll Outsourcing .</p>
            </div>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      {
        message: "ลงทะเบียนสำเร็จ กรุณาตรวจสอบอีเมลของคุณเพื่อตั้งรหัสผ่าน",
        user: result.user
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในระบบ" }, { status: 500 });
  }
}
