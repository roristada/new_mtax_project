import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
    try {
        const users = await prisma.user.findMany();
        console.log(process.env.GOOGLE_CLOUD_PROJECT_ID , process.env.GOOGLE_CLOUD_CLIENT_EMAIL , process.env.GOOGLE_CLOUD_PRIVATE_KEY)
        return NextResponse.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}