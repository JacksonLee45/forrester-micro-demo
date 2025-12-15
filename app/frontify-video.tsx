"use client";

interface FrontifyVideoItem {
  src?: string;
  preview_url?: string;
  dynamic_url?: string;
  // Contentstack format (camelCase)
  previewUrl?: string;
  dynamicPreviewUrl?: string;
  downloadUrl?: string;
  title?: string;
  name?: string;
  type?: string;
  extension?: string;
  [key: string]: any;
}

type FrontifyVideoData = FrontifyVideoItem | FrontifyVideoItem[];

export default function FrontifyVideo({ videoData }: { videoData: FrontifyVideoData }) {
  if (!videoData) {
    return null;
  }

  // Handle if videoData is an array - get the first item
  const videoItem: FrontifyVideoItem = Array.isArray(videoData) ? videoData[0] : videoData;

  if (!videoItem) {
    console.error("No video item found in array");
    return null;
  }

  console.log("=== FRONTIFY VIDEO COMPONENT ===");
  console.log("Video item:", videoItem);
  console.log("Type:", videoItem.type);
  console.log("Extension:", videoItem.extension);

  // For videos, prioritize downloadUrl (actual video file) over previewUrl (thumbnail)
  let videoUrl: string | undefined = "";
  
  if (videoItem.type === "Video" || videoItem.extension === "mp4") {
    // It's a video - use downloadUrl first (the actual video file)
    videoUrl = videoItem.downloadUrl || 
               videoItem.src || 
               videoItem.dynamicPreviewUrl ||
               videoItem.dynamic_url ||
               videoItem.previewUrl ||
               videoItem.preview_url;
    
    console.log("Video URL (prioritizing downloadUrl):", videoUrl);
  } else {
    // Not a video - use preview URLs
    videoUrl = videoItem.src || 
               videoItem.preview_url || 
               videoItem.dynamic_url ||
               videoItem.previewUrl ||
               videoItem.dynamicPreviewUrl ||
               videoItem.downloadUrl;
    
    console.log("Media URL:", videoUrl);
  }

  if (!videoUrl) {
    console.error("No video URL found in Frontify data");
    return null;
  }

  const videoTitle = videoItem.title || videoItem.name || "Featured Video";

  return (
    <section className="mb-24">
      <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white uppercase mb-8 text-center">
        Featured Video
      </h2>
      <div className="relative w-full max-w-5xl mx-auto rounded-lg overflow-hidden bg-black">
        <video
          src={videoUrl}
          controls
          className="w-full h-auto"
          playsInline
          preload="metadata"
        >
          Your browser does not support the video tag.
        </video>
        <p className="text-gray-500 text-sm text-center mt-2">{videoTitle}</p>
      </div>
    </section>
  );
}