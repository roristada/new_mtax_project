import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

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



export async function PATCH(req: Request, { params }: { params: { id: string } }) {
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