"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type NavItem = { label: string; href: string; emoji: string; disabled?: boolean };

type Section = {
  id: string;
  label: string;
  items: NavItem[];
};

export default function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("admin_sidebar_collapsed") : null;
    if (saved) setCollapsed(saved === "1");
  }, []);

  // Detectar breakpoint para que en móvil siempre esté expandido
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    if (mq.addEventListener) {
      mq.addEventListener("change", update);
    } else {
      // Safari/antiguos
      // @ts-ignore
      mq.addListener(update);
    }
    return () => {
      if (mq.removeEventListener) {
        mq.removeEventListener("change", update);
      } else {
        // @ts-ignore
        mq.removeListener(update);
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("admin_sidebar_collapsed", collapsed ? "1" : "0");
    }
  }, [collapsed]);

  const sections: Section[] = useMemo(() => [
    {
      id: "contenido",
      label: "Contenido",
      items: [
        { label: "Blogs", href: "/admin/blogs", emoji: "📝" },
        { label: "Productos", href: "/admin/productos", emoji: "🛍️" },
        { label: "Servicios", href: "/admin/servicios", emoji: "💼" },
        { label: "Equipo", href: "/admin/equipo", emoji: "👥" },
      ],
    },
    {
      id: "mascotas",
      label: "Mascotas",
      items: [
        { label: "Citas", href: "/admin/citas", emoji: "📅" },
        { label: "Fichas", href: "/admin/fichas", emoji: "📋" },
        { label: "Pacientes", href: "/admin/pacientes", emoji: "🐾" },
        { label: "Recetas", href: "/admin/recetas", emoji: "💊" },
        { label: "Certificados", href: "/admin/certificados", emoji: "📄" },
      ],
    },
    {
      id: "gestion",
      label: "Gestión",
      items: [
        { label: "Horarios", href: "/admin/horarios", emoji: "⏰" },
        { label: "Ingresos/Egresos", href: "#", emoji: "📈", disabled: true },
        { label: "Stock", href: "#", emoji: "📦", disabled: true },
      ],
    },
  ], []);

  useEffect(() => {
    // Abrir automáticamente la sección que contiene la ruta actual
    const nextOpen: Record<string, boolean> = {};
    sections.forEach(sec => {
      nextOpen[sec.id] = sec.items.some(it => pathname?.startsWith(it.href));
    });
    setOpen(prev => ({ ...prev, ...nextOpen }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const isCollapsed = isDesktop && collapsed;

  return (
    <aside className={`bg-white border-r transition-all duration-300 shrink-0 h-full w-64 ${isCollapsed ? "md:w-16" : "md:w-64"}`}> 
      <div className="h-16 flex items-center justify-between px-3 border-b">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="text-lg">📊</span>
          {!isCollapsed && (<span className="font-semibold text-gray-900">Dashboard</span>)}
        </Link>
        <button
          aria-label="Contraer/expandir sidebar"
          className="p-2 rounded hover:bg-gray-100 hidden md:inline-flex"
          onClick={() => setCollapsed(v => !v)}
          title={collapsed ? "Expandir" : "Contraer"}
        >
          <span className="text-base">{collapsed ? "»" : "«"}</span>
        </button>
      </div>

      <nav className="py-3">
        {sections.map(section => (
          <div key={section.id}>
            <button
              className={`w-full flex items-center ${isCollapsed ? "justify-center" : "justify-between"} px-3 py-2 text-left text-sm font-semibold text-gray-700 hover:bg-gray-50`}
              onClick={() => setOpen(o => ({ ...o, [section.id]: !o[section.id] }))}
            >
              {!isCollapsed && <span>{section.label}</span>}
              {isCollapsed ? (
                <span className="sr-only">{section.label}</span>
              ) : (
                <span className={`text-xs transition-transform ${open[section.id] ? "rotate-180 inline-block" : ""}`}>▼</span>
              )}
            </button>
            <div className={`${open[section.id] ? "max-h-[800px]" : "max-h-0"} overflow-hidden transition-all`}>
              {section.items.map(item => {
                const active = item.href !== "#" && pathname?.startsWith(item.href);
                const isDisabled = item.disabled;
                const className = `flex items-center gap-3 ${isCollapsed ? "justify-center" : "px-5"} py-2 text-sm ${active ? "text-indigo-500 font-medium" : "text-gray-700"} ${isDisabled ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"}`;
                if (isDisabled) {
                  return (
                    <div key={item.label} className={className} title="Próximamente">
                      <span className="text-base">{item.emoji}</span>
                      {!isCollapsed && <span>{item.label}</span>}
                    </div>
                  );
                }
                return (
                  <Link key={item.href} href={item.href} className={className}>
                    <span className={`text-base ${active ? "" : "text-gray-500"}`}>{item.emoji}</span>
                    {!isCollapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}


