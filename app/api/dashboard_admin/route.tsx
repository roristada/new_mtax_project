import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { format } from "date-fns-tz"; // Add this library for timezone conversion

const prisma = new PrismaClient();
export async function GET(req: NextRequest) {
    try {
        const totalCustomer = await prisma.user.count({
            where: {
                role: "customer"
            },
        });

        const users = await prisma.user.findMany({
            where: {
                role: "customer"
            },
            
        });

        const totalBlog = await prisma.post.count();
        const totalAppointment = await prisma.appointment.count();
         

        const blog = await prisma.post.findMany({
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                }
            }
        });

        // Convert createdAt to Thailand timezone (UTC+7)
        const blogWithTimezone = blog.map((post) => ({
            ...post,
            createdAt: format(new Date(post.createdAt), "yyyy-MM-dd HH:mm:ss zzz", {
                timeZone: "Asia/Bangkok",
            }),
        }));

        


        return NextResponse.json({
            message: "Fetch customer success",
            totalCustomer,
            users,
            
            totalBlog,
            totalAppointment,
            blog: blogWithTimezone,
        }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
}
