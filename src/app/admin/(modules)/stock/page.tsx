"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import ConfirmationModal from "@/components/ConfirmationModal";
import * as XLSX from "xlsx";

type StockItem = {
  id: string;
  nombre: string;
  categoria: string;
  cantidad: number | null;
  stock_min: number;
  unidad: string;
  precio: number;
  estado: string; // OK | BAJO | CRITICO
  created_at: string;
};

type FormData = {
  id?: string;
  nombre: string;
  categoria: string;
  cantidad: number;
  stock_min: number;
  unidad: string;
  precio: number;
};

const CATEGORIAS = [
  "Medicamentos",
  "Vacunas",
  "Alimentos",
  "Higiene",
  "Material Médico",
];

const COLORES = [
  "#4F46E5",
  "#06B6D4",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#7C3AED",
  "#0EA5E9",
  "#84CC16",
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(value || 0);
}

function getStatus(cantidad: number, stockMin: number): "OK" | "BAJO" | "CRITICO" {
  const qty = Number(cantidad || 0);
  const min = Number(stockMin || 0);
  if (qty <= 0) return "CRITICO";
  if (qty < Math.max(1, min * 0.3)) return "CRITICO";
  if (qty < min) return "BAJO";
  return "OK";
}

export default function StockPage() {
  const [items, setItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // búsqueda
  const [query, setQuery] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>("");
  const [estadoFiltro, setEstadoFiltro] = useState<string>("");

  // modal
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<FormData>({
    nombre: "",
    categoria: "",
    cantidad: 0,
    stock_min: 0,
    unidad: "",
    precio: 0,
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const cargar = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stock", { cache: "no-store" });
      const j = await res.json();
      if (!res.ok || !j.ok) throw new Error(j.error || "Error al cargar");
      const data: StockItem[] = (j.data || []).map((r: any) => ({
        ...r,
        cantidad: r.cantidad ?? 0,
      }));
      setItems(data);
    } catch (e: any) {
      setError(e.message || "Error al cargar");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const filtrados = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((i) => {
      if (q && !(i.nombre.toLowerCase().includes(q) || i.categoria.toLowerCase().includes(q))) return false;
      if (categoriaFiltro && i.categoria !== categoriaFiltro) return false;
      const st = getStatus(Number(i.cantidad || 0), i.stock_min);
      if (estadoFiltro && st !== estadoFiltro) return false;
      return true;
    });
  }, [items, query, categoriaFiltro, estadoFiltro]);

  // KPIs
  const totalProductos = useMemo(() => items.length, [items]);
  const valorTotal = useMemo(
    () => items.reduce((acc, it) => acc + (Number(it.cantidad || 0) * Number(it.precio || 0)), 0),
    [items]
  );
  const bajoTotal = useMemo(
    () => items.filter((i) => getStatus(Number(i.cantidad || 0), i.stock_min) !== "OK").length,
    [items]
  );

  // Movimientos del mes (usamos productos creados este mes como aproximación)
  const ahora = new Date();
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
  const finMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0, 23, 59, 59, 999);
  const movimientosMes = useMemo(
    () =>
      items.filter((i) => {
        const d = new Date(i.created_at);
        return d >= inicioMes && d <= finMes;
      }).length,
    [items]
  );
  const prevInicio = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1);
  const prevFin = new Date(ahora.getFullYear(), ahora.getMonth(), 0, 23, 59, 59, 999);
  const movimientosPrev = useMemo(
    () =>
      items.filter((i) => {
        const d = new Date(i.created_at);
        return d >= prevInicio && d <= prevFin;
      }).length,
    [items]
  );
  const variacion = movimientosPrev === 0
    ? movimientosMes > 0 ? 100 : 0
    : Math.round(((movimientosMes - movimientosPrev) / movimientosPrev) * 100);

  // Gráfico: productos creados por mes (últimos 6 meses)
  const graficoMovimientos = useMemo(() => {
    const points: { mes: string; cantidad: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
      const mStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
      const label = d.toLocaleDateString("es-CL", { month: "short" });
      const count = items.filter((it) => {
        const cd = new Date(it.created_at);
        return cd >= mStart && cd <= mEnd;
      }).length;
      points.push({ mes: label, cantidad: count });
    }
    return points;
  }, [items]);

  // Pie: distribución por categoría
  const distribucionCategoria = useMemo(() => {
    const map = new Map<string, number>();
    items.forEach((i) => {
      map.set(i.categoria, (map.get(i.categoria) || 0) + 1);
    });
    const total = items.length || 1;
    return Array.from(map.entries()).map(([categoria, num], idx) => ({
      categoria,
      valor: num,
      porcentaje: (num / total) * 100,
      color: COLORES[idx % COLORES.length],
    }));
  }, [items]);

  const bajos = useMemo(() => {
    return items
      .filter((i) => getStatus(Number(i.cantidad || 0), i.stock_min) !== "OK")
      .sort((a, b) => Number(a.cantidad || 0) - Number(b.cantidad || 0));
  }, [items]);

  // acciones
  const abrirNuevo = () => {
    setForm({ nombre: "", categoria: "", cantidad: 0, stock_min: 0, unidad: "", precio: 0 });
    setIsEditing(false);
    setShowModal(true);
  };

  const abrirEditar = (it: StockItem) => {
    setForm({
      id: it.id,
      nombre: it.nombre,
      categoria: it.categoria,
      cantidad: Number(it.cantidad || 0),
      stock_min: Number(it.stock_min || 0),
      unidad: it.unidad,
      precio: Number(it.precio || 0),
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim() || !form.categoria.trim() || !form.unidad.trim()) {
      alert("Nombre, categoría y unidad son obligatorios");
      return;
    }
    setSaving(true);
    try {
      const estado = getStatus(form.cantidad, form.stock_min);
      const method = isEditing ? "PUT" : "POST";
      const body: any = { ...form, estado };
      const res = await fetch("/api/stock", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = await res.json();
      if (!res.ok || !j.ok) throw new Error(j.error || "Error al guardar");
      setShowModal(false);
      await cargar();
    } catch (e: any) {
      alert(e.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  // Eliminar
  const confirmarEliminar = (id: string) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const eliminar = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch("/api/stock", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteId }),
      });
      const j = await res.json();
      if (!res.ok || !j.ok) throw new Error(j.error || "Error al eliminar");
      setItems((prev) => prev.filter((p) => p.id !== deleteId));
    } catch (e: any) {
      alert(e.message || "Error al eliminar");
    } finally {
      setShowDeleteModal(false);
      setDeleteId(null);
    }
  };

  // Exportar a Excel
  const exportarExcel = () => {
    const data = filtrados.map((it) => ({
      Nombre: it.nombre,
      "Categoría": it.categoria,
      Cantidad: Number(it.cantidad || 0),
      "Stock Mínimo": it.stock_min,
      Unidad: it.unidad,
      "Precio Unitario": Number(it.precio || 0),
      Estado: getStatus(Number(it.cantidad || 0), it.stock_min),
      "Valor Total": Number(it.cantidad || 0) * Number(it.precio || 0),
      "Creado el": new Date(it.created_at).toLocaleDateString("es-CL"),
    }));
    const sheet = XLSX.utils.json_to_sheet(data);
    sheet["!cols"] = [
      { wch: 28 }, { wch: 18 }, { wch: 10 }, { wch: 12 }, { wch: 10 }, { wch: 15 }, { wch: 10 }, { wch: 14 }, { wch: 12 }
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet, "Inventario");
    XLSX.writeFile(wb, `inventario_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  const badge = (status: "OK" | "BAJO" | "CRITICO") => (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${
        status === "OK"
          ? "bg-green-100 text-green-800"
          : status === "BAJO"
          ? "bg-gray-100 text-gray-700"
          : "bg-red-100 text-red-700"
      }`}
    >
      {status === "OK" ? "OK" : status === "BAJO" ? "Bajo" : "Crítico"}
    </span>
  );

  return (
    <div className="space-y-6 px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Stock</h1>
          <p className="text-gray-600">Administra el inventario de productos y medicamentos</p>
        </div>
        <button
          onClick={abrirNuevo}
          className="px-5 py-3 rounded-lg font-semibold text-white bg-emerald-600 hover:bg-emerald-700"
        >
          + Agregar Producto
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-600">Total Productos</p>
          <p className="text-3xl font-bold mt-2">{totalProductos}</p>
          <p className="text-xs text-gray-500 mt-1">En inventario</p>
        </div>
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-600">Valor Total</p>
          <p className="text-3xl font-bold mt-2">{formatCurrency(valorTotal)}</p>
          <p className="text-xs text-gray-500 mt-1">Valor del inventario</p>
        </div>
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-600">Stock Bajo</p>
          <p className="text-3xl font-bold mt-2">{bajoTotal}</p>
          <p className="text-xs text-red-600 mt-1">Requieren reposición</p>
        </div>
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-600">Movimientos del Mes</p>
          <p className="text-3xl font-bold mt-2">{movimientosMes}</p>
          <p className={`text-xs mt-1 ${variacion >= 0 ? "text-emerald-600" : "text-red-600"}`}>
            {variacion >= 0 ? "+" : ""}{variacion}% vs mes anterior
          </p>
        </div>
      </div>

      {/* Grids con gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Distribución por Categoría */}
        <div className="bg-white rounded-xl shadow p-5">
          <p className="font-semibold text-gray-900 mb-2">Distribución por Categoría</p>
          {distribucionCategoria.length === 0 ? (
            <div className="text-gray-500 text-sm">Sin datos</div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={distribucionCategoria} dataKey="valor" nameKey="categoria" outerRadius={100} label>
                    {distribucionCategoria.map((d, idx) => (
                      <Cell key={d.categoria} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any) => String(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Movimientos por mes */}
        <div className="bg-white rounded-xl shadow p-5">
          <p className="font-semibold text-gray-900 mb-2">Movimientos de Stock</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={graficoMovimientos} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="mes" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="cantidad" fill="#111827" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Alertas */}
      <div className="bg-red-50 border border-red-200 rounded-xl">
        <div className="px-5 py-3 border-b border-red-200 font-semibold text-red-800">Alertas de Stock Bajo</div>
        {bajos.length === 0 ? (
          <div className="px-5 py-4 text-sm text-red-700">No hay productos con stock bajo.</div>
        ) : (
          <div className="divide-y divide-red-100">
            {bajos.map((b) => {
              const st = getStatus(Number(b.cantidad || 0), b.stock_min);
              return (
                <div key={b.id} className="px-5 py-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{b.nombre}</p>
                    <p className="text-xs text-gray-500">{b.categoria}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">{Number(b.cantidad || 0)} {b.unidad}</div>
                    <div className="text-xs text-gray-500">Min: {b.stock_min}</div>
                  </div>
                  <div className="ml-3">{badge(st)}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Inventario completo */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="p-4 flex items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-gray-900">Inventario Completo</p>
            <p className="text-xs text-gray-500">Lista de todos los productos en stock</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={categoriaFiltro}
              onChange={(e) => setCategoriaFiltro(e.target.value)}
              className="px-3 py-2 border rounded-lg"
              title="Filtrar por categoría"
            >
              <option value="">Todas las categorías</option>
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={estadoFiltro}
              onChange={(e) => setEstadoFiltro(e.target.value)}
              className="px-3 py-2 border rounded-lg"
              title="Filtrar por estado"
            >
              <option value="">Todos los estados</option>
              <option value="OK">OK</option>
              <option value="BAJO">Bajo</option>
              <option value="CRITICO">Crítico</option>
            </select>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar productos..."
              className="px-3 py-2 border rounded-lg"
            />
            <button
              onClick={exportarExcel}
              className="px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
              title="Exportar a Excel"
            >
              Exportar
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3 font-medium text-gray-600">Producto</th>
                <th className="text-left p-3 font-medium text-gray-600">Categoría</th>
                <th className="text-left p-3 font-medium text-gray-600">Cantidad</th>
                <th className="text-left p-3 font-medium text-gray-600">Stock Min.</th>
                <th className="text-left p-3 font-medium text-gray-600">Precio Unit.</th>
                <th className="text-left p-3 font-medium text-gray-600">Estado</th>
                <th className="text-left p-3 font-medium text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-gray-500">Cargando…</td>
                </tr>
              ) : filtrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-gray-500">Sin registros</td>
                </tr>
              ) : (
                filtrados.map((it) => {
                  const st = getStatus(Number(it.cantidad || 0), it.stock_min);
                  return (
                    <tr key={it.id} className="border-t hover:bg-gray-50">
                      <td className="p-3 font-medium text-gray-900">{it.nombre}</td>
                      <td className="p-3 text-gray-700">{it.categoria}</td>
                      <td className="p-3 text-gray-700">
                        <div className="inline-flex items-center gap-2">
                          <button
                            className="px-2 py-1 rounded border text-gray-700 hover:bg-gray-50"
                            title="Restar 1"
                            onClick={async () => {
                              const res = await fetch('/api/stock', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: it.id, action: 'decrement' }) });
                              const j = await res.json();
                              if (res.ok && j.ok) {
                                setItems((prev) => prev.map((p) => (p.id === it.id ? j.data : p)));
                              } else {
                                alert(j.error || 'Error al ajustar');
                              }
                            }}
                          >
                            −
                          </button>
                          <span className="min-w-[72px] text-center">{Number(it.cantidad || 0)} {it.unidad}</span>
                          <button
                            className="px-2 py-1 rounded border text-gray-700 hover:bg-gray-50"
                            title="Sumar 1"
                            onClick={async () => {
                              const res = await fetch('/api/stock', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: it.id, action: 'increment' }) });
                              const j = await res.json();
                              if (res.ok && j.ok) {
                                setItems((prev) => prev.map((p) => (p.id === it.id ? j.data : p)));
                              } else {
                                alert(j.error || 'Error al ajustar');
                              }
                            }}
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="p-3 text-gray-700">{it.stock_min} {it.unidad}</td>
                      <td className="p-3 text-gray-900">{formatCurrency(Number(it.precio || 0))}</td>
                      <td className="p-3">{badge(st)}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => abrirEditar(it)}
                            className="px-3 py-1 rounded border"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => confirmarEliminar(it.id)}
                            className="px-3 py-1 rounded bg-red-600 text-white"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de confirmación para eliminar */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setDeleteId(null); }}
        onConfirm={eliminar}
        title="Confirmar Eliminación"
        message="¿Seguro deseas eliminar este producto de stock? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        danger
      />

      {/* Modal Crear/Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-xl w-full overflow-hidden">
            <div className="p-5 border-b flex items-center justify-between">
              <h3 className="text-xl font-bold">{isEditing ? "Editar Producto" : "Agregar Nuevo Producto"}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-800">×</button>
            </div>
            <form onSubmit={guardar} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre del Producto</label>
                <input
                  value={form.nombre}
                  onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                  placeholder="Ej: Vacuna Antirrábica"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Categoría</label>
                  <select
                    value={form.categoria}
                    onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">Seleccionar</option>
                    {CATEGORIAS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Unidad</label>
                  <input
                    value={form.unidad}
                    onChange={(e) => setForm((f) => ({ ...f, unidad: e.target.value }))}
                    placeholder="Ej: dosis, cajas"
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cantidad</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={form.cantidad}
                    onChange={(e) => setForm((f) => ({ ...f, cantidad: Number(e.target.value || 0) }))}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Stock Mínimo</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={form.stock_min}
                    onChange={(e) => setForm((f) => ({ ...f, stock_min: Number(e.target.value || 0) }))}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Precio Unitario</label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={form.precio}
                  onChange={(e) => setForm((f) => ({ ...f, precio: Number(e.target.value || 0) }))}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-md border">Cancelar</button>
                <button type="submit" disabled={saving} className="px-5 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700">
                  {saving ? "Guardando…" : isEditing ? "Actualizar Producto" : "Guardar Producto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* error */}
      {error && <div className="text-sm text-red-600">{error}</div>}
    </div>
  );
}


