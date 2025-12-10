import { draftMode } from "next/headers";
import { getWebsiteContent } from "@/lib/api";
import { getFirstVideo } from "@/lib/video-api";
import ProductGallery from "./product-gallery";
import FrontifyVideo from "./frontify-video";

export default async function Page() {
  const { isEnabled } = await draftMode();
  const content = await getWebsiteContent(isEnabled);
  const video = await getFirstVideo(isEnabled);

  if (!content) {
    return (
      <div className="bg-black min-h-screen text-white flex items-center justify-center">
        <p>Loading content...</p>
      </div>
    );
  }

  const products = content.imagesCollection?.items || [];

  return (
    <div className="bg-black min-h-screen text-white">
      <nav className="border-b border-gray-800">
        <div className="container mx-auto px-5 py-6 flex items-center">
          <div className="flex items-center">
            <img 
              src="/micro-logo.svg" 
              alt="Micro" 
              className="h-8 w-auto"
            />
          </div>
        </div>
      </nav>
      <div className="container mx-auto px-5 pb-20">
        <section className="text-center mt-16 mb-24">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-none text-white uppercase mb-8">
            {content.heading || "Products"}
          </h1>
          <h2 className="text-3xl md:text-4xl font-light tracking-wide text-gray-500 mb-6">
            {content.subHeading || "Product Launch"}
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
            {content.headingDescription || "Discover our latest innovation."}
          </p>
        </section>
        {products.length > 0 && (
          <ProductGallery products={products} />
        )}
        {video && (
          <div className="mt-24">
            <FrontifyVideo videoData={video.video} />
          </div>
        )}
      </div>
    </div>
  );
}