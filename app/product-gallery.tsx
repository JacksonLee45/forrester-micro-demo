export default function ProductGallery({
  products,
}: {
  products: any[];
}) {
  return (
    <section className="mb-32">
      <h2 className="mb-12 text-5xl md:text-6xl font-bold tracking-tighter leading-tight text-center">
        Our Products
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                <div className="mb-4 overflow-hidden">
                  <img 
                    src={imageUrl} 
                    alt={product.title}
                    className="w-full h-auto shadow-small transition-transform duration-200 group-hover:scale-105"
                  />
                </div>
              )}
              <h3 className="text-2xl font-bold mb-2">{product.title}</h3>
              <p className="text-lg text-gray-600">{product.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}