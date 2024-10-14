import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: {
    client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
});

const bucketName = 'mtax-storage-file';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const email = formData.get("email") as string;
    const category = formData.get("category") as string;
    const picture = formData.get("picture") as File | null;
    const status = formData.get("status") as string;
    console.log(status)

    const authorCheck = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!authorCheck) {
      return NextResponse.json({ error: "Author not found" }, { status: 404 });
    }

    let picturePath = null;
    if (picture) {
      const buffer = Buffer.from(await picture.arrayBuffer());
      const pictureName = `${uuidv4()}-${picture.name}`;
      
      // Upload the file to Google Cloud Storage
      const bucket = storage.bucket(bucketName);
      const blob = bucket.file(`blog_pic/${pictureName}`);
      await blob.save(buffer, {
        metadata: {
          contentType: picture.type,
        },
      });

      // Generate a public URL for the uploaded file
      picturePath = `https://storage.googleapis.com/${bucketName}/blog_pic/${pictureName}`;
    }

    const createPost = await prisma.post.create({
      data: {
        title,
        author: {
          connect: { id: authorCheck.id },
        },
        content,
        category,
        picture: picturePath, // Store the Google Cloud Storage URL in DB
        status
      },
    });

    return NextResponse.json(
      {
        message: "Post created successfully",
        post: createPost,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Fetch posts with author information
    const data = await prisma.post.findMany({
      include: {
        author: {
          select: {
            name: true,
          },
        },
      },
    });

    // Fetch unique categories
    const categories = await prisma.post.groupBy({
      by: ['category'],
      _count: {
        category: true, // Count the number of posts in each category (optional)
      },
    });


    // Format categories for easier access
    const categoryNames = categories.map((category) => category.category);

    // Return both posts and categories
    return NextResponse.json({ posts: data, categories: categoryNames }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}
