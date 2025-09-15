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
  aspectRatio?: string; 
};

export default function ImageCarousel({
  images,
  intervalMs = 3500,
  className,
  aspectRatio = "aspect-[16/9]",
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
      // Evitar avanzar si hubo interacción en los últimos 2s
      if (Date.now() - lastInteractionRef.current < 2000) return;
      setCurrentIndex((idx) => (idx + 1) % safeImages.length);
    }, intervalMs) as unknown as NodeJS.Timeout;
  };

  useEffect(() => {
    startAutoplay();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current as unknown as number);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs, safeImages.length]);

  if (!safeImages || safeImages.length === 0) return null;

  return (
    <div className={"relative w-full" + (className ?? "")}>
      <div className={`${aspectRatio} relative w-full  mx-auto bg-transparent`}>
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
              className="object-contain"
              sizes="100vh"
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
        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60 focus:outline-none"
      >
        ‹
      </button>
      <button
        aria-label="Siguiente"
        onClick={() => {
          next();
          resetAutoplay();
        }}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60 focus:outline-none"
      >
        ›
      </button>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
        {safeImages.map((_, i) => (
          <button
            key={`dot-${i}`}
            aria-label={`Ir al slide ${i + 1}`}
            onClick={() => {
              goTo(i);
              resetAutoplay();
            }}
            className={`h-2 w-2 rounded-full transition-all ${
              i === currentIndex ? "w-5 bg-white" : "bg-white/60 hover:bg-white"
            }`}
          />
        ))}
      </div>
    </div>
  );
}


