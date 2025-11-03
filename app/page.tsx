import { draftMode } from "next/headers";
import { getProduct } from "@/lib/api";
import ProductHero from "./product-hero";

function Intro() {
  return (
    <section className="flex-col md:flex-row flex items-center md:justify-between mt-16 mb-16 md:mb-12">
      <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-tight md:pr-8">
        Micro Product Launch
      </h1>
      <h2 className="text-center md:text-left text-lg mt-5 md:pl-8">
        Discover our latest innovation - a revolutionary product that changes everything.
      </h2>
    </section>
  );
}

export default async function Page() {
  const { isEnabled } = await draftMode();
  const product = await getProduct(isEnabled);

  return (
    <div className="container mx-auto px-5">
      <Intro />
      {product && (
        <ProductHero
          title={product.title}
          image={product.image}
          description={product.description}
        />
      )}
    </div>
  );
}