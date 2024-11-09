import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { Storage } from '@google-cloud/storage';

const prisma = new PrismaClient();
const bucketName = 'mtax-storage-file';

const storage = new Storage({
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    credentials: {
        client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY ? 
            process.env.GOOGLE_CLOUD_PRIVATE_KEY.replace(/\\n/g, '\n') : 
            undefined,
    },
});

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json(
                { error: "User ID is required" },
                { status: 400 }
            );
        }

        // 1. ลบไฟล์ทั้งหมดจาก Google Cloud Storage
        const bucket = storage.bucket(bucketName);
        const [files] = await bucket.getFiles({
            prefix: `${userId}/`
        });
        await Promise.all(files.map(file => file.delete()));

        // 2. ลบข้อมูลทั้งหมดจาก Database
        await prisma.$transaction(async (tx) => {
            // ลบข้อมูลจากตาราง tax
            await tx.tax.deleteMany({
                where: { companyId: Number(userId) }
            });

            // ลบข้อมูลจากตาราง expense
            await tx.expense.deleteMany({
                where: { companyId: Number(userId) }
            });

            // ลบข้อมูลจากตาราง income
            await tx.income.deleteMany({
                where: { companyId: Number(userId) }
            });

            // ลบข้อมูลจากตาราง employee
            await tx.employee.deleteMany({
                where: { companyId: Number(userId) }
            });

            // ลบข้อมูลจากตาราง appointment
            

            // ลบข้อมูลจากตาราง chat
            await tx.message.deleteMany({
                where: {
                    OR: [
                        { senderId: Number(userId) },
                        { receiverId: Number(userId) }
                    ]
                }
            });

            await tx.room.deleteMany({
                where: { customerId: Number(userId) }
            });

            // ลบข้อมูลผู้ใช้
            await tx.user.delete({
                where: { id: Number(userId) }
            });
        });

        return NextResponse.json({
            message: `Successfully deleted user account and all associated data`,
            deletedFiles: files.length
        });

    } catch (error) {
        console.error("Error deleting account:", error);
        return NextResponse.json(
            { error: "Failed to delete account" },
            { status: 500 }
        );
    }
}