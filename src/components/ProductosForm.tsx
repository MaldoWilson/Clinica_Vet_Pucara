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
    <div className="space-y-8">
      {/* Formulario */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">{editing ? "Editar Producto" : "Crear un Producto"}</h2>
        <form onSubmit={editing ? (e) => { e.preventDefault(); handleUpdate(); } : handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block font-medium">Nombre *</label>
              <input
                type="text"
                className="w-full border rounded px-2 py-1"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Alimento Premium para Perros"
              />
            </div>
            <div>
              <label className="block font-medium">SKU *</label>
              <input
                type="text"
                className="w-full border rounded px-2 py-1"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="Ej: ALI-PER-001"
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block font-medium">Descripción *</label>
            <textarea
              className="w-full border rounded px-2 py-1 min-h-[120px]"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Describe el producto..."
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block font-medium">Precio (CLP) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full border rounded px-2 py-1"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                placeholder="0"
              />
            </div>
            <div>
              <label className="block font-medium">Stock *</label>
              <input
                type="number"
                min="0"
                className="w-full border rounded px-2 py-1"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="0"
              />
            </div>
            <div>
              <label className="block font-medium">Categoría</label>
              <select
                className="w-full border rounded px-2 py-1 bg-white"
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
          
          <div className="mb-3">
            <label className="block font-medium">Imagen Principal</label>
            <div className="flex items-center gap-3">
              <input aria-label="..."
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
                <img src={imagePreview} alt="preview" className="w-16 h-16 object-cover rounded border" />
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">Formatos permitidos: JPG, PNG, WEBP. Máx 4MB.</p>
          </div>

          {/* Imágenes adicionales */}
          <div className="mb-3">
            <label className="block font-medium">Imágenes adicionales (hasta 3)</label>
            <div className="grid grid-cols-1 gap-3 mt-1">
              {[0,1,2].map((idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <input
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
                    <img src={extraPreviews[idx] as string} alt={`extra-${idx+1}`} className="w-16 h-16 object-cover rounded border" />
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">Opcional. Se reemplazarán si subes nuevas al editar.</p>
          </div>
          
          {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
          {success && <p className="text-green-600 text-sm mb-2">{success}</p>}
          <div className="flex items-center gap-2 mt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-lg font-semibold text-white bg-indigo-500 hover:bg-indigo-600 transition-colors duration-300"
            >
              {loading ? (editing ? "Actualizando..." : "Guardando...") : (editing ? "Actualizar" : "Crear Producto")}
            </button>
            
            {editing && (
              <button type="button" className="px-3 py-2 rounded border" onClick={() => {
                setEditing(null);
                setNombre("");
                setDescripcion("");
                setPrecio("");
                setSku("");
                setCategoria("");
                setStock("");
                setImageFile(null);
                setImagePreview(null);
                setExtraFiles([null, null, null]);
                setExtraPreviews([null, null, null]);
              }}>Cancelar</button>
            )}
          </div>
        </form>
      </div>

      {/* Tabla */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Productos</h3>
        {/* Filtros */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Filtrar:</label>
            <div className="flex flex-wrap gap-2">
              {/* Estados */}
              {[
                { key: 'Agotados', label: 'Agotados' },
                { key: 'Disponibles', label: 'Disponibles' },
              ].map(({ key, label }) => {
                const active = selectedEstados.includes(key);
                return (
                  <button
                    key={key}
                    type="button"
                    className={`px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${active ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                    onClick={() => {
                      setSelectedEstados((prev) => prev.includes(key) ? prev.filter((v) => v !== key) : [...prev, key]);
                    }}
                    title={`Filtro ${label}`}
                  >
                    {label}
                  </button>
                );
              })}
              {/* Categorías */}
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
                    className={`px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${active ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
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
              className="w-64 border rounded px-2 py-1"
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
