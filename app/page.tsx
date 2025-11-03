import { draftMode } from "next/headers";
import { getAllProducts } from "@/lib/api";
import ProductGallery from "./product-gallery";

function Intro() {
  return (
    <section className="text-center mt-16 mb-20 md:mb-24">
      <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-tight mb-2">
        Micro
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
    <div className="container mx-auto px-5">
      <Intro />
      {products && products.length > 0 && (
        <ProductGallery products={products} />
      )}
    </div>
  );
}