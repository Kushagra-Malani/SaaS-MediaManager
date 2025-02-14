// we are going to use Prisma Client to establish a connection to the database and then we will be fetching(retrieving/grab) data from the database.
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient()

export async function GET() {
    try {
        const videos = await prisma.video.findMany({
            orderBy: {createdAt: 'desc'}
        })
        console.log("Videos array from api/videos:", videos);

        return NextResponse.json(videos)
    } catch (error: unknown) {
        console.log("Error from api/videos: ", error);
        return NextResponse.json({error: "Error fetching videos from database"}, {status: 500})
    } finally{
        await prisma.$disconnect()
    }
}