import { v2 as cloudinary } from 'cloudinary';
import { NextResponse, NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// Configuration
cloudinary.config({ 
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

interface cloudinaryUploadResult {  // we have to write this just because we are using TypeScript
    public_id: string,
    [key: string]: any
}

export async function POST(request: NextRequest) {
    // first we check if the user is logged in or not
    const {userId} = await auth()

    if(!userId){
        return NextResponse.redirect(new URL('/sign-in', request.url))
    }

    // now we will be designing a full proof way to upload any type of file in cloudinary
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File 

        if(!file){
            return NextResponse.json({error: "File not found"}, {status: 400})
        }

        // file has a property called arrayBuffer which gives us the bytes and hence we can create the buffer
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        
        const result = await new Promise<cloudinaryUploadResult>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {folder: 'next-cloudinary-uploads'}, 
                (error, result) => {
                    if(error){
                        reject(error)
                    } else {
                        resolve(result as cloudinaryUploadResult)
                    }
                }
            )
            uploadStream.end(buffer)
        }
    )
    return NextResponse.json({publicId: result.public_id}, {status: 200})

    } catch (error) {
        console.log("Image upload error: ", error);
        return NextResponse.json({error: "Error uploading image"}, {status: 500})
    }
}