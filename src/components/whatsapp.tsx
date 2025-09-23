// Componente de whatsapp
type Props = {
  phone?: string;     
  text?: string;        // mensaje opcional
  floating?: boolean;   // para botón flotante
};

export default function WhatsAppButton({ phone, text, floating = true }: Props) {
  const envPhone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "";
  const phoneNumber = (phone && phone.trim()) ? phone : envPhone;
  const href = phoneNumber
    ? `https://wa.me/${phoneNumber}${text ? `?text=${encodeURIComponent(text)}` : ""}`
    : "#";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      className={
        floating
          ? "fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-full px-4 py-3 bg-green-500 text-white font-semibold shadow-lg hover:bg-green-600 focus:outline-none"
          : "inline-flex items-center gap-2 rounded-xl px-4 py-2 bg-green-500 text-white hover:bg-green-600"
      }
    >
      {/* ícono simple con SVG */}
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5 fill-current">
        <path d="M20.52 3.48A11.94 11.94 0 0 0 12.06 0C5.5 0 .15 5.35.15 11.93c0 2.1.55 4.16 1.6 5.98L0 24l6.27-1.64a11.85 11.85 0 0 0 5.79 1.47h.01c6.56 0 11.91-5.35 11.91-11.92 0-3.18-1.24-6.17-3.46-8.43ZM12.08 21.3h-.01a9.4 9.4 0 0 1-4.79-1.31l-.34-.2-3.72.97.99-3.63-.22-.37a9.42 9.42 0 1 1 8.09 4.54Zm5.45-7.03c-.3-.15-1.77-.87-2.05-.97-.28-.1-.48-.15-.69.15-.2.3-.79.97-.97 1.17-.18.2-.36.22-.66.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.74-1.65-2.03-.17-.3-.02-.46.13-.61.14-.14.3-.36.45-.54.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.07-.15-.69-1.66-.95-2.28-.25-.6-.5-.52-.69-.53l-.58-.01c-.2 0-.52.07-.79.38-.27.3-1.04 1.02-1.04 2.47 0 1.45 1.07 2.85 1.22 3.04.15.2 2.09 3.2 5.06 4.49.71.31 1.27.49 1.7.63.72.23 1.37.2 1.88.12.57-.09 1.77-.72 2.02-1.41.25-.69.25-1.28.18-1.41-.07-.13-.27-.21-.57-.36Z"/>
      </svg>
      <span>WhatsApp</span>
    </a>
  );
}
