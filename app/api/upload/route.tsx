import Papa from "papaparse";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Storage } from '@google-cloud/storage';


const prisma = new PrismaClient();

interface CsvRecord {
  "รหัสพนักงาน": string;
  "รหัสบัตรรูด": string;
  "คำนำหน้าไทย": string;
  "ชื่อภาษาไทย": string;
  "นามสกุลภาษาไทย": string;
  "เพศ": string;
  "แผนก": string;
  "ตำแหน่ง": string;
  "วันเริ่มงาน": string;
  "วันที่ออก"?: string;
  "เลขที่บัตรประชาชน": string;
  "เงินเดือนปัจจุบัน": string;
  "อายุ": string;
  "วันเกิด": string;
  "เดือน": string;
  "งวด": string;
  "เงินเดือน": string;
  "ค่ากะ": string;
  "ค่าอาหาร": string;
  "รายได้ 2": string;
  "รายได้ 3": string;
  "รายได้ 4": string;
  "รายได้ 5": string;
  "รายได้ 6": string;
  "รายได้ 7": string;
  "รายได้ 8": string;
  "ภาษีพนักงานจ่าย": string;
  "ภาษีบริษัทจ่ายให้": string;
  "ปกส พนักงาน": string;
  "ปกส บริษัท จ่าย": string;
  "กองทุนสำรอง": string;
  "รายหัก 1": string;
  "รายหัก 2": string;
  "รายหัก 3": string;
  "รายหัก 4": string;
}

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: {
    client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY ? 
      process.env.GOOGLE_CLOUD_PRIVATE_KEY.replace(/\\n/g, '\n') : 
      undefined,
  },
});

const bucketName = 'mtax-storage-file';


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
    console.log("file", file)

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

    const existingRecords = await prisma.income.findMany({
      where: {
        employee: {
          companyId: user.id,
        },
        year,
      },
    });

    if (existingRecords.length > 0) {
      console.error(
        `Data for company ID ${companyId} and year ${year} already exists.`
      );
      throw new Error(
        "Data for this company and year already exists. Please update the existing records."
      );
    }

    const bucket = storage.bucket(bucketName);
    const fileName = `${companyId}/${year}/${file.name}`;
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const gcsFile = bucket.file(fileName);
    await gcsFile.save(fileBuffer);
    console.log(`File uploaded to ${fileName}`);

    const [fileContents] = await gcsFile.download();
    const fileString = fileContents.toString("utf-8");

    
    const parsedData: CsvRecord[] = await new Promise((resolve, reject) => {
      Papa.parse<CsvRecord>(fileString, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => resolve(results.data as CsvRecord[]),
        error: (error:any) => reject(error),
      });
    });

    const batchSize = 100; 
    const batches = chunk(parsedData, batchSize);
    let recordsInserted = 0;

    for (const batch of batches) {
      try {
        await prisma.$transaction(async (tx) => {
          const employeeData = [];
          const incomeData = [];
          const expenseData = [];
          const taxData = [];

          for (const record of batch) {
            const employeeCode = record["รหัสพนักงาน"].toString();
            
            // เตรียมข้อมูล employee
            const employeeInput = {
              employeeCode,
              year,
              cardCode: record["รหัสบัตรรูด"].toString(),
              title: record["คำนำหน้าไทย"],
              firstName: record["ชื่อภาษาไทย"],
              lastName: record["นามสกุลภาษาไทย"],
              gender: record["เพศ"],
              department: record["แผนก"],
              position: record["ตำแหน่ง"],
              startDate: record["วันเริ่มงาน"],
              endDate: record["วันที่ออก"] || null,
              citizenId: record["เลขที่บัตรประชาชน"].toString(),
              currentSalary: parseFloat(record["เงินเดือนปัจจุบัน"]) || 0,
              age: parseInt(record["อายุ"], 10) || 0,
              birthDate: record["วันเกิด"],
              companyId: user.id,
            };
            employeeData.push(employeeInput);

            // เตรียมข้อมูล income
            incomeData.push({
              employeeCode,
              companyId: user.id,
              month: parseInt(record["เดือน"], 10) || 1,
              year,
              salary: parseFloat(record["เงินเดือน"]) || 0,
              shiftAllowance: parseFloat(record["ค่ากะ"]) || 0,
              foodAllowance: parseFloat(record["ค่าอาหาร"]) || 0,
              overtime: parseFloat(record["รายได้ 2"]) || 0,
              diligence: parseFloat(record["รายได้ 3"]) || 0,
              beverage: parseFloat(record["รายได้ 4"]) || 0,
              commission: parseFloat(record["รายได้ 5"]) || 0,
              brokerFee: parseFloat(record["รายได้ 6"]) || 0,
              otherIncome: parseFloat(record["รายได้ 7"]) || 0,
              bonus: parseFloat(record["รายได้ 8"]) || 0,
            });

            // เตรียมข้อมูล expense
            expenseData.push({
              employeeCode,
              companyId: user.id,
              year,
              month: parseInt(record["เดือน"], 10) || 1,
              loan: parseFloat(record["รายหัก 2"]) || 0,
              salaryAdvance: parseFloat(record["รายหัก 3"]) || 0,
              commissionDeduction: parseFloat(record["รายหัก 4"]) || 0,
              otherDeductions: parseFloat(record["รายหัก 1"]) || 0,
            });

            // เตรียมข้อมูล tax
            taxData.push({
              employeeCode,
              companyId: user.id,
              year,
              month: parseInt(record["เดือน"], 10) || 1,
              employeeTax: parseFloat(record["ภาษีพนักงานจ่าย"]) || 0,
              companyTax: parseFloat(record["ภาษีบริษัทจ่ายให้"]) || 0,
              socialSecurityEmployee: parseFloat(record["ปกส พนักงาน"]) || 0,
              socialSecurityCompany: parseFloat(record["ปกส บริษัท จ่าย"]) || 0,
              providentFund: parseFloat(record["กองทุนสำรอง"]) || 0,
            });
          }

          // Bulk upsert employees
          await tx.employee.createMany({
            data: employeeData,
            skipDuplicates: true,
          });

          // Bulk create records
          await tx.income.createMany({ data: incomeData });
          await tx.expense.createMany({ data: expenseData });
          await tx.tax.createMany({ data: taxData });

          recordsInserted += batch.length;
        });
      } catch (error) {
        console.error(`Error processing batch:`, error);
        return {
          status: "error",
          message: `Error processing batch: ${error}`,
        };
      }
    }

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
      { message: "Error", error: error },
      { status: 500 }
    );
  }
}

