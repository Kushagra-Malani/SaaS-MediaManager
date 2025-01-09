import { v2 as cloudinary } from 'cloudinary';
import { NextResponse, NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient()

// Configuration
cloudinary.config({ 
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

interface cloudinaryUploadResult {  // we have to write this just because we are using TypeScript
    public_id: string,
    bytes: number,
    duration?: number,  // ? means that this property is optional
    [key: string]: any
}

export async function POST(request: NextRequest) {
    
    try {
        // first we check if the user is logged in or not
        const {userId} = await auth()

        if(!userId){
            return NextResponse.redirect(new URL('/sign-in', request.url))
        }

        // checking if the cloudinary credentials are present or not
        if(!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET){
            return NextResponse.json({error: "Cloudinary credentials not found"}, {status: 500})
        }

        // now we will be designing a full proof way to upload any type of file in cloudinary

        const formData = await request.formData()
        const file = formData.get('file') as File | null;
        const title = formData.get('title') as string
        const description = formData.get('description') as string
        const originalSize = formData.get('originalSize') as string
        console.log("File api/video-upload:", file);
        console.log("Title api/video-upload:", title);
        console.log("Description api/video-upload:", description);
        console.log("OriginalSize api/video-upload:", originalSize);


        if(!file){
            return NextResponse.json({error: "File not found"}, {status: 400})
        }
        console.log("Got the file in api/video-upload: ", file);
        

        // file has a property called arrayBuffer which gives us the bytes and hence we can create the buffer
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        
        const result = await new Promise<cloudinaryUploadResult>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    resource_type: 'video',
                    folder: 'video-uploads',
                    transformation: [
                        {quality: 'auto', fetch_format: 'mp4'},
                    ]
                }, 
                (error, result) => {
                    if(error){
                        reject(error)
                    } 
                    else {
                        resolve(result as cloudinaryUploadResult)
                    }
                }
            )
            uploadStream.end(buffer)
            console.log("uploadStream api/video-upload: ", uploadStream);
        }
    )
    console.log("Result", result);
    const video = await prisma.video.create({
        data: {
            title,
            description,
            publicId: result.public_id,
            originalSize: originalSize,
            compressedSize: String(result.bytes),
            duration: result.duration || 0
        }
    })
    console.log("video at api/video-upload: ", video);
    
    return NextResponse.json(video)

    } catch (error) {
        console.log("Video upload error: ", error);
        return NextResponse.json({error: "Error uploading video"}, {status: 500})
    } finally{
        await prisma.$disconnect()
    }
}