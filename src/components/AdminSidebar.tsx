"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type NavItem = { label: string; href: string; disabled?: boolean };

type Section = {
  id: string;
  label: string;
  items: NavItem[];
  color: string;
  gradient: string;
};

export default function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("admin_sidebar_collapsed") : null;
    // En móvil, siempre iniciar expandido
    if (saved && typeof window !== "undefined" && window.innerWidth < 768) {
      setCollapsed(false);
    } else if (saved) {
      setCollapsed(saved === "1");
    }
  }, []);

  // Detectar breakpoint para que en móvil siempre esté expandido
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => {
      const wasDesktop = isDesktop;
      setIsDesktop(mq.matches);

      // Si cambiamos de móvil a desktop, restaurar estado colapsado desde localStorage
      if (!wasDesktop && mq.matches) {
        const saved = localStorage.getItem("admin_sidebar_collapsed");
        if (saved) {
          setCollapsed(saved === "1");
        }
      }
      // Si cambiamos de desktop a móvil, expandir
      else if (wasDesktop && !mq.matches) {
        setCollapsed(false);
      }
    };
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
  }, [isDesktop]);

  useEffect(() => {
    if (typeof window !== "undefined" && isDesktop) {
      localStorage.setItem("admin_sidebar_collapsed", collapsed ? "1" : "0");
    }
  }, [collapsed, isDesktop]);

  const sections: Section[] = useMemo(() => [
    {
      id: "mascotas",
      label: "Mascotas",
      color: "emerald",
      gradient: "from-emerald-500 to-teal-500",
      items: [
        { label: "Citas", href: "/admin/citas" },
        { label: "Fichas", href: "/admin/fichas" },
        { label: "Pacientes", href: "/admin/pacientes" },
        { label: "Calendario", href: "/admin/calendario" },
      ],
    },
    {
      id: "gestion",
      label: "Gestión",
      color: "orange",
      gradient: "from-orange-500 to-amber-500",
      items: [
        { label: "Horarios", href: "/admin/horarios" },
        { label: "Flujo de Caja", href: "/admin/flujo-caja" },
        { label: "Stock", href: "#", disabled: true },
      ],
    },
    {
      id: "contenido",
      label: "Contenido",
      color: "purple",
      gradient: "from-purple-500 to-pink-500",
      items: [
        { label: "Blogs", href: "/admin/blogs" },
        { label: "Productos", href: "/admin/productos" },
        { label: "Servicios", href: "/admin/servicios" },
        { label: "Equipo", href: "/admin/equipo" },
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

  // En móvil siempre expandido, en desktop puede estar colapsado
  // Cuando el componente está dentro del drawer móvil, usar window.innerWidth como fallback
  const effectiveIsDesktop = isDesktop || (typeof window !== "undefined" && window.innerWidth >= 768);
  const isCollapsed = effectiveIsDesktop && collapsed;

  // Helper para obtener clases de color según la sección
  const getSectionColors = (color: string, active: boolean = false) => {
    const colors: Record<string, any> = {
      emerald: {
        bg: 'bg-emerald-50',
        text: 'text-emerald-600',
        border: 'border-emerald-500',
        hover: 'hover:bg-emerald-50',
        gradient: 'bg-gradient-to-r from-emerald-500 to-teal-500'
      },
      orange: {
        bg: 'bg-orange-50',
        text: 'text-orange-600',
        border: 'border-orange-500',
        hover: 'hover:bg-orange-50',
        gradient: 'bg-gradient-to-r from-orange-500 to-amber-500'
      },
      purple: {
        bg: 'bg-purple-50',
        text: 'text-purple-600',
        border: 'border-purple-500',
        hover: 'hover:bg-purple-50',
        gradient: 'bg-gradient-to-r from-purple-500 to-pink-500'
      }
    };
    return colors[color] || colors.emerald;
  };

  return (
    <aside className={`bg-gradient-to-b from-gray-50 to-white border-r border-gray-200 transition-all duration-300 ease-in-out shrink-0 h-full ${isCollapsed ? "md:w-20" : "w-full"}`}>
      {/* Header mejorado */}
      <div className="h-16 flex items-center justify-between px-2 border-b border-gray-200 bg-white">
        <Link href="/admin" className="flex items-center gap-3 group">
          <div className={`flex flex-col transition-all duration-300 ease-in-out ${isCollapsed ? "opacity-0 max-w-0 overflow-hidden" : "opacity-100 max-w-xs"}`}>
            <span className="font-bold text-gray-900 text-sm whitespace-nowrap">Panel de Control</span>
            <span className="text-xs text-gray-500 whitespace-nowrap">Clínica Veterinaria</span>
          </div>
        </Link>
        <button
          aria-label="Contraer/expandir panel de control"
          className={`${effectiveIsDesktop ? "md:inline-flex" : "hidden"} p-2 rounded-lg hover:bg-gray-100 transition-all duration-200`}
          onClick={() => setCollapsed(v => !v)}
          title={collapsed ? "Expandir panel" : "Contraer panel"}
        >
          <svg className={`w-4 h-4 text-gray-600 transition-transform duration-300 ease-in-out ${collapsed ? "rotate-180" : "rotate-0"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Navegación mejorada */}
      <nav className="py-4 px-2 space-y-2">
        {sections.map((section, sectionIndex) => {
          const sectionColors = getSectionColors(section.color);
          
          return (
            <div key={section.id} className={sectionIndex > 0 ? "mt-6" : ""}>
              {/* Header de sección */}
              <button
                className={`w-full flex items-center ${isCollapsed ? "justify-center px-2" : "justify-between px-3"} py-2.5 text-left rounded-lg transition-all duration-300 ease-in-out group ${
                  open[section.id]
                    ? `${sectionColors.bg} ${sectionColors.text}`
                    : `hover:bg-gray-100 text-gray-700`
                }`}
                onClick={() => setOpen(o => ({ ...o, [section.id]: !o[section.id] }))}
              >
                <div className={`flex items-center gap-2 ${isCollapsed ? "justify-center" : ""}`}>
                  <div className={`h-1.5 w-1.5 rounded-full ${sectionColors.gradient} transition-opacity duration-300 ${isCollapsed ? "opacity-100" : ""}`}></div>
                  <span className={`font-semibold text-sm transition-all duration-300 ease-in-out ${isCollapsed ? "opacity-0 max-w-0 overflow-hidden" : "opacity-100 max-w-xs"}`}>
                    {section.label}
                  </span>
                </div>
                <svg
                  className={`w-4 h-4 transition-all duration-300 ease-in-out ${isCollapsed ? "opacity-0 max-w-0 overflow-hidden" : "opacity-100 max-w-4"} ${open[section.id] ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Items de la sección */}
              <div className={`${open[section.id] ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"} overflow-hidden transition-all duration-400 ease-in-out ${isCollapsed ? "" : "mt-1"}`}>
                <div className={`space-y-1 ${isCollapsed ? "" : "ml-2"}`}>
                  {section.items.map(item => {
                    const active = item.href !== "#" && pathname?.startsWith(item.href);
                    const isDisabled = item.disabled;
                    const itemColors = getSectionColors(section.color);

                    const baseClassName = `relative flex items-center gap-3 ${isCollapsed ? "justify-center px-2" : "px-3"} py-2.5 text-sm rounded-lg transition-all duration-300 ease-in-out group`;

                    const activeClassName = active
                      ? `${itemColors.bg} ${itemColors.text} font-medium shadow-sm`
                      : `text-gray-600 ${itemColors.hover}`;

                    const disabledClassName = isDisabled
                      ? "opacity-50 cursor-not-allowed"
                      : `${active ? "translate-x-1" : ""} hover:translate-x-1 transition-transform duration-200`;

                    const className = `${baseClassName} ${activeClassName} ${disabledClassName}`;

                    if (isDisabled) {
                      return (
                        <div key={item.label} className={className} title="Próximamente">
                          {active && !isCollapsed && (
                            <div className={`absolute left-0 w-1 h-8 rounded-r-full ${sectionColors.gradient} transition-all duration-300 ease-in-out`}></div>
                          )}
                          <div className={`flex items-center justify-between flex-1 transition-all duration-300 ease-in-out ${isCollapsed ? "opacity-0 max-w-0 overflow-hidden" : "opacity-100 max-w-full"}`}>
                            <span className="whitespace-nowrap">{item.label}</span>
                            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full whitespace-nowrap">Pronto</span>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <Link key={item.href} href={item.href} className={className}>
                        {active && !isCollapsed && (
                          <div className={`absolute left-0 w-1 h-8 rounded-r-full ${sectionColors.gradient} transition-all duration-300 ease-in-out`}></div>
                        )}
                        <div className={`flex items-center justify-between flex-1 transition-all duration-300 ease-in-out ${isCollapsed ? "opacity-0 max-w-0 overflow-hidden" : "opacity-100 max-w-full"}`}>
                          <span className="whitespace-nowrap">{item.label}</span>
                          <svg
                            className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-all duration-200 ${active ? 'opacity-100' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </nav>

    </aside>
  );
}


