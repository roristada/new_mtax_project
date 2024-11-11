
import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { Storage } from '@google-cloud/storage';

const uploadDir = path.join(process.cwd(), "public", "img_upload");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const bucketName = 'mtax-storage-file';

export async function POST(req: Request) {
  const storage = new Storage({
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    credentials: {
      client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY ? 
        process.env.GOOGLE_CLOUD_PRIVATE_KEY.replace(/\\n/g, '\n') : 
        undefined,
    },
  });

  const formData = await req.formData();
  const file = formData.get("image") as File;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const fileName = `${uuidv4()}-${file.name}`;

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const bucket = storage.bucket(bucketName);
    const blob = bucket.file(`img_upload/${fileName}`); 
    await blob.save(buffer, {
      metadata: {
        contentType: file.type,
      },
    });

    
    const publicUrl = `https://storage.googleapis.com/${bucketName}/img_upload/${fileName}`;

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error('Error uploading file to Google Cloud Storage:', error);
    return NextResponse.json({ error: "File upload failed" }, { status: 500 });
  }
}
