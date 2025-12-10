"use client";

interface FrontifyVideoItem {
  src?: string;
  preview_url?: string;
  dynamic_url?: string;
  title?: string;
  name?: string;
  type?: string;
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

  // Extract the video URL - Frontify uses 'src' or 'preview_url'
  const videoUrl = videoItem.src || videoItem.preview_url || videoItem.dynamic_url;

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
      </div>
    </section>
  );
}