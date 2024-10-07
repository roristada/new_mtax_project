import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { roomId, userId } = await req.json();

    await prisma.message.updateMany({
      where: {
        roomId: roomId,
        receiverId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating message read status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}