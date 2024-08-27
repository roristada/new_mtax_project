import path from "path";
import fs from "fs";
import Papa from "papaparse";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

async function parseCSV(filePath: string): Promise<CsvRecord[]> {
  const csvData = fs.readFileSync(filePath, "utf-8");
  return Papa.parse<CsvRecord>(csvData, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  }).data;
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

    const arrayBuffer = await file.arrayBuffer();
    const fileName = file instanceof File ? file.name : "unknown";
    const dateFolder = new Date().toISOString().split("T")[0];

    const dirPath = path.join("public", "file_upload", dateFolder);

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    const filePath = path.join(dirPath, fileName);
    fs.writeFileSync(filePath, new Uint8Array(arrayBuffer));

    const parsedData: CsvRecord[] = await parseCSV(filePath);

    const batchSize = 100; // Adjust batch size as necessary
    const batches = chunk(parsedData, batchSize);
    let recordsInserted = 0;

    for (const batch of batches) {
      try {
        await prisma.$transaction(async (tx) => {
          for (const record of batch) {
            const employeeCode = record["รหัสพนักงาน"].toString();

            // Find existing employee based on composite key
            let employee = await tx.employee.findFirst({
              where: {
                employeeCode: employeeCode,
                companyId: user.id,
                year: year,
              },
            });

            if (employee) {
              // Update the existing employee record
              employee = await tx.employee.update({
                where: {
                  employeeCode_companyId_year: {
                    employeeCode: employee.employeeCode,
                    companyId: employee.companyId,
                    year: year,
                  },
                },
                data: {
                  cardCode: record["รหัสบัตรรูด"].toString(),
                  title: record["คำนำหน้าไทย"],
                  firstName: record["ชื่อภาษาไทย"],
                  lastName: record["นามสกุลภาษาไทย"],
                  gender: record["เพศ"],
                  department: record["แผนก"],
                  position: record["ตำแหน่ง"],
                  startDate: record["วันเริ่มงาน"],
                  endDate: record["วันที่ออก"] ? record["วันที่ออก"] : null,
                  citizenId: record["เลขที่บัตรประชาชน"].toString(),
                  currentSalary: parseFloat(record["เงินเดือนปัจจุบัน"]) || 0,
                  age: parseInt(record["อายุ"], 10) || 0,
                  birthDate: record["วันเกิด"],
                  year: year,
                },
              });
            } else {
              // Create a new employee record
              employee = await tx.employee.create({
                data: {
                  employeeCode,
                  year: year,
                  cardCode: record["รหัสบัตรรูด"].toString(),
                  title: record["คำนำหน้าไทย"],
                  firstName: record["ชื่อภาษาไทย"],
                  lastName: record["นามสกุลภาษาไทย"],
                  gender: record["เพศ"],
                  department: record["แผนก"],
                  position: record["ตำแหน่ง"],
                  startDate: record["วันเริ่มงาน"],
                  endDate: record["วันที่ออก"] ? record["วันที่ออก"] : null,
                  citizenId: record["เลขที่บัตรประชาชน"].toString(),
                  currentSalary: parseFloat(record["เงินเดือนปัจจุบัน"]) || 0,
                  age: parseInt(record["อายุ"], 10) || 0,
                  birthDate: record["วันเกิด"],
                  companyId: user.id,
                },
              });
            }

            await tx.income.create({
              data: {
                employeeCode: employee.employeeCode,
                companyId: employee.companyId,
                month: parseInt(record["เดือน"], 10) || 1,
                year: year,
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
              },
            });

            await tx.expense.create({
              data: {
                employeeCode: employee.employeeCode,
                companyId: employee.companyId,
                year: year,
                month: parseInt(record["เดือน"], 10) || 1,
                loan: parseFloat(record["รายหัก 2"]),
                salaryAdvance: parseFloat(record["รายหัก 3"]),
                commissionDeduction: parseFloat(record["รายหัก 4"]),
                otherDeductions: parseFloat(record["รายหัก 1"]),
              },
            });

            await tx.tax.create({
              data: {
                employeeCode: employee.employeeCode,
                companyId: employee.companyId,
                year: year,
                month: parseInt(record["เดือน"], 10) || 1,
                employeeTax: parseFloat(record["ภาษีพนักงานจ่าย"]),
                companyTax: parseFloat(record["ภาษีบริษัทจ่ายให้"]),
                socialSecurityEmployee: parseFloat(record["ปกส พนักงาน"]),
                socialSecurityCompany: parseFloat(record["ปกส บริษัท จ่าย"]),
                providentFund: parseFloat(record["กองทุนสำรอง"]),
              },
            });

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

    console.timeEnd("Data Import");
    console.log("File processing and data insertion completed.");

    return {
      status: "success",
      message: `File processed successfully. ${recordsInserted} records inserted.`,
    };
  } catch (error) {
    console.error("Error handling request:", error);
    throw new Error("Internal Server Error");
  }
}

async function findFile(directory: string, fileName: string) {
  const files = fs.readdirSync(directory);
  const filePath = files.find((file) => file === fileName);
  if (!filePath) {
    throw new Error("File not found");
  }
  return path.join(directory, filePath);
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

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const fileName = url.searchParams.get("fileName");
    const dateFolder = url.searchParams.get("dateFolder");

    if (!fileName || !dateFolder) {
      throw new Error("Missing query parameters");
    }

    const directory = path.join("public", "file_upload", dateFolder);
    const filePath = await findFile(directory, fileName);

    const fileContents = fs.readFileSync(filePath, "utf-8");
    return NextResponse.json(
      { message: "File found", fileContents },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error", error: error },
      { status: 500 }
    );
  }
}
