export default function ProductGallery({
  products,
}: {
  products: any[];
}) {
  return (
    <section className="mb-32">
      <h2 className="mb-12 text-4xl md:text-5xl font-bold tracking-tighter leading-tight text-center">
        Available Now
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
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
            <div key={index} className="group">
              {imageUrl && (
                <div className="mb-6 overflow-hidden rounded-lg bg-gray-100">
                  <img 
                    src={imageUrl} 
                    alt={product.title}
                    className="w-full h-auto shadow-sm transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              )}
              <h3 className="text-2xl md:text-3xl font-bold mb-3">{product.title}</h3>
              <p className="text-lg text-gray-600 leading-relaxed">{product.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}