async function findFileInGCS(bucketName: string, fileName: string): Promise<string> {
  const storage = new Storage({
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    credentials: {
      client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY ? 
        process.env.GOOGLE_CLOUD_PRIVATE_KEY.replace(/\\n/g, '\n') : 
        undefined,
    },
  });

  const bucket = storage.bucket(bucketName);
  const file = bucket.file(fileName);

  try {
    const [exists] = await file.exists();
    if (!exists) {
      throw new Error("File not found in Google Cloud Storage");
    }
    const [fileContents] = await file.download();
    return fileContents.toString('utf-8');
  } catch (error) {
    console.error("Error finding file in GCS:", error);
    throw error;
  }
}



async function listFilesInGCS(bucketName: string, companyId: string): Promise<Record<string, string[]>> {
  const storage = new Storage({
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    credentials: {
      client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY ? 
        process.env.GOOGLE_CLOUD_PRIVATE_KEY.replace(/\\n/g, '\n') : 
        undefined,
    },
  });

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
    const url = new URL(req.url);
    const action = url.searchParams.get("action");
    const companyId = url.searchParams.get("companyId");

    if (action === "list") {
      if (!companyId) {
        throw new Error("Missing companyId parameter");
      }

      const files = await listFilesInGCS(bucketName, companyId);

      return NextResponse.json(
        { message: "Files found", files },
        { status: 200 }
      );
    } else if (action === "download") {
      const fileName = url.searchParams.get("fileName");
      const year = url.searchParams.get("year");
      if (!fileName || !companyId || !year) {
        throw new Error("Missing query parameters");
      }

      const gcsFileName = `${companyId}/${year}/${fileName}`;
      const fileContents = await findFileInGCS(bucketName, gcsFileName);

      return NextResponse.json(
        { message: "File found", fileContents },
        { status: 200 }
      );
    } else {
      throw new Error("Invalid action");
    }
  } catch (error) {
    return NextResponse.json(
      { message: "Error", error: (error as Error).message },
      { status: 500 }
    );
  }
}



