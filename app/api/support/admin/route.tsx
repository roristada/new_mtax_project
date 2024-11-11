import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(req: Request) {
    try {
        const rooms = await prisma.room.findMany({
            include: {
                customer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        company: true,
                    },
                },
                messages: {
                    where: {
                        isRead: false,
                        
                        NOT: {
                            senderId: { equals: 1 }, 
                        },
                    },
                    select: {
                        id: true,
                    },
                },
            },
        });

        const roomsWithUnreadCount = rooms.map(room => ({
            ...room,
            unreadMessagesCount: room.messages.length,
            messages: undefined, 
        }));

        

        return NextResponse.json(roomsWithUnreadCount);
    } catch (error) {
        console.error("Error fetching rooms:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}