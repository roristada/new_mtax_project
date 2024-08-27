import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { title, content, email, category } = await request.json();

    // Find the user by email
    const authorCheck = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!authorCheck) {
      return NextResponse.json({ error: "Author not found" }, { status: 404 });
    }

    const createPost = await prisma.post.create({
      data: {
        title,
        author: {
          connect: { id: authorCheck.id },
        },
        content,
        category,
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

export async function GET(){
  try {
    const data = await prisma.post.findMany({
      include: {
        author: {
          select: {
            name: true,
          },
        },
      },
    });
    
    console.log(data)
    return NextResponse.json(data, {status: 200});

  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}


