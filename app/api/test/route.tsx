
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await getServerSession();
    console.log(session)

    return NextResponse.json({message:"session:" , session})
}