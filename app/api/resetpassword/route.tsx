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

    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL_LOCAL}/th/set-password?token=${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'รีเซ็ตรหัสผ่าน',
      html: `
        <p>สวัสดีคุณ ${user.name},</p>
        <p>คุณได้ขอรีเซ็ตรหัสผ่าน กรุณาคลิกที่ลิงก์ด้านล่างเพื่อตั้งรหัสผ่านใหม่:</p>
        <a href="${resetUrl}">คลิกที่นี่เพื่อตั้งรหัสผ่านใหม่</a>
        <p>ลิงก์นี้จะหมดอายุใน 24 ชั่วโมง</p>
        <p>หากคุณไม่ได้เป็นผู้ขอรีเซ็ตรหัสผ่าน กรุณาละเว้นอีเมลนี้</p>
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