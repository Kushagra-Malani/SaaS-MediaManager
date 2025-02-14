'use client'
import React, {useState} from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

function VideoUpload() {

    const [file, setFile] = useState<File | null>(null)
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [isUploading, setIsUploading] = useState(false)

    const router = useRouter()

    const Max_File_Size = 70000000 // 70mb

    // handleSubmit function is used wneh we click on the uplaod video button which is a form
    const handleSubmit = async(event: React.FormEvent) => {
        event.preventDefault()
        if(!file){
            return
        }
        if(file.size > Max_File_Size){
            alert("File is too large, should be under 70mb")
            return
        }

        setIsUploading(true)
        // as the file is uploading so, it means that we are talking to prisma and need to give all the information required by the Video model in schema.prisma
        const formData = new FormData()
        formData.append('file', file)
        formData.append('title', title)
        formData.append('description', description)
        formData.append('originalSize', file.size.toString())
        console.log("Appended form data: ", formData.get('description'));

        try {
            /*
            const response = await axios.post('/api/video-upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            */
            // check for 200 response
            router.push("/")
        } catch (error) {
            console.log("error", error);
        } finally{
            setIsUploading(false)
        }
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Upload Video</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="label">
                      <span className="label-text">Title</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="input input-bordered w-full"
                      required
                    />
                </div>

                <div>
                    <label className="label">
                      <span className="label-text">Description</span>
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="textarea textarea-bordered w-full"
                    />
                </div>

                <div>
                    <label className="label">
                      <span className="label-text">Video File</span>
                    </label>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="file-input file-input-bordered w-full"
                      required
                    />
                </div>

                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isUploading}
                >
                    {isUploading ? "Uploading..." : "Upload video"}
                </button>
            </form>
        </div>
    );
}

export default VideoUpload;