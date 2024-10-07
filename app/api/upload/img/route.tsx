// /app/api/upload/route.ts
import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

const uploadDir = path.join(process.cwd(), "public", "img_upload");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("image") as File;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const fileName = `${uuidv4()}-${file.name}`;
  const filePath = path.join(uploadDir, fileName);

  // Convert the array buffer to Uint8Array before writing
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  // Write the file using Uint8Array
  fs.writeFileSync(filePath, uint8Array);

  const fileUrl = `/img_upload/${fileName}`; // URL of the uploaded file
  return NextResponse.json({ url: fileUrl });
}
