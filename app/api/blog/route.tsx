import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const prisma = new PrismaClient();

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
      const pictureName = `${Date.now()}-${picture.name}`;
      picturePath = path.join(process.cwd(), "public", "img_upload","blog_pic", pictureName); // Ensure path points to the right directory
      await fs.writeFile(picturePath, new Uint8Array(buffer)); // Write the buffer as Uint8Array
      picturePath = `/img_upload/blog_pic/${pictureName}`; // Store the relative path in the DB
    }

    const createPost = await prisma.post.create({
      data: {
        title,
        author: {
          connect: { id: authorCheck.id },
        },
        content,
        category,
        picture: picturePath, // Store image path in DB
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

