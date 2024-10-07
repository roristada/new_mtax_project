import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient(); // Adjust the path to your Prisma setup

// GET request: Check if the customer has an existing room
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const customerId = searchParams.get("customerId");

  if (!customerId) {
    return NextResponse.json({ message: "Customer ID is required" }, { status: 400 });
  }

  try {
    const room = await prisma.room.findFirst({
      where: { customerId: Number(customerId) },
    });

    if (room) {
      return NextResponse.json({ room });
    } else {
      return NextResponse.json({ message: "No room found" }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch room" }, { status: 500 });
  }
}

// POST request: Create a new room for the customer
export async function POST(req: Request) {
  const { customerId } = await req.json();

  if (!customerId) {
    return NextResponse.json({ message: "Customer ID is required" }, { status: 400 });
  }

  try {
    const newRoom = await prisma.room.create({
      data: {
        customerId: Number(customerId),
      },
    });

    return NextResponse.json({ room: newRoom }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create room" }, { status: 500 });
  }
}
