import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { pusher } from "@/lib/pusher";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const { content, senderId } = await req.json();

  console.log(content, senderId );

  const room = await prisma.room.findUnique({
    where: { customerId: senderId },
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
    const adminUser = await prisma.user.findFirst({
      where: { role: "admin" },
    });
  
    if (!adminUser) {
      return NextResponse.json(
        { error: "Admin user not found" },
        { status: 404 }
      );
    }
  
    const receiverId = adminUser.id;
  
    
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
  const userId = searchParams.get('userId'); // Assume userId is passed in query params
  

  const room = await prisma.room.findUnique({
    where: { customerId:Number (userId) },
    select: {
      id: true,
    }
  });
  
  console.log("userID" ,userId , room)// Fetch roomId from query params

  try {
    const messages = await prisma.message.findMany({
      where: {
        roomId: room?.id,
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
    return NextResponse.error();
  }
}
