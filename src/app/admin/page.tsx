"use client";

import Link from "next/link";

const cards = [
  {
    section: "Contenido",
    items: [
      { title: "Blogs", description: "Publica y gestiona artículos.", href: "/admin/blogs", emoji: "📝" },
      { title: "Productos", description: "Catálogo para la tienda.", href: "/admin/productos", emoji: "🛍️" },
      { title: "Servicios", description: "Configura servicios y precios.", href: "/admin/servicios", emoji: "💼" },
      { title: "Equipo", description: "Gestiona el equipo médico.", href: "/admin/equipo", emoji: "👥" },
    ],
  },
  {
    section: "Mascotas",
    items: [
      { title: "Citas", description: "Revisa y administra citas.", href: "/admin/citas", emoji: "📅" },
      { title: "Fichas clínicas", description: "Crea y edita fichas.", href: "/admin/fichas", emoji: "📋" },
      { title: "Recetas médicas", description: "Emite y guarda recetas.", href: "/admin/recetas", emoji: "💊" },
      { title: "Certificados", description: "Certificados y formularios.", href: "/admin/certificados", emoji: "📄" },
    ],
  },
  {
    section: "Gestión",
    items: [
      { title: "Horarios", description: "Genera y gestiona horarios.", href: "/admin/horarios", emoji: "⏰" },
    ],
  },
];

export default function AdminHome() {
  return (
    <div className="space-y-10">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">📊</span>
          <h1 className="text-2xl md:text-3xl font-semibold">Dashboard</h1>
        </div>
        <p className="text-gray-600">Bienvenido. Selecciona un módulo para comenzar.</p>
      </div>

      {cards.map((group) => (
        <section key={group.section} className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">{group.section}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="border rounded-xl bg-white p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-indigo-50">
                        <span className="h-5 w-5 text-indigo-400">{item.emoji}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{item.title}</h3>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Link href={item.href} className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-indigo-500 text-white hover:bg-indigo-600">
                      Ir al módulo
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <span>📈</span>
          <h2 className="text-lg font-semibold">Estadísticas</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-xl bg-white p-5">
            <p className="text-sm text-gray-600">Citas agendadas (hoy)</p>
            <p className="text-3xl font-semibold mt-2">—</p>
          </div>
          <div className="border rounded-xl bg-white p-5">
            <p className="text-sm text-gray-600">Vacunas aplicadas (mes)</p>
            <p className="text-3xl font-semibold mt-2">—</p>
          </div>
          <div className="border rounded-xl bg-white p-5">
            <p className="text-sm text-gray-600">Ingresos (mes)</p>
            <p className="text-3xl font-semibold mt-2">—</p>
          </div>
        </div>
      </section>
    </div>
  );
}


