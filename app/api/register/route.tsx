import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const {name , company, email, password, address, telephone ,role} = await request.json();

    
    const existingUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (existingUser) {
      
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      );
    }

    
    const hashedPassword = bcrypt.hashSync(password, 10);

    const createUser = await prisma.user.create({
      data: {
        name,
        company,
        email,
        password: hashedPassword,
        address,
        telephone,
        role
      },
    });

    return NextResponse.json(
      {
        message: "User registered successfully",
        name,
        company,
        email,
        address,
        telephone,
        role
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
