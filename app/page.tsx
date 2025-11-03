import { draftMode } from "next/headers";
import { getAllProducts } from "@/lib/api";
import ProductGallery from "./product-gallery";

function Intro() {
  return (
    <section className="text-center mt-16 mb-24">
      <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-none text-white uppercase mb-8">
        Micro Speaker 2.0
      </h1>
      <h2 className="text-3xl md:text-4xl font-light tracking-wide text-gray-500 mb-6">
        Product Launch
      </h2>
      <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
        Discover our latest innovation - a revolutionary product that changes everything.
      </p>
    </section>
  );
}

export default async function Page() {
  const { isEnabled } = await draftMode();
  const products = await getAllProducts(isEnabled);

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
        <Intro />
        {products && products.length > 0 && (
          <ProductGallery products={products} />
        )}
      </div>
    </div>
  );
}