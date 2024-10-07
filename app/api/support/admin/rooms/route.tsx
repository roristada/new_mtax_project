import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const rooms = await prisma.room.findMany({
      include: {
        messages: {
          where: {
            isRead: false,
            // Assuming admin messages are always read
            NOT: {
              senderId: { equals: 1 }, // Assuming admin ID is 1
            },
          },
          select: {
            id: true,
          },
        },
      },
    });

    const unreadMessagesCount = rooms.reduce((count, room) => count + room.messages.length, 0);

    return NextResponse.json({ rooms, unreadMessagesCount });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}