import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    const id = params.id;
    //console.log("Server" ,id)
  
    if (!id) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
  
    try {
      await prisma.appointment.delete({
        where: { id: Number(id) },
      });
      return NextResponse.json({ message: 'Appointment successfully deleted' }, { status: 200 });
    } catch (error) {
      console.error('Failed to delete appointment:', error);
      return NextResponse.json({ error: 'Failed to delete appointment' }, { status: 500 });
    }
  }

  export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    const id = params.id;
  
    if (!id) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
  
    try {
      await prisma.appointment.update({
        where: { id: Number(id) },
        data: { status: "completed" },
      });
      return NextResponse.json({ message: 'Appointment successfully updated' }, { status: 200 });
    } catch (error) {
      console.error('Failed to update appointment:', error);
      return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 });
    }
  }

