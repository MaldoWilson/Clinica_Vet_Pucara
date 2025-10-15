"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseClient";

type Item = { label: string; href: string; icon: JSX.Element; disabled?: boolean };

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [showLogout, setShowLogout] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    supabaseBrowser()
      .auth.getUser()
      .then(({ data }) => {
        if (!mounted) return;
        const e = data.user?.email || "Admin";
        setEmail(e);
      })
      .catch(() => setEmail("Admin"));
    return () => {
      mounted = false;
    };
  }, []);

  // Secciones
  const mascotaItems: Item[] = [
    {
      label: "Crear Ficha",
      href: "/admin/fichas",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
    },
    {
      label: "Pacientes",
      href: "/admin/pacientes",
      icon: <span className="text-lg leading-none">🐾</span>,
    },
  ];

  const gestionItems: Item[] = [
    {
      label: "Horarios",
      href: "/admin/horarios",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: "Citas",
      href: "/admin/citas",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: "Calendario",
      href: "/admin/calendario",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M3 11h18M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
        </svg>
      ),
    },
    {
      label: "Flujo de Caja",
      href: "/admin/flujo-caja",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3v18h18M7 13l3-3 4 4 5-6" />
        </svg>
      ),
    },
    {
      label: "Gestión de Stock",
      href: "/admin/stock",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M5 11h14M7 15h10" />
        </svg>
      ),
    },
  ];

  const contenidoItems: Item[] = [
    {
      label: "Formularios",
      href: "/admin/formularios",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6M8 6h8a2 2 0 012 2v10a2 2 0 01-2 2H8l-4-4V8a2 2 0 012-2h2z" />
        </svg>
      ),
    },
    {
      label: "Productos",
      href: "/admin/productos",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V7a2 2 0 00-2-2h-3l-2-2-2 2H8a2 2 0 00-2 2v6m14 0v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4m16 0H4" />
        </svg>
      ),
    },
    {
      label: "Servicios",
      href: "/admin/servicios",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      label: "Equipo",
      href: "/admin/equipo",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-5-4m-5 6h5v-2a4 4 0 00-5-4m-6 6h5v-2a4 4 0 00-5-4m5-4a3 3 0 110-6 3 3 0 010 6z" />
        </svg>
      ),
    },
    {
      label: "Blogs",
      href: "/admin/blogs",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20l9-5-9-5-9 5 9 5zm0-10V4m0 6l9-5m-9 5L3 5" />
        </svg>
      ),
    },
  ];

  return (
    <aside className="w-64 md:w-72 md:h-screen bg-white border-r border-gray-200 flex flex-col md:sticky md:top-0">
      <div className="px-4 py-5 border-b">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="relative h-8 w-8 rounded-full overflow-hidden bg-white">
            <Image src="/logo.webp" alt="Veterinaria Pucará" width={32} height={32} className="h-full w-full object-cover" />
          </div>
          <div>
            <p className="text-base font-semibold text-gray-900">Veterinaria Pucará</p>
            <p className="text-xs text-gray-500">Gestión Veterinaria</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 min-h-0 p-4 space-y-4 overflow-y-auto">
        {/* Mascota */}
        <div>
          <p className="px-4 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Mascota</p>
          {mascotaItems.map((item) => {
          const active = !item.disabled && pathname?.startsWith(item.href);
          const common = `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium`;
          if (item.disabled) {
            return (
                <div key={item.label} className={`${common} text-gray-500 bg-gray-100 cursor-not-allowed`} title="Próximamente">
                {item.icon}
                <span>{item.label}</span>
                  <span className="ml-auto text-[10px] uppercase rounded-full bg-gray-300 text-gray-700 px-2 py-0.5">Pronto</span>
              </div>
            );
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${common} transition-colors ${active ? "bg-indigo-500 text-white" : "text-gray-700 hover:bg-gray-50"}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
          })}
        </div>

        {/* Gestión */}
        <div>
          <p className="px-4 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Gestión</p>
          {gestionItems.map((item) => {
            const active = !item.disabled && pathname?.startsWith(item.href);
            const common = `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium`;
            if (item.disabled) {
              return (
                <div key={item.label} className={`${common} text-gray-500 bg-gray-100 cursor-not-allowed`} title="Próximamente">
                  {item.icon}
                  <span>{item.label}</span>
                  <span className="ml-auto text-[10px] uppercase rounded-full bg-gray-300 text-gray-700 px-2 py-0.5">Pronto</span>
                </div>
              );
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${common} transition-colors ${active ? "bg-indigo-500 text-white" : "text-gray-700 hover:bg-gray-50"}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Contenido */}
        <div>
          <p className="px-4 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Contenido</p>
          {contenidoItems.map((item) => {
            const active = !item.disabled && pathname?.startsWith(item.href);
            const common = `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium`;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${common} transition-colors ${active ? "bg-indigo-500 text-white" : "text-gray-700 hover:bg-gray-50"}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="p-4 border-t mt-auto">
        <button
          onClick={() => setShowLogout((v) => !v)}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
          aria-expanded={showLogout}
        >
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-400 text-white flex items-center justify-center">
            N
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-900">Veterinario</p>
            <p className="text-xs text-gray-500 truncate">{email || "Admin"}</p>
          </div>
          <svg className={`ml-auto w-4 h-4 text-gray-500 transition-transform ${showLogout ? "rotate-180" : "rotate-0"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <div className={`overflow-hidden transition-all ${showLogout ? "max-h-20 mt-2" : "max-h-0"}`}>
          <button
            onClick={async () => {
              await supabaseBrowser().auth.signOut();
              router.push("/admin/login");
            }}
            className="w-full px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </aside>
  );
}

