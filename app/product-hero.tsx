export default function ProductHero({
  title,
  image,
  description,
}: {
  title: string;
  image: any;
  description: string;
}) {
  // Parse image if it's a JSON string, otherwise use as-is
  let imageUrl = "";
  
  if (typeof image === "string") {
    try {
      const parsedImage = JSON.parse(image);
      imageUrl = parsedImage.url || parsedImage.src || "";
    } catch {
      imageUrl = image;
    }
  } else if (image && typeof image === "object") {
    imageUrl = image.url || image.src || "";
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