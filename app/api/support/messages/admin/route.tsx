import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { pusher } from "../../../../../lib/pusher";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const { content, senderId,receiverId, roomId } = await req.json();

  console.log(content, senderId, roomId);

  const room = await prisma.room.findUnique({
    where: { customerId: receiverId },
    select: {
      id: true,
    }
  });
  console.log(room)
  
  if (!room) {
    return NextResponse.json(
      { error: "Room not found" },
      { status: 404 }
    );
  }
  
  try {
    
    const message = await prisma.message.create({
      data: {
        content,
        senderId,
        receiverId,
        roomId: room.id, 
      },
    });
  
    await pusher.trigger("chat-channel", "new-message", {
      id: message.id,
      content: message.content,
      senderId: message.senderId,
      receiverId: message.receiverId,
      roomId: message.roomId,
      timestamp: message.timestamp,
    });
  
    return NextResponse.json("message");
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.error();
  }
}


export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    const room = await prisma.room.findUnique({
      where: { customerId: Number(userId) },
      select: { id: true },
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    const messages = await prisma.message.findMany({
      where: {
        roomId: room.id,
        OR: [
          { senderId: Number(userId) },
          { receiverId: Number(userId) },
        ],
      },
      orderBy: {
        timestamp: 'asc',
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
