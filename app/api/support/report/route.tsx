import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import nodemailer from 'nodemailer';
import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

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

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const { name, company, email, category, description, userId } = Object.fromEntries(formData);
    const images = formData.getAll('images');

    const imageUrls = [];
    for (const image of images) {
      if (image instanceof File) {
        const bucket = storage.bucket(bucketName);
        const extension = image.name.split('.').pop();
        const filename = `reports/${uuidv4()}.${extension}`;
        const file = bucket.file(filename);
        
        const buffer = Buffer.from(await image.arrayBuffer());
        await file.save(buffer, {
          contentType: image.type,
        });

        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
        imageUrls.push(publicUrl);
      }
    }

    const report = await prisma.report.create({
      data: {
        userId: parseInt(userId as string),
        name: name as string,
        company: company as string,
        email: email as string,
        category: category as string,
        description: description as string,
        status: "pending",
        images: JSON.stringify(imageUrls),
      },
    });

    return NextResponse.json({ message: "Report submitted successfully", report });
  } catch (error) {
    console.error("Error submitting report:", error);
    return NextResponse.json({ message: "Error submitting report" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const reports = await prisma.report.findMany();
    return NextResponse.json({ message: "OK", data: reports });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json({ message: "Error fetching reports" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, problem_report } = body;

    const report = await prisma.report.findUnique({
      where: { id }
    });

    const updatedReport = await prisma.report.update({
      where: { id },
      data: {
        problem_report: problem_report,
        status: "resolved", 
      },
    });


    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: report?.email,
      subject: 'Your Support Report Has Been Resolved',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333333;
              }
              .email-container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #ffffff;
              }
              .header {
                background-color: #4CAF50;
                color: white;
                padding: 20px;
                text-align: center;
                border-radius: 5px 5px 0 0;
              }
              .content {
                padding: 20px;
                background-color: #f9f9f9;
                border: 1px solid #dddddd;
                border-radius: 0 0 5px 5px;
              }
              .response-box {
                background-color: #ffffff;
                border-left: 4px solid #4CAF50;
                padding: 15px;
                margin: 20px 0;
              }
              .footer {
                text-align: center;
                margin-top: 20px;
                padding-top: 20px;
                border-top: 1px solid #dddddd;
                color: #666666;
                font-size: 12px;
              }
              .button {
                display: inline-block;
                padding: 10px 20px;
                background-color: #4CAF50;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                margin-top: 15px;
              }
            </style>
          </head>
          <body>
            <div class="email-container">
              <div class="header">
                <h1 style="margin: 0;">Support Report Resolution</h1>
              </div>
              <div class="content">
                <p>Dear ${report?.name},</p>
                <p>We are pleased to inform you that your support report has been resolved by our team.</p>
                
                <div class="response-box">
                  <h3 style="margin-top: 0;">Admin Response:</h3>
                  <p style="margin-bottom: 0;">${problem_report}</p>
                </div>

                <p>Report Details:</p>
                <ul>
                  <li>Category: ${report?.category}</li>
                  <li>Status: Resolved</li>
                  <li>Resolution Date: ${new Date().toLocaleDateString()}</li>
                </ul>

                <p>If you need to review your report or have any additional questions, please don't hesitate to contact us.</p>
                
              </div>
              
              <div class="footer">
                <p>This is an automated message, please do not reply directly to this email.</p>
                <p>© ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `
    }

    await transporter.sendMail(mailOptions);
    
    return NextResponse.json({ message: "Report updated successfully", updatedReport });
  } catch (error) {
    console.error("Error updating report:", error);
    return NextResponse.json({ message: "Error updating report" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json(); 

    const deletedReport = await prisma.report.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Report deleted successfully", deletedReport });
  } catch (error) {
    console.error("Error deleting report:", error);
    return NextResponse.json({ message: "Error deleting report" }, { status: 500 });
  }
}