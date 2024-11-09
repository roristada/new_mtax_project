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

async function listFilesInGCS(companyId: string): Promise<Record<string, string[]>> {
    const bucket = storage.bucket(bucketName);
    const [files] = await bucket.getFiles({ prefix: `${companyId}/` });

    const filesByYear: Record<string, string[]> = {};
    files.forEach(file => {
        const match = file.name.match(new RegExp(`${companyId}/(\\d{4})/(.+)`));
        if (match) {
            const [, year, fileName] = match;
            if (!filesByYear[year]) {
                filesByYear[year] = [];
            }
            filesByYear[year].push(fileName);
        }
    });

    return filesByYear;
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const companyId = searchParams.get("companyId");
        
        if (!companyId) {
            throw new Error("Company ID is required");
        }

        // ดึงข้อมูลปีจาก Database
        const years = await prisma.employee.findMany({
            where: {
                companyId: Number(companyId)
            },
            distinct: ['year'],
            select: {
                year: true
            },
            orderBy: {
                year: 'desc'
            }
        });

        // ดึงข้อมูลไฟล์จาก Google Cloud Storage
        const files = await listFilesInGCS(companyId);

        // รวมข้อมูลเข้าด้วยกัน
        const combinedData = {
            databaseYears: years.map(y => y.year),
            storageFiles: files,
            summary: years.map(y => ({
                year: y.year,
                hasData: true,
                hasFiles: files[y.year.toString()]?.length > 0 || false,
                files: files[y.year.toString()] || []
            }))
        };
        
        return NextResponse.json(combinedData);
    } catch (error) {
        console.error("Error fetching data:", error);
        return NextResponse.json(
            { error: "Failed to fetch data" }, 
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const companyId = searchParams.get("companyId");
        const year = searchParams.get("year");

        if (!companyId || !year) {
            return NextResponse.json(
                { error: "Company ID and year are required" },
                { status: 400 }
            );
        }

        // 1. ลบไฟล์จาก Google Cloud Storage
        const bucket = storage.bucket(bucketName);
        const [files] = await bucket.getFiles({
            prefix: `${companyId}/${year}/`
        });

        // ลบไฟล์ทั้งหมดในโฟลเดอร์ของปีนั้น
        await Promise.all(files.map(file => file.delete()));

        // 2. ลบข้อมูลจาก Database
        await prisma.$transaction(async (tx) => {
            // ลบข้อมูลจากตาราง tax
            await tx.tax.deleteMany({
                where: {
                    companyId: Number(companyId),
                    year: Number(year)
                }
            });

            // ลบข้อมูลจากตาราง expense
            await tx.expense.deleteMany({
                where: {
                    companyId: Number(companyId),
                    year: Number(year)
                }
            });

            // ลบข้อมูลจากตาราง income
            await tx.income.deleteMany({
                where: {
                    companyId: Number(companyId),
                    year: Number(year)
                }
            });

            // ลบข้อมูลจากตาราง employee
            await tx.employee.deleteMany({
                where: {
                    companyId: Number(companyId),
                    year: Number(year)
                }
            });
        });

        return NextResponse.json({
            message: `Successfully deleted all data for company ${companyId} year ${year}`,
            deletedFiles: files.length
        });

    } catch (error) {
        console.error("Error deleting data:", error);
        return NextResponse.json(
            { error: "Failed to delete data" },
            { status: 500 }
        );
    }
}