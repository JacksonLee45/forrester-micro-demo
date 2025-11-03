export default function ProductGallery({
  products,
}: {
  products: any[];
}) {
  return (
    <section className="mb-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
        {products.map((product, index) => {
          // Handle Frontify image format (array of objects)
          let imageUrl = "";
          
          if (Array.isArray(product.image) && product.image.length > 0) {
            const firstImage = product.image[0];
            imageUrl = firstImage.src || firstImage.preview_url || firstImage.dynamic_url || "";
          } else if (typeof product.image === "object" && product.image !== null) {
            imageUrl = product.image.src || product.image.url || product.image.preview_url || "";
          } else if (typeof product.image === "string") {
            imageUrl = product.image;
          }

          return (
            <div key={index} className="group relative bg-gradient-to-b from-gray-900 to-black">
              {imageUrl && (
                <div className="aspect-square overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
                  <img 
                    src={imageUrl} 
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              )}
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-4 text-white uppercase tracking-wide">
                  {product.title}
                </h3>
                <p className="text-base text-gray-400 leading-relaxed mb-6">
                  {product.description}
                </p>
                <button className="border border-white text-white px-6 py-2 text-sm uppercase tracking-wider hover:bg-white hover:text-black transition-colors duration-300">
                  Explore
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}