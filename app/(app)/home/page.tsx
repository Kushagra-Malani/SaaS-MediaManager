"use client"
import React, {useState, useEffect, useCallback} from 'react'
import VideoCard from '@/components/VideoCard'
import axios from 'axios'
import { Video } from '@/types/index'

function HomePage() {
    const [videos, setVideos] = useState<Video[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchVideos = useCallback(async () => {
        try {
            setLoading(true)
            const response = await axios.get('/api/videos');
            console.log("Response array issue: ", response.data);
            if(Array.isArray(response.data)){
                setVideos(response.data)
            }
            else {
                throw new Error(" Unexpected response format");
            }
        } catch (error:unknown) {
            console.log(error);
            setError("Failed to fetch videos")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchVideos()
    }, [fetchVideos])

    const handleDownload = useCallback((url: string, title: string) => {
        // this function is called when we click on the download button
            const link = document.createElement("a");
            link.href = url;
            link.download = `${title}.mp4`;
            link.setAttribute("target", "_blank");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link); // now the video is downloaded and we do the cleanup
        
    }, [])

    if(loading){
        return <div>Loading...</div>
    }

    return (
        <div className="container mx-auto p-4">
             <h1 className="text-2xl font-bold mb-4">Videos</h1>
             {videos.length == 0 ? ( 
                error!=null ? (
                    <div className="text-center text-lg text-gray-500">${error}</div>
                ) : (
                    <div className="text-center text-lg text-gray-500">
                        No videos available
                    </div>
                )
             ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {videos.map((video) => (
                        <VideoCard key={video.id} video={video} onDownload={handleDownload} />
                    ))}
                </div>
             ) }
        </div>
    );
}

export default HomePage;