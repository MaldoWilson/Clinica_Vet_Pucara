"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type FlujoCaja = {
  id: string;
  dia: number;
  tipo: string;
  categoria: string | null;
  nombre: string | null;
  efectivo: number;
  debito: number;
  credito: number;
  transferencia: number;
  deuda: number;
  egreso: number;
  dr: string | null;
  created_at: string;
};

const cards = [
  {
    section: "Mascotas",
    gradient: "from-green-500 to-teal-500",
    items: [
      { 
        title: "Citas", 
        description: "Revisa y administra citas.", 
        href: "/admin/citas", 
        emoji: "📅",
        color: "from-green-50 to-emerald-50",
        iconBg: "bg-gradient-to-br from-green-500 to-emerald-500"
      },
      { 
        title: "Fichas clínicas", 
        description: "Crea y edita fichas.", 
        href: "/admin/fichas", 
        emoji: "📋",
        color: "from-lime-50 to-green-50",
        iconBg: "bg-gradient-to-br from-lime-500 to-green-500"
      },
      { 
        title: "Pacientes", 
        description: "Administra mascotas registradas.", 
        href: "/admin/pacientes", 
        emoji: "🐾",
        color: "from-pink-50 to-rose-50",
        iconBg: "bg-gradient-to-br from-pink-500 to-rose-500"
      },
    ],
  },
  {
    section: "Gestión",
    gradient: "from-orange-500 to-red-500",
    items: [
      { 
        title: "Horarios", 
        description: "Genera y gestiona horarios.", 
        href: "/admin/horarios", 
        emoji: "⏰",
        color: "from-orange-50 to-amber-50",
        iconBg: "bg-gradient-to-br from-orange-500 to-amber-500"
      },
      { 
        title: "Flujo de Caja", 
        description: "Gestiona ingresos y egresos.", 
        href: "/admin/flujo-caja", 
        emoji: "💰",
        color: "from-yellow-50 to-orange-50",
        iconBg: "bg-gradient-to-br from-yellow-500 to-orange-500"
      },
    ],
  },
  {
    section: "Contenido",
    gradient: "from-purple-500 to-pink-500",
    items: [
      { 
        title: "Blogs", 
        description: "Publica y gestiona artículos.", 
        href: "/admin/blogs", 
        emoji: "📝",
        color: "from-purple-50 to-pink-50",
        iconBg: "bg-gradient-to-br from-purple-500 to-pink-500"
      },
      { 
        title: "Productos", 
        description: "Catálogo para la tienda.", 
        href: "/admin/productos", 
        emoji: "🛍️",
        color: "from-blue-50 to-cyan-50",
        iconBg: "bg-gradient-to-br from-blue-500 to-cyan-500"
      },
      { 
        title: "Servicios", 
        description: "Configura servicios y precios.", 
        href: "/admin/servicios", 
        emoji: "💼",
        color: "from-indigo-50 to-purple-50",
        iconBg: "bg-gradient-to-br from-indigo-500 to-purple-500"
      },
      { 
        title: "Equipo", 
        description: "Gestiona el equipo médico.", 
        href: "/admin/equipo", 
        emoji: "👥",
        color: "from-teal-50 to-emerald-50",
        iconBg: "bg-gradient-to-br from-teal-500 to-emerald-500"
      },
    ],
  },
];

