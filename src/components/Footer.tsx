// Componente de footer 
/* eslint-disable jsx-a11y/aria-proptypes */
"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function Footer() {
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    comercial: false, // Productos y reservas
    informacion: false,
    sobre: false,
  });
  const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "contacto@clinicapucara.cl";
  const WHATSAPP_PHONE = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "5628592840";

  function toggleSection(key: keyof typeof openSections) {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }
  return (
    <footer className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 text-white ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Contenido principal del footer */}
        <div className="py-8 sm:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            
            {/* Logo y nombre - Lado derecho */}
            <div className="flex flex-col items-center lg:items-start space-y-4 order-2 lg:order-1">
              <Link 
                href="/" 
                className="flex items-center gap-3 group transition-transform duration-200 hover:scale-105"
              >
                <div className="relative">
                  <Image
                    src="/logo.png" 
                    alt="Clínica Pucará"
                    width={56}
                    height={56}
                    priority
                    className="transition-transform duration-200 group-hover:rotate-6 sm:w-16 sm:h-16"
                  />
                </div>
                <div className="text-center lg:text-left">
                  <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-400 to-indigo-300 bg-clip-text text-transparent">
                    Veterinaria Pucará
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1">
                    Veterinaria San Bernardo
                  </p>
                </div>
              </Link>
              
              {/* Información de contacto */}
              <div className="text-center lg:text-left space-y-1 sm:space-y-2 text-sm sm:text-base text-slate-300">
                <p>📍 Esmeralda 97, San Bernardo, Región Metropolitana</p>
                <p>📞 {WHATSAPP_PHONE ? `+${WHATSAPP_PHONE.replace(/^(?!\+)/, "")}` : "+56 2 859 2840"}</p>
                <p>✉️ {CONTACT_EMAIL}</p>
              </div>
            </div>

            {/* Columnas de información - Lado izquierdo */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 order-1 lg:order-2">
              
              {/* Atención  */}
              <div className="text-left">
                <button
                  className="w-full flex items-center justify-between text-left text-lg sm:text-xl font-semibold text-emerald-400 mb-3 sm:mb-4"
                  onClick={() => toggleSection("atencion")}
                  aria-controls="footer-atencion"
                >
                  <span className="text-indigo-400">Atención</span>
                  <svg
                    className={`h-5 w-5 transition-transform duration-200 sm:hidden text-indigo-400 hover:text-indigo-300 ${openSections.atencion ? "rotate-180" : "rotate-0"}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.25 8.29a.75.75 0 01-.02-1.08z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <ul id="footer-atencion" className={`${openSections.atencion ? "block" : "hidden"} sm:block space-y-1.5 sm:space-y-2 text-m sm:text-base text-slate-300`}>
                  <li>
                    <Link href="/reservas" className="hover:text-indigo-300 transition-colors block py-1">
                      Reserva hora
                    </Link>
                  </li>
                  <li>
                    <Link href="/productos" className="hover:text-indigo-300 transition-colors block py-1">
                    Productos
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Información */}
              <div className="text-left">
                <button
                  className="w-full flex items-center justify-between text-left text-lg sm:text-xl font-semibold text-emerald-400 mb-3 sm:mb-4"
                  onClick={() => toggleSection("informacion")}
                  aria-controls="footer-informacion"
                >
                  <span className="text-indigo-400">Información</span>
                  <svg
                    className={`h-5 w-5 transition-transform duration-200 sm:hidden text-indigo-400 hover:text-indigo-300 ${openSections.informacion ? "rotate-180" : "rotate-0"}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.25 8.29a.75.75 0 01-.02-1.08z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <ul id="footer-informacion" className={`${openSections.informacion ? "block" : "hidden"} sm:block space-y-1.5 sm:space-y-2 text-m sm:text-base text-slate-300`}>
                  <li>
                    <Link href="/blog" className="hover:text-indigo-300 transition-colors block py-1">
                      Blogs
                    </Link>
                  </li>
                  <li>
                    <Link href="/servicios" className="hover:text-indigo-300 transition-colors block py-1">
                      Servicios
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Sobre nosotros */}
              <div className="text-left">
                <button
                  className="w-full flex items-center justify-between text-left text-lg sm:text-xl font-semibold text-emerald-400 mb-3 sm:mb-4"
                  onClick={() => toggleSection("sobre")}
                  aria-controls="footer-sobre"
                >
                  <span className="text-indigo-400">Sobre nosotros</span>
                  <svg
                    className={`h-5 w-5 transition-transform duration-200 sm:hidden text-indigo-400 hover:text-indigo-300 ${openSections.sobre ? "rotate-180" : "rotate-0"}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.25 8.29a.75.75 0 01-.02-1.08z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <ul id="footer-sobre" className={`${openSections.sobre ? "block" : "hidden"} sm:block space-y-1.5 sm:space-y-2 text-m sm:text-base text-slate-300`}>
                  <li>
                    <Link href="/mision-vision" className="hover:text-indigo-300 transition-colors block py-1">
                      Misión y Visión
                    </Link>
                  </li>
                  <li>
                    <Link href="/equipo" className="hover:text-indigo-300 transition-colors block py-1">
                      Nuestro equipo
                    </Link>
                  </li>
                  <li>
                    <Link href="/contacto" className="hover:text-indigo-300 transition-colors block py-1">
                      Contacto
                    </Link>
                  </li>
                  <li>
                    <Link href="/contacto#mapa" className="hover:text-indigo-300 transition-colors block py-1">
                      Ubicación
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="border-t border-slate-600"></div>

        {/* Copyright */}
        <div className="py-4 sm:py-6 text-center">
          <p className="text-xs sm:text-sm text-slate-400">
            © {new Date().getFullYear()} Clínica Veterinaria Pucará – San Bernardo. 
            Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
