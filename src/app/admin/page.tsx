"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

type FlujoCaja = {
  id: string;
  created_at: string;
  efectivo: number;
  debito: number;
  credito: number;
  transferencia: number;
  egreso: number;
};

type Cita = {
  id: string;
  estado: string;
  creado_en: string;
};

type StockItem = {
  id: string;
  nombre: string;
  categoria: string;
  cantidad: number | null;
  stock_min: number;
  unidad: string;
  precio: number;
  estado: string;
};

const INDIGO = "#6366F1";
const ROJO = "#EF4444";
const GRIS = "#9CA3AF";

const modules = [
  {
    title: "Flujo de Caja",
    href: "/admin/flujo-caja",
    desc: "Ingresos y egresos",
    bg: "bg-emerald-50",
    color: "text-emerald-600",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3v18h18M7 13l3-3 4 4 5-6" />
      </svg>
    ),
  },
  {
    title: "Gestión de Stock",
    href: "/admin/stock",
    desc: "Inventario y productos",
    bg: "bg-indigo-50",
    color: "text-indigo-600",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M5 11h14M7 15h10" />
      </svg>
    ),
  },
  {
    title: "Fichas de Mascotas",
    href: "/admin/fichas",
    desc: "Registros médicos",
    bg: "bg-purple-50",
    color: "text-purple-600",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    title: "Citas",
    href: "/admin/citas",
    desc: "Gestión de reservas",
    bg: "bg-orange-50",
    color: "text-orange-600",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Calendario",
    href: "/admin/calendario",
    desc: "Vista de horarios",
    bg: "bg-pink-50",
    color: "text-pink-600",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M3 11h18M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
      </svg>
    ),
  },
  {
    title: "Equipo",
    href: "/admin/equipo",
    desc: "Personal veterinario",
    bg: "bg-green-50",
    color: "text-green-600",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-5-4m-5 6h5v-2a4 4 0 00-5-4m-6 6h5v-2a4 4 0 00-5-4m5-4a3 3 0 110-6 3 3 0 010 6z" />
      </svg>
    ),
  },
  {
    title: "Productos",
    href: "/admin/productos",
    desc: "Catálogo de venta",
    bg: "bg-indigo-50",
    color: "text-indigo-600",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V7a2 2 0 00-2-2h-3l-2-2-2 2H8a2 2 0 00-2 2v6m14 0v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4m16 0H4" />
      </svg>
    ),
  },
  {
    title: "Blogs",
    href: "/admin/blogs",
    desc: "Contenido y artículos",
    bg: "bg-sky-50",
    color: "text-sky-600",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20l9-5-9-5-9 5 9 5zm0-10V4m0 6l9-5m-9 5L3 5" />
      </svg>
    ),
  },
  {
    title: "Formularios",
    href: "/admin/formularios",
    desc: "Mensajes recibidos",
    bg: "bg-blue-50",
    color: "text-blue-600",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6M8 6h8a2 2 0 012 2v10a2 2 0 01-2 2H8l-4-4V8a2 2 0 012-2h2z" />
      </svg>
    ),
  },
  {
    title: "Pacientes",
    href: "/admin/pacientes",
    desc: "Mascotas registradas",
    bg: "bg-rose-50",
    color: "text-rose-600",
    icon: (
      <span className="text-lg leading-none">🐾</span>
    ),
  },
  {
    title: "Horarios",
    href: "/admin/horarios",
    desc: "Generar y administrar",
    bg: "bg-indigo-50",
    color: "text-indigo-600",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Servicios",
    href: "/admin/servicios",
    desc: "Configuración y precios",
    bg: "bg-violet-50",
    color: "text-violet-600",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
];

