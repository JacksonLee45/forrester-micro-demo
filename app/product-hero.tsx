export default function ProductHero({
  title,
  image,
  description,
}: {
  title: string;
  image: any;
  description: string;
}) {
  // Handle Frontify image format (array of objects)
  let imageUrl = "";
  
  if (Array.isArray(image) && image.length > 0) {
    // Frontify returns an array, get the first image
    const firstImage = image[0];
    imageUrl = firstImage.src || firstImage.preview_url || firstImage.dynamic_url || "";
  } else if (typeof image === "object" && image !== null) {
    // Fallback for object format
    imageUrl = image.src || image.url || image.preview_url || "";
  } else if (typeof image === "string") {
    // Direct URL string
    imageUrl = image;
  }

  return (
    <section className="mb-32">
      {imageUrl && (
        <div className="mb-8 md:mb-16">
          <img 
            src={imageUrl} 
            alt={title}
            className="w-full h-auto shadow-small"
          />
        </div>
      )}
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="mb-8 text-5xl md:text-6xl font-bold tracking-tighter leading-tight">
          {title}
        </h2>
        <p className="text-2xl leading-relaxed">
          {description}
        </p>
      </div>
    </section>
  );
}