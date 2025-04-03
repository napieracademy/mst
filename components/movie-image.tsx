import Image from "next/image";
import { cn } from "@/atomic/utils/cn";

interface MovieImageProps {
  src: string | null;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
}

export function MovieImage({
  src,
  alt,
  fill = false,
  width,
  height,
  className,
  sizes,
  ...rest
}: MovieImageProps) {
  const baseImageUrl = "https://image.tmdb.org/t/p";
  const imageSize = fill ? "w500" : "w342";
  const imageUrl = src ? `${baseImageUrl}/${imageSize}${src}` : "/images/placeholder-poster.jpg";

  return (
    <Image
      src={imageUrl}
      alt={alt}
      fill={fill}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      sizes={sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
      className={cn(
        "object-cover transition-opacity duration-300",
        className
      )}
      {...rest}
    />
  );
} 