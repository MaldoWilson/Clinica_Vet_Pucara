import VetCardsDay from "@/components/VetCardsDay";
import WhatsAppButton from "@/components/whatsapp";

export default function ReservasPage() {
  return (
    <>
      <VetCardsDay />
      <WhatsAppButton
        phone="569"   // Pongamos numero para probar
        text="¡Hola! Vengo desde la web y quiero agendar una hora de emergencia"
        floating // botón flotante abajo a la derecha
      />
    </>
  );
}