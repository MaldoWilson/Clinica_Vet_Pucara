"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import ConfirmationModal from "@/components/ConfirmationModal";
import AdminEditableTable from "@/components/AdminEditableTable";
import * as XLSX from "xlsx";

// --- Types ---
type Categoria = { id: number; nombre: string };

type Producto = {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  sku: string;
  stock: number;
  stock_min: number;
  unidad: string;
  tipo_producto: string; // 'VENTA_GENERAL', 'VACUNA', 'MEDICAMENTO', 'INSUMO_INTERNO'
  controlar_lotes: boolean;
  es_publico: boolean;
  imagen_principal?: string | null;
  imagenes?: string[];
  created_at: string;
  categorias: Categoria | null;
  categoria_id?: number;
};

type Movimiento = {
  id: number;
  producto_id: string;
  tipo_movimiento: string;
  cantidad: number;
  fecha: string;
  observacion?: string;
  productos?: { nombre: string; sku: string };
  inventario_lotes?: { numero_lote: string };
};

// --- Constants ---
const TIPOS_PRODUCTO = [
  { value: "VENTA_GENERAL", label: "Venta General" },
  { value: "VACUNA", label: "Vacuna" },
  { value: "MEDICAMENTO", label: "Medicamento" },
  { value: "INSUMO_INTERNO", label: "Insumo Interno" },
];

