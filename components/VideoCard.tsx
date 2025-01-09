import React, {useState, useEffect, useCallback} from 'react';
import { getCldImageUrl, getCldVideoUrl } from 'next-cloudinary';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {filesize} from "filesize";
import { Video } from '@/types/index'
import { Download, Clock, FileDown, FileUp } from "lucide-react";
// lucide-react gives us the icons that we use in the video card

dayjs.extend(relativeTime)

interface VideoCardProps {
    video: Video;  // we grad the Video from prisma
    onDownload: (url: string, title: string) => void; // when we click on the download button, then this function will be called

}

const VideoCard: React.FC<VideoCardProps> = ({video, onDownload}) => {

    const [isHovered, setIsHovered] = useState(false) // this state check if are hovering our mouse over the video card/thumbnail
    const [previewError, setPreviewError] = useState(false)  // this state checks if there is an error while previewing the video

    const getThumbnailUrl = useCallback((publicId: string) => {
        const thumbnailUrl = getCldImageUrl({
            width: 400,
            height: 225,
            src: publicId,
            crop: 'fill',
            gravity: 'auto',
            format: "jpg",
            quality: "auto",
            assetType: "video"

        });
        return thumbnailUrl
    },[])

    const getFullVideoUrl = useCallback((publicId: string) => {
        const fullVideoUrl = getCldVideoUrl({  // hitesh sir used the getCldImageUrl function as the thumbnail is an image
            width: 1920,
            height: 1080,
            src: publicId,  // we don't need crop, gravity, ect as we are using the full video
        });
        return fullVideoUrl
    },[])

    const getPreviewVideoUrl = useCallback((publicId: string) => {
        const previewVideoUrl = getCldVideoUrl({  // hitesh sir used the getCldImageUrl function as the thumbnail is an image
            width: 400,
            height: 225,
            src: publicId,
            rawTransformations: ["e_preview: duration_15:min_seg_dur_1:max_seg_9"]
        });
        return previewVideoUrl
    },[])

    const readableFileSize = useCallback((size: number) => {
        return filesize(size, {standard: "jedec"})  // hitesh sir didn't use standard: jedec
    }, [])

    // The formatDuration function takes a number of seconds as input and 
    // formats it into a string representation of minutes and seconds (MM:SS) format.
    const formatDuration = useCallback((seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.round(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
    }, []);

    const compressionPercentage = useCallback(() => {
        const originalSize = video.originalSize
        const compressedSize = video.compressedSize
        const percentage = ((Number(originalSize) - Number(compressedSize)) / Number(originalSize)) * 100
        return percentage.toFixed(2)
    }, [])

    useEffect(() => {
        setPreviewError(false)
    },[isHovered])

    const handlePreviewError = () => {
        setPreviewError(true);
    };

    return (
        // The mouse hover event is applied on the whole card
        <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
            <figure className="aspect-video relative">
                {isHovered ? (
                    previewError ? (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <p className="text-red-500">Preview not available</p>
                        </div>
                    ) : (
                        <video
                            src={getPreviewVideoUrl(video.publicId)}
                            autoPlay
                            muted
                            loop
                            className="w-full h-full object-cover"
                            onError={handlePreviewError}
                        />
                    )
                ) : (
                    <img
                        src={getThumbnailUrl(video.publicId)}
                        alt={video.title}
                        className="w-full h-full object-cover"
                    />
                )}

                <div className="absolute bottom-2 right-2 bg-base-100 bg-opacity-70 px-2 py-1 rounded-lg text-sm flex items-center">
                    <Clock size={16} className="mr-1" />
                    {formatDuration(video.duration)}
                </div>
            </figure>
            <div className="card-body p-4">
                <h2 className="card-title text-lg font-bold">{video.title}</h2>
                <p className="text-sm text-base-content opacity-70 mb-4">{video.description}</p>
                <p className="text-sm text-base-content opacity-70 mb-4">Uploaded {dayjs(video.createdAt).fromNow()}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center">
                    <FileUp size={18} className="mr-2 text-primary" />
                        <div>
                            <div className="font-semibold">Original</div>
                            <div>{readableFileSize(Number(video.originalSize))}</div>
                        </div>
                    </div>
                    <div className="flex items-center">
                    <FileDown size={18} className="mr-2 text-secondary" />
                        <div>
                            <div className="font-semibold">Compressed</div>
                            <div>{readableFileSize(Number(video.compressedSize))}</div>
                        </div>
                    </div>
                </div>
                <div className="flex justify-between items-center mt-4">
                    <div className="text-sm font-semibold">
                        Compression:{compressionPercentage()}%
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={() => onDownload(getFullVideoUrl(video.publicId), video.title)}>
                        <Download size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default VideoCard;