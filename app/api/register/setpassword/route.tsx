import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    // ค้นหา token ที่ยังไม่หมดอายุและยังไม่ถูกใช้
    const passwordResetToken = await prisma.passwordResetToken.findFirst({
      where: {
        token,
        expiresAt: {
          gt: new Date()
        },
        used: false
      },
      include: {
        user: true
      }
    });

    if (!passwordResetToken) {
      return NextResponse.json(
        { error: "Token ไม่ถูกต้องหรือหมดอายุ" },
        { status: 400 }
      );
    }

    // อัพเดทรหัสผ่านและมาร์ค token ว่าถูกใช้แล้ว
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    await prisma.$transaction([
      // อัพเดทรหัสผ่าน
      prisma.user.update({
        where: { id: passwordResetToken.userId },
        data: { password: hashedPassword }
      }),
      // อัพเดท token ว่าถูกใช้แล้ว
      prisma.passwordResetToken.update({
        where: { id: passwordResetToken.id },
        data: { used: true }
      })
    ]);

    return NextResponse.json(
      { message: "ตั้งรหัสผ่านสำเร็จ" },
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