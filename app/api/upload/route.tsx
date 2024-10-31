import Papa from "papaparse";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Storage } from '@google-cloud/storage';


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
    // const publicUrl = `https://storage.googleapis.com/${bucketName}/${gcsFile.name}`
    // console.log(publicUrl)

    // const fileStream = gcsFile.createReadStream();

    const [fileContents] = await gcsFile.download();
    const fileString = fileContents.toString("utf-8");

    // const arrayBuffer = await file.arrayBuffer();
    // const fileName = file instanceof File ? file.name : "unknown";
    // const dateFolder = new Date().toISOString().split("T")[0];

    // const dirPath = path.join("public", "file_upload", dateFolder);

    // if (!fs.existsSync(dirPath)) {
    //   fs.mkdirSync(dirPath, { recursive: true });
    // }

    // const filePath = path.join(dirPath, fileName);
    // fs.writeFileSync(filePath, new Uint8Array(arrayBuffer));

    

    // const parsedData: CsvRecord[] = await parseCSV(filePath);

    
    
    const parsedData: CsvRecord[] = await new Promise((resolve, reject) => {
      Papa.parse<CsvRecord>(fileString, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => resolve(results.data as CsvRecord[]),
        error: (error:any) => reject(error),
      });
    });

    
    // async function parseCSV(filePath: string): Promise<CsvRecord[]> {
    //   const csvData = fs.readFileSync(filePath, "utf-8");
    //   return Papa.parse<CsvRecord>(csvData, {
    //     header: true,
    //     dynamicTyping: true,
    //     skipEmptyLines: true,
    //   }).data;
    // }
    

    const batchSize = 100; // Adjust batch size as necessary
    const batches = chunk(parsedData, batchSize);
    let recordsInserted = 0;

    // for (const batch of batches) {
    //   try {
    //     await prisma.$transaction(async (tx) => {
    //       for (const record of batch) {
            
    //         const employeeCode = record["รหัสพนักงาน"].toString();
    //         console.log("employeeCode", employeeCode)
            
    //         // Find existing employee based on composite key
    //         let employee = await tx.employee.findFirst({
    //           where: {
    //             employeeCode: employeeCode,
    //             companyId: user.id,
    //             year: year,
    //           },
    //         });
            

    //         if (employee) {
    //           // Update the existing employee record
    //           employee = await tx.employee.update({
    //             where: {
    //               employeeCode_companyId_year: {
    //                 employeeCode: employee.employeeCode,
    //                 companyId: employee.companyId,
    //                 year: year,
    //               },
    //             },
    //             data: {
    //               cardCode: record["รหัสบัตรรูด"].toString(),
    //               title: record["คำนำหน้าไทย"],
    //               firstName: record["ชื่อภาษาไทย"],
    //               lastName: record["นามสกุลภาษาไทย"],
    //               gender: record["เพศ"],
    //               department: record["แผนก"],
    //               position: record["ตำแหน่ง"],
    //               startDate: record["วันเริ่มงาน"],
    //               endDate: record["วันที่ออก"] ? record["วันที่ออก"] : null,
    //               citizenId: record["เลขที่บัตรประชาชน"].toString(),
    //               currentSalary: parseFloat(record["เงินเดือนปัจจุบัน"]) || 0,
    //               age: parseInt(record["อายุ"], 10) || 0,
    //               birthDate: record["วันเกิด"],
    //               year: year,
    //             },
    //           });
    //         } else {
    //           // Create a new employee record
    //           employee = await tx.employee.create({
    //             data: {
    //               employeeCode,
    //               year: year,
    //               cardCode: record["รหัสบัตรรูด"].toString(),
    //               title: record["คำนำหน้าไทย"],
    //               firstName: record["ชื่อภาษาไทย"],
    //               lastName: record["นามสกุลภาษาไทย"],
    //               gender: record["เพศ"],
    //               department: record["แผนก"],
    //               position: record["ตำแหน่ง"],
    //               startDate: record["วันเริ่มงาน"],
    //               endDate: record["วันที่ออก"] ? record["วันที่ออก"] : null,
    //               citizenId: record["เลขที่บัตรประชาชน"].toString(),
    //               currentSalary: parseFloat(record["เงินเดือนปัจจุบัน"]) || 0,
    //               age: parseInt(record["อายุ"], 10) || 0,
    //               birthDate: record["วันเกิด"],
    //               companyId: user.id,
    //             },
    //           });
    //         }

    //         await tx.income.create({
    //           data: {
    //             employeeCode: employee.employeeCode,
    //             companyId: employee.companyId,
    //             month: parseInt(record["เดือน"], 10) || 1,
    //             year: year,
    //             salary: parseFloat(record["เงินเดือน"]) || 0,
    //             shiftAllowance: parseFloat(record["ค่ากะ"]) || 0,
    //             foodAllowance: parseFloat(record["ค่าอาหาร"]) || 0,
    //             overtime: parseFloat(record["รายได้ 2"]) || 0,
    //             diligence: parseFloat(record["รายได้ 3"]) || 0,
    //             beverage: parseFloat(record["รายได้ 4"]) || 0,
    //             commission: parseFloat(record["รายได้ 5"]) || 0,
    //             brokerFee: parseFloat(record["รายได้ 6"]) || 0,
    //             otherIncome: parseFloat(record["รายได้ 7"]) || 0,
    //             bonus: parseFloat(record["รายได้ 8"]) || 0,
    //           },
    //         });

    //         await tx.expense.create({
    //           data: {
    //             employeeCode: employee.employeeCode,
    //             companyId: employee.companyId,
    //             year: year,
    //             month: parseInt(record["เดือน"], 10) || 1,
    //             loan: parseFloat(record["รายหัก 2"]),
    //             salaryAdvance: parseFloat(record["รายหัก 3"]),
    //             commissionDeduction: parseFloat(record["รายหัก 4"]),
    //             otherDeductions: parseFloat(record["รายหัก 1"]),
    //           },
    //         });

    //         await tx.tax.create({
    //           data: {
    //             employeeCode: employee.employeeCode,
    //             companyId: employee.companyId,
    //             year: year,
    //             month: parseInt(record["เดือน"], 10) || 1,
    //             employeeTax: parseFloat(record["ภาษีพนักงานจ่าย"]),
    //             companyTax: parseFloat(record["ภาษีบริษัทจ่ายให้"]),
    //             socialSecurityEmployee: parseFloat(record["ปกส พนักงาน"]),
    //             socialSecurityCompany: parseFloat(record["ปกส บริษัท จ่าย"]),
    //             providentFund: parseFloat(record["กองทุนสำรอง"]),
    //           },
    //         });

    //         recordsInserted++;
    //       }
    //     });
    //   } catch (error) {
    //     console.error(
    //       `Error processing record: ${JSON.stringify(batch[0])}`,
    //       error
    //     );
    //   }
    // }

    for (const batch of batches) {
      try {
        await prisma.$transaction(async (tx) => {
          for (const record of batch) {
    
            const employeeCode = record["รหัสพนักงาน"].toString();
            console.log("employeeCode", employeeCode);
    
            // Find existing employee based on composite key
            let employee = await tx.employee.findFirst({
              where: {
                employeeCode: employeeCode,
                companyId: user.id,
                year: year,
              },
            });
    
            if (employee) {
              // Update the existing employee record if it already exists
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
              // Create a new employee record if it doesn't exist
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
    
            // Inserting into income, expense, and tax as before
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
        console.error(`Error processing record: ${JSON.stringify(batch[0])}`, error);
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



