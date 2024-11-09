import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    const { id } = params;
    
    try {
        const user = await prisma.user.findUnique({
            where: { id: parseInt(id) },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                company: true,
                address: true,
                telephone: true,
                
            }
        });
        return NextResponse.json(user);
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
  ) {
    try {
      const data = await request.json();
      const userId = params.id;
  
      // ตรวจสอบ email ซ้ำ
      const existingEmail = await prisma.user.findFirst({
        where: {
          email: data.email,
          NOT: {
            id: parseInt(userId)
          }
        }
      });
  
      if (existingEmail) {
        return NextResponse.json(
          { error: 'อีเมลนี้ถูกใช้งานแล้ว' },
          { status: 400 }
        );
      }
  
      // ตรวจสอบชื่อบริษัทซ้ำ
      const existingCompany = await prisma.user.findFirst({
        where: {
          company: data.company,
          NOT: {
            id: parseInt(userId)
          }
        }
      });
  
      if (existingCompany) {
        return NextResponse.json(
          { error: 'ชื่อบริษัทนี้ถูกใช้งานแล้ว' },
          { status: 400 }
        );
      }
  
      // ถ้าไม่มีข้อมูลซ้ำ ทำการอัพเดท
      const updatedUser = await prisma.user.update({
        where: { id: parseInt(userId) },
        data: {
          name: data.name,
          email: data.email,
          role: data.role,
          company: data.company,
          address: data.address,
          telephone: data.telephone,
        },
      });
  
      return NextResponse.json(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: 500 }
      );
    }
  }