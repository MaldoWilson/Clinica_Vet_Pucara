"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

type CarouselImage = {
  src: string;
  alt?: string;
};

type ImageCarouselProps = {
  images: CarouselImage[];
  intervalMs?: number;
  className?: string;
  aspectRatio?: string; // e.g. "aspect-[16/9]" or "aspect-[3/1]"
};

export default function ImageCarousel({
  images,
  intervalMs = 3500,
  className,
  aspectRatio ="aspect-[4/3] sm:aspect-[16/9] lg:aspect-[3/1]"
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastInteractionRef = useRef<number>(Date.now());

  const safeImages = useMemo(() => images.filter(Boolean), [images]);

  const goTo = (index: number) => {
    if (safeImages.length === 0) return;
    setCurrentIndex((index + safeImages.length) % safeImages.length);
  };

  const next = () => goTo(currentIndex + 1);
  const prev = () => goTo(currentIndex - 1);

  const resetAutoplay = () => {
    lastInteractionRef.current = Date.now();
    if (timerRef.current) clearInterval(timerRef.current as unknown as number);
    startAutoplay();
  };

  const startAutoplay = () => {
    if (safeImages.length <= 1) return;
    timerRef.current = setInterval(() => {
      // Evitar avanzar si hubo interacción en los últimos 1s
      if (Date.now() - lastInteractionRef.current < 1000) return;
      setCurrentIndex((idx) => (idx + 1) % safeImages.length);
    }, intervalMs) as unknown as NodeJS.Timeout;
  };

  useEffect(() => {
    startAutoplay();
    return () => {
      if (timerRef.current)
        clearInterval(timerRef.current as unknown as number);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs, safeImages.length]);

  if (!safeImages || safeImages.length === 0) return null;

  return (
    <div
    className={"relative w-full overflow-hidden bg-transparent " + (className ?? "")
      }
    >
      <div className={`${aspectRatio} relative bg-transparent`}>
        {safeImages.map((img, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={img.src}
              alt={img.alt ?? `slide-${index + 1}`}
              fill
              priority={index === 0}
              className="object-cover"
              sizes="(max-width: 640px) 100vw,
              (max-width: 1024px) 100vw,
              (max-width: 1536px) 100vw,
              1536px"
            />
          </div>
        ))}
      </div>

      <button
        aria-label="Anterior"
        onClick={() => {
          prev();
          resetAutoplay();
        }}
        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 text-white
             p-3 sm:p-3 md:p-3 lg:p-2 hover:bg-black/70 focus:outline-none transition-all z-10"
      >
        ‹
      </button>
      <button
        aria-label="Siguiente"
        onClick={() => {
          next();
          resetAutoplay();
        }}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 text-white
             p-3 sm:p-3 md:p-3 lg:p-2 hover:bg-black/70 focus:outline-none transition-all z-10"
      >
        ›
      </button>

      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {safeImages.map((_, i) => (
          <button
            key={`dot-${i}`}
            aria-label={`Ir al slide ${i + 1}`}
            onClick={() => {
              goTo(i);
              resetAutoplay();
            }}
            className={`h-2 w-2 rounded-full transition-all duration-300 ${
              i === currentIndex
                ? "bg-white scale-125"
                : "bg-white/60 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
