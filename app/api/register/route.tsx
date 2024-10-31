import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import nodemailer from 'nodemailer';
import crypto from 'crypto';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const {name, company, email, address, telephone, role} = await request.json();
    
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
    //const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/set-password?token=${resetToken}`;
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL_LOCAL}/th/set-password?token=${resetToken}`;

    // ส่งอีเมล
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'ตั้งรหัสผ่านสำหรับบัญชีของคุณ',
      html: `
        <p>สวัสดีคุณ ${name},</p>
        <p>กรุณาคลิกที่ลิงก์ด้านล่างเพื่อตั้งรหัสผ่านสำหรับบัญชีของคุณ:</p>
        <a href="${resetUrl}">คลิกที่นี่เพื่อตั้งรหัสผ่าน</a>
        <p>ลิงก์นี้จะหมดอายุใน 24 ชั่วโมง</p>
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
