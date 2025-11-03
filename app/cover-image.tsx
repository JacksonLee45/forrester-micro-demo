import ContentfulImage from "../lib/contentful-image";

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

export default function CoverImage({
  title,
  url,
}: {
  title: string;
  url: string;
}) {
  return (
    <div className="sm:mx-0">
      <ContentfulImage
        alt={`Image for ${title}`}
        priority
        width={2000}
        height={1000}
        className="shadow-small"
        src={url}
      />
    </div>
  );
}