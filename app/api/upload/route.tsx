import { Storage } from '@google-cloud/storage';
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import Papa from "papaparse";
import { Readable } from 'stream';

const prisma = new PrismaClient();

// Set up Google Cloud Storage
const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: {
    client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
});

const bucketName = 'mtax-uploads'; // Replace with your actual bucket name

interface CsvRecord {
  รหัสพนักงาน: string;
  รหัสบัตรรูด: string;
  คำนำหน้าไทย: string;
  ชื่อภาษาไทย: string;
  นามสกุลภาษาไทย: string;
  เพศ: string;
  แผนก: string;
  ตำแหน่ง: string;
  วันเริ่มงาน: string;
  วันที่ออก?: string;
  เลขที่บัตรประชาชน: string;
  เงินเดือนปัจจุบัน: string;
  อายุ: string;
  วันเกิด: string;
  เดือน: string;
  งวด: string;
  เงินเดือน: string;
  ค่ากะ: string;
  ค่าอาหาร: string;
  "รายได้ 2": string;
  "รายได้ 3": string;
  "รายได้ 4": string;
  "รายได้ 5": string;
  "รายได้ 6": string;
  "รายได้ 7": string;
  "รายได้ 8": string;
  ภาษีพนักงานจ่าย: string;
  ภาษีบริษัทจ่ายให้: string;
  "ปกส พนักงาน": string;
  "ปกส บริษัท จ่าย": string;
  กองทุนสำรอง: string;
  "รายหัก 1": string;
  "รายหัก 2": string;
  "รายหัก 3": string;
  "รายหัก 4": string;
}

function chunk<T>(array: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(array.length / size) }, (v, i) =>
    array.slice(i * size, i * size + size)
  );
}

async function uploadToStorage(req: NextRequest) {
  try {
    const formData = await req.formData();

    const yearString = formData.get("year");
    const companyIdString = formData.get("companyId");
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      throw new Error("File is missing or invalid");
    }

    const year = yearString ? parseInt(yearString.toString(), 10) : undefined;
    const companyId = companyIdString
      ? parseInt(companyIdString.toString(), 10)
      : undefined;

    if (!year || !companyId) {
      throw new Error("Year or Company ID is missing or invalid");
    }

    const user = await prisma.user.findUnique({
      where: { id: companyId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    console.log(`User found: ${user.id}, starting file processing...`);

    // Upload file to Google Cloud Storage
    const bucket = storage.bucket(bucketName);
    const fileName = `${companyId}/${year}/${file.name}`;
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const gcsFile = bucket.file(fileName);
    await gcsFile.save(fileBuffer);

    console.log(`File uploaded to ${fileName}`);

    // Read and parse the CSV file
    const [fileContents] = await gcsFile.download();
    const fileStream = Readable.from(fileContents);

    const parsedData: CsvRecord[] = await new Promise((resolve, reject) => {
      Papa.parse(fileStream, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => resolve(results.data as CsvRecord[]),
        error: (error) => reject(error),
      });
    });

    // Process the parsed data (similar to your existing code)
    const batchSize = 100;
    const batches = chunk(parsedData, batchSize);
    let recordsInserted = 0;

    for (const batch of batches) {
      try {
        await prisma.$transaction(async (tx) => {
          for (const record of batch) {
            // Your existing logic for creating/updating records
            // Make sure to use the transaction (tx) instead of prisma directly
            // ...

            recordsInserted++;
          }
        });
      } catch (error) {
        console.error(
          `Error processing record: ${JSON.stringify(batch[0])}`,
          error
        );
      }
    }

    console.log("File processing and data insertion completed.");

    return {
      status: "success",
      message: `File processed successfully. ${recordsInserted} records inserted.`,
      fileUrl: `https://storage.googleapis.com/${bucketName}/${fileName}`,
    };
  } catch (error) {
    console.error("Error handling request:", error);
    throw new Error("Internal Server Error");
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await uploadToStorage(req);
    return NextResponse.json({ message: "OK", data }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error", error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const fileName = url.searchParams.get("fileName");

    if (!fileName) {
      throw new Error("Missing fileName parameter");
    }

    const bucket = storage.bucket(bucketName);
    const file = bucket.file(fileName);

    const [exists] = await file.exists();
    if (!exists) {
      throw new Error("File not found");
    }

    const [fileContents] = await file.download();
    return NextResponse.json(
      { message: "File found", fileContents: fileContents.toString('utf-8') },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error", error: (error as Error).message },
      { status: 500 }
    );
  }
}