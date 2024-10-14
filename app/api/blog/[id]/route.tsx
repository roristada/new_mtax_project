import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Storage } from '@google-cloud/storage';

const prisma = new PrismaClient();

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: {
    client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
});

const bucketName = 'mtax-storage-file';

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  if (!id) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const post = await prisma.post.findUnique({
    where: { id: Number(id) },
  });

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  try {
    await prisma.post.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json(
      { message: "Post successfully deleted" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to delete Post:", error);
    return NextResponse.json(
      { error: "Failed to delete Post" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  if (!id) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { title, content, category, status } = body; // Extract data from the request body

    const updatedPost = await prisma.post.update({
      where: { id: Number(id) },
      data: {
        title,
        content,
        category,
        status: status || "completed", // Update with provided status or default to "completed"
      },
    });

    return NextResponse.json(
      { message: "Post successfully updated", post: updatedPost },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to update Post:", error);
    return NextResponse.json(
      { error: "Failed to update Post" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  try {
    if (!id) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Fetch post with the author information
    const post = await prisma.post.findUnique({
      where: { id: Number(id) },
      include: {
        author: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // If the post has a picture, generate a signed URL
    let pictureUrl = post.picture;
    if (pictureUrl && pictureUrl.startsWith('https://storage.googleapis.com/')) {
      const fileName = pictureUrl.split('/').pop();
      if (fileName) {
        const [url] = await storage
          .bucket(bucketName)
          .file(`blog_pic/${fileName}`)
          .getSignedUrl({
            version: 'v4',
            action: 'read',
            expires: Date.now() + 15 * 60 * 1000, // 15 minutes
          });
        pictureUrl = url;
      }
    }

    return NextResponse.json(
      { 
        message: "Post successfully fetched", 
        post: {
          ...post,
          picture: pictureUrl
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to fetch post:", error);
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    );
  }
}