export default function AdminHome() {
  const [flujo, setFlujo] = useState<FlujoCaja[]>([]);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [stock, setStock] = useState<StockItem[]>([]);
  const [mascotasTotal, setMascotasTotal] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [fc, ct, st, ms] = await Promise.all([
          fetch("/api/flujo-caja?limit=1000").then((r) => r.json()).catch(() => ({ data: [] })),
          fetch("/api/citas").then((r) => r.json()).catch(() => ({ citas: [] })),
          fetch("/api/stock").then((r) => r.json()).catch(() => ({ data: [] })),
          fetch("/api/mascotas?page=1&pageSize=1").then((r) => r.json()).catch(() => ({ total: 0 })),
        ]);
        setFlujo(fc?.data || []);
        setCitas(ct?.citas || []);
        setStock((st?.data || []).map((x: any) => ({ ...x, cantidad: x.cantidad ?? 0 })));
        setMascotasTotal(ms?.total || 0);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const now = new Date();
  const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

  // Totales por mes últimos 6
  const serie6m = useMemo(() => {
    const points: { mes: string; ingresos: number; egresos: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const k = monthKey(d);
      const fin = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
      const registros = flujo.filter((f) => {
        const t = new Date(f.created_at);
        return t >= d && t <= fin;
      });
      const ingresos = registros.reduce((sum, r) => sum + (r.efectivo || 0) + (r.debito || 0) + (r.credito || 0) + (r.transferencia || 0), 0);
      const egresos = registros.reduce((sum, r) => sum + (r.egreso || 0), 0);
      points.push({ mes: k.split("-")[1], ingresos, egresos });
    }
    return points.map((p, idx) => ({ ...p, mes: new Date(now.getFullYear(), now.getMonth() - (5 - idx), 1).toLocaleDateString("es-CL", { month: "short" }) }));
  }, [flujo]);

  const ingresosMes = useMemo(() => {
    const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1);
    const finMes = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const regs = flujo.filter((f) => {
      const t = new Date(f.created_at);
      return t >= inicioMes && t <= finMes;
    });
    return regs.reduce((sum, r) => sum + (r.efectivo || 0) + (r.debito || 0) + (r.credito || 0) + (r.transferencia || 0), 0);
  }, [flujo]);

  const ingresosMesPrev = useMemo(() => {
    const inicio = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const fin = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    const regs = flujo.filter((f) => {
      const t = new Date(f.created_at);
      return t >= inicio && t <= fin;
    });
    return regs.reduce((sum, r) => sum + (r.efectivo || 0) + (r.debito || 0) + (r.credito || 0) + (r.transferencia || 0), 0);
  }, [flujo]);

  const deltaIngresos = useMemo(() => {
    if (ingresosMesPrev === 0) return ingresosMes > 0 ? 100 : 0;
    return Math.round(((ingresosMes - ingresosMesPrev) / ingresosMesPrev) * 100);
  }, [ingresosMes, ingresosMesPrev]);

  const citasHoy = useMemo(() => {
    const today = new Date();
    return citas.filter((c) => {
      const d = new Date(c.creado_en);
      return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
    }).length;
  }, [citas]);

  const estadoCitasPie = useMemo(() => {
    const total = Math.max(1, citas.length);
    const pendientes = citas.filter((c) => c.estado === "PENDIENTE").length;
    const aceptadas = citas.filter((c) => c.estado === "CONFIRMADA" || c.estado === "ATENDIDA").length;
    const canceladas = citas.filter((c) => c.estado === "CANCELADA").length;
    return [
      { name: "Pendientes", value: pendientes, color: GRIS },
      { name: "Aceptadas", value: aceptadas, color: INDIGO },
      { name: "Canceladas", value: canceladas, color: ROJO },
    ].map((s) => ({ ...s, pct: (s.value / total) * 100 }));
  }, [citas]);

  const bajos = useMemo(() => stock.filter((i) => i && (i.estado !== "OK")), [stock]);

  const formatCurrency = (num: number) => new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", minimumFractionDigits: 0 }).format(num || 0);

  return (
    <div className="space-y-6 px-4 py-8">
      {/* Encabezado */}
      <div className="bg-white rounded-2xl shadow p-6 border border-indigo-100">
        <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
        <p className="text-gray-600 mt-1">Bienvenido al sistema de gestión</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow p-5 border">
          <p className="text-sm text-gray-600">Ingresos del Mes</p>
          <p className="text-3xl font-bold mt-2">{formatCurrency(ingresosMes)}</p>
          <p className={`text-xs mt-1 ${deltaIngresos >= 0 ? "text-emerald-600" : "text-red-600"}`}>{deltaIngresos >= 0 ? "+" : ""}{deltaIngresos}% vs mes anterior</p>
        </div>
        <div className="bg-white rounded-xl shadow p-5 border">
          <p className="text-sm text-gray-600">Citas Hoy</p>
          <p className="text-3xl font-bold mt-2">{citasHoy}</p>
          <p className="text-xs text-gray-500 mt-1">{loading ? "Cargando…" : `${citas.length} totales`}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-5 border">
          <p className="text-sm text-gray-600">Mascotas Registradas</p>
          <p className="text-3xl font-bold mt-2">{mascotasTotal}</p>
          <p className="text-xs text-gray-500 mt-1">Total en el sistema</p>
        </div>
        <div className="bg-white rounded-xl shadow p-5 border">
          <p className="text-sm text-gray-600">Productos Bajo Stock</p>
          <p className="text-3xl font-bold mt-2">{bajos.length}</p>
          <p className="text-xs text-red-600 mt-1">Requiere atención</p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow p-5 border">
          <p className="font-semibold text-gray-900 mb-2">Flujo de Caja (Últimos 6 meses)</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={serie6m} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="mes" />
                <YAxis tickFormatter={(v) => new Intl.NumberFormat("es-CL", { notation: "compact" }).format(v as number)} />
                <Tooltip formatter={(v: any) => formatCurrency(Number(v))} />
                <Line type="monotone" dataKey="egresos" stroke={ROJO} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="ingresos" stroke="#111827" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-5 border">
          <p className="font-semibold text-gray-900 mb-2">Estado de Citas</p>
          <div className="h-64 grid place-items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={estadoCitasPie} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110}>
                  {estadoCitasPie.map((s, i) => (
                    <Cell key={i} fill={s.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any, _n: any, p: any) => [`${v} (${p.payload.pct.toFixed(0)}%)`, p.payload.name]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Alertas de Stock Bajo */}
      <div className="bg-white rounded-xl shadow border">
        <div className="flex items-center justify-between p-4 border-b">
          <p className="font-semibold text-gray-900">Alertas de Stock Bajo</p>
          <Link href="/admin/stock" className="px-3 py-1 rounded-lg border text-sm">Ver Todo</Link>
        </div>
        {bajos.length === 0 ? (
          <div className="p-6 text-sm text-gray-500">Sin alertas</div>
        ) : (
          <div className="divide-y">
            {bajos.slice(0, 3).map((b) => (
              <div key={b.id} className="p-4 flex items-center justify-between bg-orange-50">
                <div>
                  <p className="font-medium text-gray-900">{b.nombre}</p>
                  <p className="text-xs text-gray-600">Stock actual: {Number(b.cantidad || 0)} {b.unidad} (Mínimo: {b.stock_min})</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="px-3 py-1 rounded-lg border text-gray-700 hover:bg-gray-50"
                    onClick={async () => {
                      const res = await fetch("/api/stock", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: b.id, action: "decrement" }) });
                      const j = await res.json();
                      if (res.ok && j.ok) setStock((prev) => prev.map((i) => (i.id === b.id ? j.data : i)));
                    }}
                  >
                    Restar 1
                  </button>
                  <button
                    className="px-3 py-1 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                    onClick={async () => {
                      const res = await fetch("/api/stock", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: b.id, action: "increment" }) });
                      const j = await res.json();
                      if (res.ok && j.ok) setStock((prev) => prev.map((i) => (i.id === b.id ? j.data : i)));
                    }}
                  >
                    Aumentar 1
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Acceso Rápido */}
      <div>
        <p className="text-lg font-semibold text-gray-900 mb-3">Acceso Rápido</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {modules.map((m) => (
            <Link key={m.href} href={m.href} className="block">
              <div className="group bg-white rounded-xl border border-indigo-100 hover:border-indigo-300 shadow-sm hover:shadow-md transition-all p-5">
                <div className="flex items-start justify-between">
                  <div className={`h-9 w-9 rounded-lg grid place-items-center ${m.bg} ${m.color}`}>{m.icon}</div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
                </div>
                <h3 className="mt-4 text-base font-semibold text-gray-900 group-hover:text-indigo-700">{m.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{m.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}