const COLORES = ["#4F46E5", "#06B6D4", "#10B981", "#F59E0B", "#EF4444", "#7C3AED"];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", minimumFractionDigits: 0 }).format(value || 0);
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
  // --- State ---
  const [activeTab, setActiveTab] = useState<"INVENTARIO" | "HISTORIAL">("INVENTARIO");
  const [productos, setProductos] = useState<Producto[]>([]);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMovs, setLoadingMovs] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [invPage, setInvPage] = useState(1);
  const [histPage, setHistPage] = useState(1);

  // Filters
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [filterCategoria, setFilterCategoria] = useState("");
  const [filterTipo, setFilterTipo] = useState("");
  const [filterEstado, setFilterEstado] = useState(searchParams.get("filter") || "");

  // Sort states for Inventory
  const [invSortField, setInvSortField] = useState<"nombre" | "fecha">("nombre");
  const [invSortDir, setInvSortDir] = useState<"asc" | "desc">("asc");

  // Sort states for Movement History
  const [histSortField, setHistSortField] = useState<"producto" | "fecha">("fecha");
  const [histSortDir, setHistSortDir] = useState<"asc" | "desc">("desc");

  // Modal / Form
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<Producto>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Extra images state
  const [extraFiles, setExtraFiles] = useState<Array<File | null>>([null, null, null]);
  const [extraPreviews, setExtraPreviews] = useState<Array<string | null>>([null, null, null]);

  // Delete
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // --- Fetch Data ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const [resProd, resCat] = await Promise.all([
        fetch("/api/productos?all=true"),
        fetch("/api/categorias")
      ]);
      const jsonProd = await resProd.json();
      const jsonCat = await resCat.json();

      if (jsonProd.productos) setProductos(jsonProd.productos);
      if (jsonCat.categorias) setCategorias(jsonCat.categorias);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMovimientos = async () => {
    setLoadingMovs(true);
    try {
      const res = await fetch("/api/movimientos?limit=100");
      const json = await res.json();
      if (json.data) setMovimientos(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMovs(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab === "HISTORIAL") fetchMovimientos();
  }, [activeTab]);

  // --- Computed ---
  const filteredProductos = useMemo(() => {
    let result = productos.filter(p => {
      const matchSearch = !search || p.nombre.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
      const matchCat = !filterCategoria || p.categorias?.nombre === filterCategoria;
      const matchTipo = !filterTipo || p.tipo_producto === filterTipo;
      const status = getStatus(p.stock, p.stock_min);
      const matchEstado = !filterEstado || status === filterEstado;
      return matchSearch && matchCat && matchTipo && matchEstado;
    });

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      if (invSortField === "nombre") {
        comparison = a.nombre.localeCompare(b.nombre);
      } else if (invSortField === "fecha") {
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      return invSortDir === "asc" ? comparison : -comparison;
    });

    return result;
  }, [productos, search, filterCategoria, filterTipo, filterEstado, invSortField, invSortDir]);

  const sortedMovimientos = useMemo(() => {
    const result = [...movimientos];
    result.sort((a, b) => {
      let comparison = 0;
      if (histSortField === "producto") {
        const nameA = a.productos?.nombre || "";
        const nameB = b.productos?.nombre || "";
        comparison = nameA.localeCompare(nameB);
      } else if (histSortField === "fecha") {
        comparison = new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
      }
      return histSortDir === "asc" ? comparison : -comparison;
    });
    return result;
  }, [movimientos, histSortField, histSortDir]);

  const stats = useMemo(() => {
    const total = productos.length;
    const valor = productos.reduce((acc, p) => acc + (p.stock * p.precio), 0);
    const itemsBajos = productos.filter(p => getStatus(p.stock, p.stock_min) !== "OK");
    const bajos = itemsBajos.length;

    // Distribution by Type
    const distMap = new Map<string, number>();
    productos.forEach(p => {
      const t = p.tipo_producto || "OTRO";
      distMap.set(t, (distMap.get(t) || 0) + 1);
    });
    const distData = Array.from(distMap.entries()).map(([name, value], i) => ({
      name, value, color: COLORES[i % COLORES.length]
    }));

    return { total, valor, bajos, itemsBajos, distData };
  }, [productos]);

  // --- Handlers ---
  const handleQuickStock = async (p: Producto, change: number) => {
    try {
      const newStock = Math.max(0, (p.stock || 0) + change);
      const res = await fetch("/api/productos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: p.id, stock: newStock })
      });
      if (!res.ok) throw new Error("Error al actualizar stock");
      fetchData();
    } catch (e) {
      console.error(e);
      alert("Error al actualizar stock rápido");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let imagen_principal = form.imagen_principal;

      // Upload main image
      if (imageFile) {
        const fd = new FormData();
        fd.append("file", imageFile);
        const upRes = await fetch("/api/productos/upload", { method: "POST", body: fd });
        const upJson = await upRes.json();
        if (upJson.image_url) imagen_principal = upJson.image_url;
      }

      // Upload extra images
      // Start with existing images (limit to 3)
      const currentImages = (form.imagenes || []).slice(0, 3);
      const newImages: string[] = [];

      for (let i = 0; i < 3; i++) {
        const file = extraFiles[i];
        if (file) {
          const fd = new FormData();
          fd.append("file", file);
          const upRes = await fetch("/api/productos/upload", { method: "POST", body: fd });
          const upJson = await upRes.json();
          if (upJson.image_url) newImages[i] = upJson.image_url;
        } else {
          // Keep existing if available and not replaced (though UI shows preview)
          // If preview is there but no file, it means it's an existing image
          if (extraPreviews[i] && !file) {
            newImages[i] = extraPreviews[i]!;
          }
        }
      }
      // Filter out nulls/undefined
      const imagenes = newImages.filter(Boolean);

      const body = { ...form, imagen_principal, imagenes };
      const method = isEditing ? "PUT" : "POST";
      const res = await fetch("/api/productos", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (!res.ok) throw new Error("Error al guardar");

      setShowModal(false);
      fetchData();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await fetch("/api/productos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteId })
      });
      setShowDeleteModal(false);
      fetchData();
    } catch (e) {
      alert("Error al eliminar");
    }
  };

  const openNew = () => {
    setForm({
      nombre: "", sku: "", descripcion: "", precio: 0, stock: 0, stock_min: 5, unidad: "unidad",
      tipo_producto: "VENTA_GENERAL", controlar_lotes: false, es_publico: true, imagenes: []
    });
    setImageFile(null);
    setImagePreview(null);
    setExtraFiles([null, null, null]);
    setExtraPreviews([null, null, null]);
    setIsEditing(false);
    setShowModal(true);
  };

  const openEdit = (p: Producto) => {
    setForm({ ...p });
    setImagePreview(p.imagen_principal || null);
    setImageFile(null);

    // Setup extra images
    const prevs = [null, null, null] as Array<string | null>;
    (p.imagenes || []).slice(0, 3).forEach((url, idx) => {
      prevs[idx] = url;
    });
    setExtraPreviews(prevs);
    setExtraFiles([null, null, null]);

    setIsEditing(true);
    setShowModal(true);
  };

  const exportExcel = () => {
    const data = filteredProductos.map(p => ({
      Nombre: p.nombre,
      SKU: p.sku,
      Categoria: p.categorias?.nombre,
      Tipo: p.tipo_producto,
      Stock: p.stock,
      Minimo: p.stock_min,
      Unidad: p.unidad,
      Precio: p.precio,
      Estado: getStatus(p.stock, p.stock_min)
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventario");
    XLSX.writeFile(wb, "Inventario.xlsx");
  };

  // --- Render ---
  return (
    <div className="space-y-6 px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Stock</h1>
          <p className="text-gray-600">Control integral de inventario, productos y vacunas</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportExcel} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Exportar Excel</button>
          <button onClick={openNew} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">+ Nuevo Producto</button>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow">
          <p className="text-sm text-gray-500">Total Items</p>
          <p className="text-3xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow">
          <p className="text-sm text-gray-500">Valor Inventario</p>
          <p className="text-3xl font-bold">{formatCurrency(stats.valor)}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow">
          <p className="text-sm text-gray-500">Alertas Stock</p>
          <p className={`text-3xl font-bold ${stats.bajos > 0 ? 'text-red-600' : 'text-green-600'}`}>{stats.bajos}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Distribución</p>
            <div className="text-xs mt-1 space-y-1">
              {stats.distData.slice(0, 3).map(d => (
                <div key={d.name} className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                  <span>{d.name}: {d.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="w-16 h-16">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.distData} dataKey="value" innerRadius={15} outerRadius={30} paddingAngle={2}>
                  {stats.distData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Alertas de Stock Bajo */}
      <div className="bg-white rounded-xl shadow border">
        <div className="flex items-center justify-between p-4 border-b">
          <p className="font-semibold text-gray-900">Alertas de Stock Bajo</p>
          <button onClick={() => setFilterEstado("BAJO")} className="px-3 py-1 rounded-lg border text-sm hover:bg-gray-50">Ver Todo</button>
        </div>
        {stats.itemsBajos.length === 0 ? (
          <div className="p-6 text-sm text-gray-500">Sin alertas</div>
        ) : (
          <div className="divide-y">
            {stats.itemsBajos.slice(0, 3).map((b) => (
              <div key={b.id} className="p-4 flex items-center justify-between bg-orange-50">
                <div>
                  <p className="font-medium text-gray-900">{b.nombre}</p>
                  <p className="text-xs text-gray-600">Stock actual: {Number(b.stock || 0)} {b.unidad} (Mínimo: {b.stock_min})</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => openEdit(b)} className="text-xs text-indigo-600 hover:underline font-medium">
                    Editar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("INVENTARIO")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "INVENTARIO" ? "border-indigo-500 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
          >
            Inventario
          </button>
          <button
            onClick={() => setActiveTab("HISTORIAL")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "HISTORIAL" ? "border-indigo-500 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
          >
            Historial de Movimientos
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === "INVENTARIO" ? (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow space-y-4">
            <div className="flex flex-wrap gap-3">
              <input
                placeholder="Buscar..."
                value={search}
                onChange={e => { setSearch(e.target.value); setInvPage(1); }}
                className="px-3 py-2 border rounded-md w-full sm:w-auto sm:flex-1 sm:min-w-[200px]"
              />
              <select value={filterCategoria} onChange={e => { setFilterCategoria(e.target.value); setInvPage(1); }} className="px-3 py-2 border rounded-md w-full sm:w-auto">
                <option value="">Todas las Categorías</option>
                {categorias.map(c => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
              </select>
              <select value={filterTipo} onChange={e => { setFilterTipo(e.target.value); setInvPage(1); }} className="px-3 py-2 border rounded-md w-full sm:w-auto">
                <option value="">Todos los Tipos</option>
                {TIPOS_PRODUCTO.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <select value={filterEstado} onChange={e => { setFilterEstado(e.target.value); setInvPage(1); }} className="px-3 py-2 border rounded-md w-full sm:w-auto">
                <option value="">Todos los Estados</option>
                <option value="OK">OK</option>
                <option value="BAJO">Bajo</option>
                <option value="CRITICO">Crítico</option>
              </select>
            </div>

            {/* Sorting Controls */}
            <div className="flex items-center gap-2 pt-2 border-t">
              <label className="text-sm text-gray-600 font-medium whitespace-nowrap">Ordenar por:</label>
              <select value={invSortField} onChange={e => setInvSortField(e.target.value as "nombre" | "fecha")} className="px-3 py-2 border rounded-md text-sm flex-1 sm:flex-initial">
                <option value="nombre">Nombre</option>
                <option value="fecha">Fecha</option>
              </select>
              <button
                onClick={() => setInvSortDir(invSortDir === "asc" ? "desc" : "asc")}
                className="px-4 py-2 border rounded-md hover:bg-gray-50 text-sm font-medium min-w-[44px] whitespace-nowrap"
                title={invSortDir === "asc" ? "Ascendente" : "Descendente"}
              >
                {invSortDir === "asc" ? "↑ A-Z" : "↓ Z-A"}
              </button>
            </div>
          </div>

          <AdminEditableTable
            items={filteredProductos.slice((invPage - 1) * 20, invPage * 20)}
            loading={loading}
            onEdit={openEdit}
            onDelete={(id) => { setDeleteId(id); setShowDeleteModal(true); }}
            columns={[
              { key: "imagen", header: "Img", render: (p) => p.imagen_principal ? <img src={p.imagen_principal} className="w-10 h-10 rounded object-cover" /> : <div className="w-10 h-10 bg-gray-100 rounded" /> },
              { key: "nombre", header: "Producto", render: (p) => <div><div className="font-medium">{p.nombre}</div><div className="text-xs text-gray-500">{p.sku}</div></div> },
              { key: "tipo", header: "Tipo", render: (p) => <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded-full">{p.tipo_producto}</span> },
              {
                key: "stock",
                header: "Stock",
                render: (p) => (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleQuickStock(p, -1)}
                      className="w-6 h-6 flex items-center justify-center rounded bg-red-100 text-red-700 hover:bg-red-200 text-xs font-bold"
                      title="Restar 1"
                    >
                      -
                    </button>
                    <span className="font-bold min-w-[3ch] text-center">{p.stock}</span>
                    <button
                      onClick={() => handleQuickStock(p, 1)}
                      className="w-6 h-6 flex items-center justify-center rounded bg-green-100 text-green-700 hover:bg-green-200 text-xs font-bold"
                      title="Sumar 1"
                    >
                      +
                    </button>
                    <span className="text-xs text-gray-500 ml-1">{p.unidad}</span>
                  </div>
                )
              },
              {
                key: "estado", header: "Estado", render: (p) => {
                  const st = getStatus(p.stock, p.stock_min);
                  const color = st === "OK" ? "bg-green-100 text-green-800" : st === "BAJO" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800";
                  return <span className={`text-xs px-2 py-1 rounded-full ${color}`}>{st}</span>
                }
              },
              { key: "precio", header: "Precio", render: (p) => formatCurrency(p.precio) },
            ]}
          />

          {/* Pagination Inventory */}
          {filteredProductos.length > 20 && (
            <div className="flex items-center justify-center gap-4 mt-4 pb-8">
              <button
                onClick={() => setInvPage(p => Math.max(1, p - 1))}
                disabled={invPage === 1}
                className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              <span className="text-sm font-medium text-gray-600">
                Página {invPage} de {Math.ceil(filteredProductos.length / 20)}
              </span>
              <button
                onClick={() => setInvPage(p => Math.min(Math.ceil(filteredProductos.length / 20), p + 1))}
                disabled={invPage === Math.ceil(filteredProductos.length / 20)}
                className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => {
                      if (histSortField === "fecha") {
                        setHistSortDir(histSortDir === "asc" ? "desc" : "asc");
                      } else {
                        setHistSortField("fecha");
                        setHistSortDir("desc");
                      }
                    }}
                  >
                    <div className="flex items-center gap-1">
                      Fecha
                      {histSortField === "fecha" && (
                        <span className="text-indigo-600">{histSortDir === "asc" ? "↑" : "↓"}</span>
                      )}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => {
                      if (histSortField === "producto") {
                        setHistSortDir(histSortDir === "asc" ? "desc" : "asc");
                      } else {
                        setHistSortField("producto");
                        setHistSortDir("asc");
                      }
                    }}
                  >
                    <div className="flex items-center gap-1">
                      Producto
                      {histSortField === "producto" && (
                        <span className="text-indigo-600">{histSortDir === "asc" ? "↑" : "↓"}</span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Movimiento</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lote</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Obs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loadingMovs ? <tr><td colSpan={6} className="p-4 text-center">Cargando...</td></tr> : sortedMovimientos.slice((histPage - 1) * 20, histPage * 20).map(m => (
                  <tr key={m.id}>
                    <td className="px-6 py-4 text-sm text-gray-900">{new Date(m.fecha).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{m.productos?.nombre}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${m.tipo_movimiento === 'ENTRADA' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {m.tipo_movimiento}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold">{m.cantidad}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{m.inventario_lotes?.numero_lote || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{m.observacion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination History */}
          {sortedMovimientos.length > 20 && (
            <div className="flex items-center justify-center gap-4 mt-4 pb-8">
              <button
                onClick={() => setHistPage(p => Math.max(1, p - 1))}
                disabled={histPage === 1}
                className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              <span className="text-sm font-medium text-gray-600">
                Página {histPage} de {Math.ceil(sortedMovimientos.length / 20)}
              </span>
              <button
                onClick={() => setHistPage(p => Math.min(Math.ceil(sortedMovimientos.length / 20), p + 1))}
                disabled={histPage === Math.ceil(sortedMovimientos.length / 20)}
                className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal Create/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSave} className="p-6 space-y-6">
              <h2 className="text-xl font-bold">{isEditing ? "Editar Producto" : "Nuevo Producto"}</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre</label>
                  <input required value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} className="w-full px-3 py-2 border rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">SKU</label>
                  <input required value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} className="w-full px-3 py-2 border rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Categoría</label>
                  <select required value={form.categoria_id} onChange={e => setForm({ ...form, categoria_id: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-md">
                    <option value="">Seleccionar...</option>
                    {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo Producto</label>
                  <select required value={form.tipo_producto} onChange={e => setForm({ ...form, tipo_producto: e.target.value })} className="w-full px-3 py-2 border rounded-md">
                    {TIPOS_PRODUCTO.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Precio</label>
                  <input type="number" required value={form.precio} onChange={e => setForm({ ...form, precio: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Stock Actual</label>
                  <input type="number" required value={form.stock} onChange={e => setForm({ ...form, stock: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Stock Mínimo</label>
                  <input type="number" required value={form.stock_min} onChange={e => setForm({ ...form, stock_min: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-md" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Unidad de Medida</label>
                  <input required value={form.unidad} onChange={e => setForm({ ...form, unidad: e.target.value })} placeholder="Ej: unidad, ml, kg" className="w-full px-3 py-2 border rounded-md" />
                </div>
                <div className="flex items-center gap-4 pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.controlar_lotes} onChange={e => setForm({ ...form, controlar_lotes: e.target.checked })} className="w-4 h-4" />
                    <span className="text-sm font-medium">Controlar Lotes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.es_publico} onChange={e => setForm({ ...form, es_publico: e.target.checked })} className="w-4 h-4" />
                    <span className="text-sm font-medium">Visible al Público</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Descripción</label>
                <textarea value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} className="w-full px-3 py-2 border rounded-md h-24" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Imagen Principal</label>
                  <div className="flex items-center gap-4 mt-2 p-3 border rounded-lg bg-gray-50">
                    {imagePreview && <img src={imagePreview} className="w-20 h-20 object-cover rounded border shrink-0" />}
                    <input type="file" accept="image/*" className="flex-1 min-w-0 text-sm text-gray-500" onChange={e => {
                      const f = e.target.files?.[0];
                      if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)); }
                    }} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Imágenes Adicionales (Máx 3)</label>
                  <div className="space-y-2 mt-2">
                    {[0, 1, 2].map((idx) => (
                      <div key={idx} className="flex items-center gap-3 p-2 border rounded bg-gray-50">
                        <input
                          type="file"
                          accept="image/*"
                          className="text-sm flex-1 min-w-0 text-gray-500"
                          onChange={e => {
                            const f = e.target.files?.[0] || null;
                            setExtraFiles(prev => { const n = [...prev]; n[idx] = f; return n; });
                            setExtraPreviews(prev => { const n = [...prev]; n[idx] = f ? URL.createObjectURL(f) : null; return n; });
                          }}
                        />
                        {extraPreviews[idx] && <img src={extraPreviews[idx]!} className="w-10 h-10 object-cover rounded border shrink-0" />}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-md">Cancelar</button>
                <button type="submit" disabled={saving} className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                  {saving ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Eliminar Producto"
        message="¿Estás seguro? Esta acción no se puede deshacer."
        danger
      />
    </div>
  );
}