export default function AdminHome() {
  const [estadisticas, setEstadisticas] = useState({
    totalIngresos: 0,
    totalEgresos: 0,
    balance: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // Obtener mes actual
  const getCurrentMonthString = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  // Cargar estadísticas del mes actual
  useEffect(() => {
    const cargarEstadisticas = async () => {
      try {
        const mesActual = getCurrentMonthString();
        const res = await fetch(`/api/flujo-caja?mes=${mesActual}&limit=1000`);
        const json = await res.json();

        if (json.ok && json.data) {
          const registros: FlujoCaja[] = json.data;
          
          // Calcular totales
          let ingresos = 0;
          let egresos = 0;

          registros.forEach(reg => {
            const totalIngreso = (reg.efectivo || 0) + (reg.debito || 0) + (reg.credito || 0) + (reg.transferencia || 0);
            ingresos += totalIngreso;
            egresos += reg.egreso || 0;
          });

          setEstadisticas({
            totalIngresos: ingresos,
            totalEgresos: egresos,
            balance: ingresos - egresos,
          });
        }
      } catch (error) {
        console.error("Error al cargar estadísticas:", error);
      } finally {
        setLoadingStats(false);
      }
    };

    cargarEstadisticas();
  }, []);

  // Formatear moneda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-12 pb-8">
      {/* Header mejorado */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8 shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <span className="text-3xl">📊</span>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">Panel de Administración</h1>
              
            </div>
          </div>
          <p className="text-white/80 max-w-2xl">
            Bienvenido al panel de administración de la Clínica Veterinaria Pucara. Selecciona un módulo para comenzar.
          </p>
        </div>
        {/* Decoración */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>
      </div>

      {/* Secciones de módulos */}
      {cards.map((group) => (
        <section key={group.section} className="space-y-6">
          <div className="flex items-center gap-3">
            <div className={`h-1 w-12 rounded-full bg-gradient-to-r ${group.gradient}`}></div>
            <h2 className="text-2xl font-bold text-gray-900">{group.section}</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {group.items.map((item) => (
              <Link href={item.href} key={item.title}>
                <div className="group relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer">
                  {/* Fondo gradiente decorativo */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  
                  <div className="relative p-6 space-y-4">
                    {/* Icono */}
                    <div className="flex items-start justify-between">
                      <div className={`p-4 rounded-2xl ${item.iconBg} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <span className="text-3xl">{item.emoji}</span>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                    
                    {/* Contenido */}
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-gray-800">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                    
                    {/* Botón */}
                    <div className="pt-2">
                      <div className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 group-hover:text-gray-900">
                        Acceder
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  {/* Brillo decorativo */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl transform translate-x-8 -translate-y-8"></div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}

      {/* Estadísticas mejoradas */}
      <section className="space-y-6 mt-12">
        <div className="flex items-center gap-3">
          <div className="h-1 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
          <h2 className="text-2xl font-bold text-gray-900">Estadísticas del Mes</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Ingresos */}
          <Link href="/admin/flujo-caja#grafico-ingresos-egresos">
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10 blur-2xl"></div>
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl group-hover:scale-110 transition-transform">
                    <span className="text-3xl">💵</span>
                  </div>
                  <div className="text-white/60 text-xs font-medium">MES ACTUAL</div>
                </div>
                <p className="text-white/90 text-sm font-medium mb-2">Total Ingresos</p>
                {loadingStats ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    <span className="text-white/70 text-sm">Cargando...</span>
                  </div>
                ) : (
                  <>
                    <p className="text-3xl md:text-4xl font-bold text-white">
                      {formatCurrency(estadisticas.totalIngresos)}
                    </p>
                    <p className="text-white/70 text-xs mt-2 flex items-center gap-1">
                      Ver detalles
                      <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </p>
                  </>
                )}
              </div>
            </div>
          </Link>

          {/* Total Egresos */}
          <Link href="/admin/flujo-caja#grafico-distribucion-egresos">
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10 blur-2xl"></div>
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl group-hover:scale-110 transition-transform">
                    <span className="text-3xl">💸</span>
                  </div>
                  <div className="text-white/60 text-xs font-medium">MES ACTUAL</div>
                </div>
                <p className="text-white/90 text-sm font-medium mb-2">Total Egresos</p>
                {loadingStats ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    <span className="text-white/70 text-sm">Cargando...</span>
                  </div>
                ) : (
                  <>
                    <p className="text-3xl md:text-4xl font-bold text-white">
                      {formatCurrency(estadisticas.totalEgresos)}
                    </p>
                    <p className="text-white/70 text-xs mt-2 flex items-center gap-1">
                      Ver detalles
                      <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </p>
                  </>
                )}
              </div>
            </div>
          </Link>

          {/* Balance (Diferencia) */}
          <Link href="/admin/flujo-caja#grafico-ingresos-egresos">
            <div className={`group relative overflow-hidden rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer ${
              estadisticas.balance >= 0 
                ? 'bg-gradient-to-br from-blue-500 to-indigo-600' 
                : 'bg-gradient-to-br from-orange-500 to-amber-600'
            }`}>
              <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10 blur-2xl"></div>
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl group-hover:scale-110 transition-transform">
                    <span className="text-3xl">{estadisticas.balance >= 0 ? '💰' : '⚠️'}</span>
                  </div>
                  <div className="text-white/60 text-xs font-medium">MES ACTUAL</div>
                </div>
                <p className="text-white/90 text-sm font-medium mb-2">Balance</p>
                {loadingStats ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    <span className="text-white/70 text-sm">Cargando...</span>
                  </div>
                ) : (
                  <>
                    <p className="text-3xl md:text-4xl font-bold text-white">
                      {formatCurrency(estadisticas.balance)}
                    </p>
                    <p className="text-white/70 text-xs mt-2 flex items-center gap-1">
                      {estadisticas.balance >= 0 ? 'Superávit' : 'Déficit'} - Ver detalles
                      <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </p>
                  </>
                )}
              </div>
            </div>
          </Link>
        </div>
      </section>

    </div>
  );
}


