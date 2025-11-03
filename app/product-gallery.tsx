export default function ProductGallery({
  products,
}: {
  products: any[];
}) {
  return (
    <section className="mb-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
        {products.map((product, index) => {
          // Handle Frontify image format
          let imageUrl = "";
          
          // Check if image exists and is an array (Frontify format)
          if (product.image && Array.isArray(product.image) && product.image.length > 0) {
            const firstImage = product.image[0];
            imageUrl = firstImage.src || firstImage.preview_url || firstImage.dynamic_url || "";
          }

          return (
            <div key={index} className="group relative bg-gradient-to-b from-gray-900 to-black">
              {imageUrl ? (
                <div className="aspect-square overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
                  <img 
                    src={imageUrl} 
                    alt={product.title || `Product ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              ) : (
                <div className="aspect-square overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                  <div className="text-gray-600 text-center p-8">
                    <p className="text-sm">No image available</p>
                  </div>
                </div>
              )}
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-4 text-white uppercase tracking-wide">
                  {product.title || `Product ${index + 1}`}
                </h3>
                <p className="text-base text-gray-400 leading-relaxed mb-6">
                  {product.description || ""}
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