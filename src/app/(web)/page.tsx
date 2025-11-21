// Home Principal de la pagina web
import Hero from "@/components/Hero";
import LatestBlogs from "@/components/LatestBlogs";
import LatestProducts from "@/components/LatestProducts";
import { supabaseServer } from "@/lib/supabaseClient";
import WhatsAppButton from "@/components/whatsapp";
import ImageCarousel from "@/components/ImageCarousel";
import Image from "next/image";
import pageBanner from "@/app/img/fondo2.webp";
import ContactSection from "@/components/ContactSection";


export default async function Home() {
  const supa = supabaseServer();
  const { data: servicios } = await supa
    .from("servicios")
    .select("id, nombre, descripcion, precio_clp")
    .limit(6);

  return (
    <div className="bg-white">
      <ImageCarousel
        images={[
          { src: "/1.png", alt: "Clinica Vet Pucara 1", href: "/productos" },
          { src: "/3.png", alt: "Clinica Vet Pucara 2", href: "/servicios" },
          { src: "/4.png", alt: "Clinica Vet Pucara 3", href: "/productos" },
        ]}
        aspectRatio="aspect-[5/2] sm:aspect-[5/2] lg:aspect-[5/2]"
        intervalMs={4000}
        className="rounded-none shadow-none mt-4 px-2 sm:px-4"
      />

      <LatestProducts />
      <LatestBlogs />
      <ContactSection
        withBackground
        backgroundMode="section"
        minHeightClass="min-h-[680px]"
        showFloatingButton={false}
        anchorId="contacto"
      />
      <WhatsAppButton
        text="Hola Vengo desde la web y quiero agendar una hora de emergencia para mi mascota"
        floating // botón flotante abajo a la derecha
      />
    </div>

  );
}
