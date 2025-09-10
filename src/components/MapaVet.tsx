"use client";

type Props = {
  /** Texto de búsqueda: dirección exacta, nombre del lugar o coordenadas "lat,lng" */
  query: string;
  /** Altura del mapa (tailwind). Ej: "h-[320px]" */
  heightClass?: string;
};

export default function MapEmbed({ query, heightClass = "h-[360px] md:h-[420px]" }: Props) {
  const src = `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;

  return (
    <div className={`w-full rounded-xl overflow-hidden border ${heightClass}`}>
      <iframe
        title="Ubicación en Google Maps"
        src={src}
        className="w-full h-full"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
