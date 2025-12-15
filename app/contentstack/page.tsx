import { getWebsiteContent, getFirstVideo } from "@/lib/contentstack-api";
import ProductGallery from "@/app/product-gallery";
import FrontifyVideo from "@/app/frontify-video";
import Link from "next/link";

export default async function ContentstackPage() {
  const content = await getWebsiteContent();
  const video = await getFirstVideo();

  console.log("=== CONTENTSTACK PAGE ===");
  console.log("Content:", content);
  console.log("Video:", video);
  console.log("Has video:", !!video);

  if (!content) {
    return (
      <div className="bg-black min-h-screen text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">No content found in Contentstack</p>
          <p className="text-gray-500 mb-8">Please set up your Contentstack content models and entries</p>
          <Link 
            href="/"
            className="border border-white text-white px-6 py-2 text-sm uppercase tracking-wider hover:bg-white hover:text-black transition-colors duration-300"
          >
            Back to Contentful
          </Link>
        </div>
      </div>
    );
  }

  const products = content.imagesCollection?.items || [];

  return (
    <div className="bg-black min-h-screen text-white">
      <nav className="border-b border-gray-800">
        <div className="container mx-auto px-5 py-6 flex items-center justify-between">
          <div className="flex items-center">
            <img 
              src="/micro-logo.svg" 
              alt="Micro" 
              className="h-8 w-auto"
            />
          </div>
          <div className="flex gap-4">
            <Link 
              href="/" 
              className="text-gray-400 hover:text-white transition-colors duration-300 px-4 py-2 text-sm uppercase tracking-wider"
            >
              Contentful
            </Link>
            <div className="text-white px-4 py-2 text-sm uppercase tracking-wider border-b-2 border-white">
              Contentstack
            </div>
          </div>
        </div>
      </nav>
      <div className="container mx-auto px-5 pb-20">
        <section className="text-center mt-16 mb-24">
          <div className="inline-block mb-6 px-4 py-1 bg-purple-900/30 border border-purple-500/50 rounded-full">
            <span className="text-purple-300 text-xs uppercase tracking-wider">Powered by Contentstack</span>
          </div>
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