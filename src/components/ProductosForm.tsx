"use client";

import { useEffect, useState } from "react";
import AdminEditableTable from "@/components/AdminEditableTable";

export default function ProductosForm() {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [sku, setSku] = useState("");
  const [categoria, setCategoria] = useState("");
  const [stock, setStock] = useState("");
  const [publico, setPublico] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [extraFiles, setExtraFiles] = useState<Array<File | null>>([null, null, null]);
  const [extraPreviews, setExtraPreviews] = useState<Array<string | null>>([null, null, null]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [productos, setProductos] = useState<Array<{ 
    id: string; 
    created_at: string; 
    nombre: string; 
    descripcion: string; 
    precio: number; 
    sku: string; 
    categoria: string; 
    stock: number; 
    publico?: boolean;
    imagen_principal?: string | null;
    imagenes?: string[];
    updated_at?: string;
  }>>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [selectedEstados, setSelectedEstados] = useState<string[]>([]); // "Agotados" | "Disponibles"
  const [selectedCategorias, setSelectedCategorias] = useState<string[]>([]); // "Alimentos" | "Medicamentos" | "Accesorios"
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<null | { 
    id: string; 
    created_at: string; 
    nombre: string; 
    descripcion: string; 
    precio: number; 
    sku: string; 
    categoria: string; 
    stock: number; 
    publico?: boolean;
    imagen_principal?: string | null;
    imagenes?: string[];
    updated_at?: string;
  }>(null);

  async function fetchProductos() {
    setLoadingList(true);
    try {
      const res = await fetch("/api/productos?all=true");
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error al obtener productos");
      setProductos(data.productos || []);
    } catch (err: any) {
      // mostramos en la UI del listado mínimo
    } finally {
      setLoadingList(false);
    }
  }

  async function handleUploadImage(productoId: string, file: File) {
    // 1) Subir imagen
    const fd = new FormData();
    fd.append("file", file);
    const up = await fetch("/api/productos/upload", { method: "POST", body: fd });
    const upJson = await up.json();
    if (!up.ok || upJson.error) throw new Error(upJson.error || "Error al subir imagen");
    const imagen_principal: string | null = upJson.image_url || null;

    // 2) Actualizar producto con nueva imagen_principal
    const res = await fetch("/api/productos", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: productoId, imagen_principal }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Error al actualizar imagen del producto");

    // 3) Refrescar listado
    await fetchProductos();
  }

  useEffect(() => {
    fetchProductos();
  }, []);

  async function handleAdjustStock(id: string, currentStock: number, delta: number) {
    const next = Math.max(0, (currentStock || 0) + delta);
    try {
      await fetch("/api/productos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, stock: next })
      });
      await fetchProductos();
    } catch (err) {
      // silencio en UI, el recargado mostrará estado actual
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    const precioNum = parseFloat(precio);
    const stockNum = parseInt(stock);
    
    if (!nombre.trim() || !descripcion.trim() || !sku.trim() || precioNum <= 0 || stockNum < 0) {
      setError("Nombre, descripción, SKU, precio y stock son obligatorios");
      return;
    }
    
    setLoading(true);
    try {
      // 1) Si hay imagen, primero la subimos para obtener la URL pública
      let imagen_principal: string | null = null;
      if (imageFile) {
        const fd = new FormData();
        fd.append("file", imageFile);
        const up = await fetch("/api/productos/upload", { method: "POST", body: fd });
        const upJson = await up.json();
        if (!up.ok || upJson.error) throw new Error(upJson.error || "Error al subir imagen");
        imagen_principal = upJson.image_url || null;
      }

      // (crear) Subir hasta 3 imágenes adicionales
      const imagenes: string[] = [];
      for (const file of extraFiles) {
        if (!file) continue;
        const fd = new FormData();
        fd.append("file", file);
        const up = await fetch("/api/productos/upload", { method: "POST", body: fd });
        const upJson = await up.json();
        if (!up.ok || upJson.error) throw new Error(upJson.error || "Error al subir imagen adicional");
        if (upJson.image_url) imagenes.push(upJson.image_url);
      }

      

      const res = await fetch("/api/productos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          nombre, 
          descripcion, 
          precio: precioNum, 
          sku, 
          categoria, 
          stock: stockNum, 
          publico,
          imagen_principal, 
          imagenes
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error al crear el producto");
      setSuccess("Producto creado correctamente");
      setNombre("");
      setDescripcion("");
      setPrecio("");
      setSku("");
      setCategoria("");
      setStock("");
      setPublico(false);
      setImageFile(null);
      setImagePreview(null);
      setExtraFiles([null, null, null]);
      setExtraPreviews([null, null, null]);
      fetchProductos();
    } catch (err: any) {
      setError(err.message || "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  async function handleEdit(producto: { 
    id: string; 
    created_at: string; 
    nombre: string; 
    descripcion: string; 
    precio: number; 
    sku: string; 
    categoria: string; 
    stock: number; 
    publico?: boolean;
    imagen_principal?: string | null;
    imagenes?: string[];
    updated_at?: string;
  }) {
    setEditing(producto);
    setNombre(producto.nombre);
    setDescripcion(producto.descripcion);
    setPrecio(producto.precio.toString());
    setSku(producto.sku);
    setCategoria(producto.categoria || "");
    setStock(producto.stock.toString());
    setPublico(producto.publico || false);
    setImageFile(null);
    setImagePreview(producto.imagen_principal || null);
    const prevs = [null, null, null] as Array<string | null>;
    (producto.imagenes || []).slice(0, 3).forEach((url, idx) => {
      prevs[idx] = url;
    });
    setExtraPreviews(prevs);
    setExtraFiles([null, null, null]);
  }

  async function handleUpdate() {
    setError(null);
    setSuccess(null);
    if (!editing) return;
    
    const precioNum = parseFloat(precio);
    const stockNum = parseInt(stock);
    
    if (!nombre.trim() || !descripcion.trim() || !sku.trim() || precioNum <= 0 || stockNum < 0) {
      setError("Nombre, descripción, SKU, precio y stock son obligatorios");
      return;
    }
    
    setLoading(true);
    try {
      let imagen_principal: string | null | undefined = imagePreview || editing.imagen_principal || null;
      if (imageFile) {
        const fd = new FormData();
        fd.append("file", imageFile);
        const up = await fetch("/api/productos/upload", { method: "POST", body: fd });
        const upJson = await up.json();
        if (!up.ok || upJson.error) throw new Error(upJson.error || "Error al subir imagen");
        imagen_principal = upJson.image_url || null;
      }

      // (editar) Subir nuevas adicionales si se cargaron; si no, mantener existentes
      let imagenesUpdate: string[] | undefined = (editing.imagenes || []).slice(0, 3);
      if (extraFiles.some((f) => !!f)) {
        imagenesUpdate = [];
        for (const file of extraFiles) {
          if (!file) continue;
          const fd = new FormData();
          fd.append("file", file);
          const up = await fetch("/api/productos/upload", { method: "POST", body: fd });
          const upJson = await up.json();
          if (!up.ok || upJson.error) throw new Error(upJson.error || "Error al subir imagen adicional");
          if (upJson.image_url) imagenesUpdate.push(upJson.image_url);
        }
      }

      const res = await fetch("/api/productos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id: editing.id, 
          nombre, 
          descripcion, 
          precio: precioNum, 
          sku, 
          categoria, 
          stock: stockNum, 
          publico,
          imagen_principal, 
          ...(typeof imagenesUpdate !== 'undefined' ? { imagenes: imagenesUpdate } : {})
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error al actualizar el producto");
      setSuccess("Producto actualizado");
      setEditing(null);
      setNombre("");
      setDescripcion("");
      setPrecio("");
      setSku("");
      setCategoria("");
      setStock("");
      setPublico(false);
      setImageFile(null);
      setImagePreview(null);
      setExtraFiles([null, null, null]);
      setExtraPreviews([null, null, null]);
      fetchProductos();
    } catch (err: any) {
      setError(err.message || "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar producto?")) return;
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await fetch("/api/productos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error al eliminar");
      setSuccess("Producto eliminado");
      if (editing?.id === id) setEditing(null);
      fetchProductos();
    } catch (err: any) {
      setError(err.message || "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Formulario principal: estilo tarjetas Stock */}
      <div className="bg-white rounded-xl shadow p-5">
        <h2 className="text-xl font-bold mb-4">{editing ? "Editar Producto" : "Crear un Producto"}</h2>
        <form onSubmit={editing ? (e) => { e.preventDefault(); handleUpdate(); } : handleSubmit} className="space-y-6">
          <div>
            <h3 className="text-xs font-semibold tracking-wide text-indigo-600">Información Básica</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre *</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Alimento Premium para Perros"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">SKU *</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="Ej: ALI-PER-001"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Descripción *</label>
              <textarea
                className="w-full px-3 py-2 border rounded-md min-h-[120px]"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Describe el producto..."
              />
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold tracking-wide text-indigo-600">Precio y Stock</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Precio (CLP) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border rounded-md"
                  value={precio}
                  onChange={(e) => setPrecio(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Stock *</label>
                <input
                  type="number"
                  min="0"
                  className="w-full px-3 py-2 border rounded-md"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Categoría</label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                >
                  <option value="">Selecciona categoría</option>
                  <option value="Alimentos">Alimentos</option>
                  <option value="Medicamentos">Medicamentos</option>
                  <option value="Accesorios">Accesorios</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold tracking-wide text-indigo-600">Imágenes del Producto</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Imagen Principal</label>
                <div className="flex items-center gap-3 flex-wrap">
                  <input 
                    aria-label="Subir imagen principal del producto" 
                    className="block w-full sm:w-auto px-3 py-2 border rounded-md"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setImageFile(file);
                      setImagePreview(file ? URL.createObjectURL(file) : null);
                    }}
                  />
                  {imagePreview && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imagePreview} alt="preview" className="w-16 h-16 object-cover rounded border shrink-0" />
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">Formatos permitidos: JPG, PNG, WEBP. Máx 4MB.</p>

                <div className="mt-8">
                  <div className="flex items-center gap-2">
                    <div>
                      <label className="block text-sm font-medium mb-1">Público</label>
                      <button
                        type="button"
                        aria-pressed={publico}
                        onClick={() => setPublico(!publico)}
                        className={`relative inline-flex items-center h-8 rounded-full w-14 transition-colors ${publico ? 'bg-emerald-600' : 'bg-gray-300'}`}
                        title="Marcar si el producto es público"
                      >
                        <span
                          className={`inline-block w-7 h-7 transform bg-white rounded-full shadow transition-transform ${publico ? 'translate-x-6' : 'translate-x-1'}`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Imágenes adicionales (hasta 3)</label>
                <div className="grid grid-cols-1 gap-3 mt-1">
                  {[0,1,2].map((idx) => (
                    <div key={idx} className="flex items-center gap-3 flex-wrap">
                      <input 
                        className="block w-full sm:w-auto px-3 py-2 border rounded-md"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setExtraFiles((prev) => {
                            const next = [...prev];
                            next[idx] = file;
                            return next;
                          });
                          setExtraPreviews((prev) => {
                            const next = [...prev];
                            next[idx] = file ? URL.createObjectURL(file) : prev[idx];
                            return next;
                          });
                        }}
                      />
                      {(extraPreviews[idx]) && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={extraPreviews[idx] as string} alt={`extra-${idx+1}`} className="w-16 h-16 object-cover rounded border shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">Opcional. Se reemplazarán si subes nuevas al editar.</p>
              </div>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}

          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`px-5 py-2 rounded-md ${loading ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'text-white bg-indigo-600 hover:bg-indigo-700'}`}
            >
              {loading ? (editing ? "Actualizando..." : "Guardando...") : (editing ? "Actualizar Producto" : "Guardar Producto")}
            </button>
            {editing && (
              <button 
                type="button" 
                className="px-4 py-2 rounded-md border" 
                onClick={() => {
                  setEditing(null);
                  setNombre("");
                  setDescripcion("");
                  setPrecio("");
                  setSku("");
                  setCategoria("");
                  setStock("");
                  setPublico(false);
                  setImageFile(null);
                  setImagePreview(null);
                  setExtraFiles([null, null, null]);
                  setExtraPreviews([null, null, null]);
                }}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Listado de productos con filtros al estilo Stock */}
      <div className="bg-white rounded-xl shadow p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Filtrar:</label>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'Agotados', label: 'Agotados' },
                { key: 'Disponibles', label: 'Disponibles' },
              ].map(({ key, label }) => {
                const active = selectedEstados.includes(key);
                return (
                  <button
                    key={key}
                    type="button"
                    className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${active ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                    onClick={() => {
                      setSelectedEstados((prev) => prev.includes(key) ? prev.filter((v) => v !== key) : [...prev, key]);
                    }}
                    title={`Filtro ${label}`}
                  >
                    {label}
                  </button>
                );
              })}
              {[
                { key: 'Alimentos', label: 'Alimentos' },
                { key: 'Medicamentos', label: 'Medicamentos' },
                { key: 'Accesorios', label: 'Accesorios' },
              ].map(({ key, label }) => {
                const active = selectedCategorias.includes(key);
                return (
                  <button
                    key={key}
                    type="button"
                    className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${active ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                    onClick={() => {
                      setSelectedCategorias((prev) => prev.includes(key) ? prev.filter((v) => v !== key) : [...prev, key]);
                    }}
                    title={`Filtro ${label}`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 px-3 py-2 border rounded-lg"
              placeholder="Buscar por nombre o SKU"
            />
            <div className="text-sm text-gray-600">
              <span className="font-medium">{
                (() => {
                  const filtered = productos.filter((p) => {
                    const estadoOk = selectedEstados.length === 0 || selectedEstados.some((s) => (
                      (s === 'Agotados' && (p.stock || 0) === 0) ||
                      (s === 'Disponibles' && (p.stock || 0) > 0)
                    ));
                    const categoriaOk = selectedCategorias.length === 0 || selectedCategorias.includes(p.categoria || '')
                    const q = search.trim().toLowerCase();
                    const searchOk = q.length === 0 || (p.nombre || '').toLowerCase().includes(q) || (p.sku || '').toLowerCase().includes(q);
                    return estadoOk && categoriaOk && searchOk;
                  });
                  return filtered.length;
                })()
              }</span> ítem(s)
            </div>
          </div>
        </div>

        {(() => {
          const filtered = productos.filter((p) => {
            const estadoOk = selectedEstados.length === 0 || selectedEstados.some((s) => (
              (s === 'Agotados' && (p.stock || 0) === 0) ||
              (s === 'Disponibles' && (p.stock || 0) > 0)
            ));
            const categoriaOk = selectedCategorias.length === 0 || selectedCategorias.includes(p.categoria || '')
            const q = search.trim().toLowerCase();
            const searchOk = q.length === 0 || (p.nombre || '').toLowerCase().includes(q) || (p.sku || '').toLowerCase().includes(q);
            return estadoOk && categoriaOk && searchOk;
          });
          return (
            <AdminEditableTable
              items={filtered}
              loading={loadingList}
              emptyText="Sin productos aún."
              onEdit={(p) => handleEdit(p)}
              onDelete={(id) => handleDelete(id)}
              columns={[
                { key: "imagen", header: "Imagen", className: "w-[140px]", render: (p) => (
                  <div className="flex">
                    <div className="flex flex-col items-center w-16">
                      {p.imagen_principal ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.imagen_principal} alt={p.nombre} className="w-14 h-14 object-cover rounded" />
                      ) : (
                        <span className="w-14 h-14 grid place-items-center text-xs text-gray-400 bg-gray-100 rounded">Sin imagen</span>
                      )}
                      <label className="mt-1 text-xs text-blue-600 cursor-pointer">
                        Subir
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            try {
                              await handleUploadImage(p.id, file);
                            } catch (err: any) {
                              alert(err.message || "Error subiendo imagen");
                            } finally {
                              e.currentTarget.value = "";
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                ) },
                { key: "nombre", header: "Nombre", render: (p) => p.nombre },
                { key: "sku", header: "SKU", render: (p) => p.sku },
                { key: "precio", header: "Precio", render: (p) => `$${p.precio.toLocaleString()}` },
                { key: "stock", header: "Stock", render: (p) => p.stock },
                { key: "categoria", header: "Categoría", render: (p) => p.categoria || "-" },
                { key: "fecha", header: "Creado", render: (p) => new Date(p.created_at).toLocaleString() },
                { key: "ajuste", header: "", render: (p) => (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="px-2 py-1 rounded border"
                      title="Restar 1 del stock"
                      onClick={() => handleAdjustStock(p.id, p.stock, -1)}
                    >
                      −
                    </button>
                    <button
                      type="button"
                      className="px-2 py-1 rounded border"
                      title="Sumar 1 al stock"
                      onClick={() => handleAdjustStock(p.id, p.stock, 1)}
                    >
                      +
                    </button>
                  </div>
                ) },
              ]}
            />
          );
        })()}
      </div>
    </div>
  );
}
