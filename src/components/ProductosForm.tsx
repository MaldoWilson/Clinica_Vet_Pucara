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
          imagen_principal 
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
          imagen_principal 
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
              }}>Cancelar</button>
            )}
          </div>
        </form>
      </div>

      {/* Tabla */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Productos</h3>
        <AdminEditableTable
          items={productos}
          loading={loadingList}
          emptyText="Sin productos aún."
          onEdit={(p) => handleEdit(p)}
          onDelete={(id) => handleDelete(id)}
          columns={[
            { key: "imagen", header: "Imagen", render: (p) => (
              <div className="flex items-center gap-3">
                {p.imagen_principal ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.imagen_principal} alt={p.nombre} className="w-14 h-14 object-cover rounded" />
                ) : (
                  <span className="w-14 h-14 grid place-items-center text-xs text-gray-400 bg-gray-100 rounded">Sin imagen</span>
                )}
                <label className="text-xs text-blue-600 cursor-pointer">
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
            ) },
            { key: "nombre", header: "Nombre", render: (p) => p.nombre },
            { key: "sku", header: "SKU", render: (p) => p.sku },
            { key: "precio", header: "Precio", render: (p) => `$${p.precio.toLocaleString()}` },
            { key: "stock", header: "Stock", render: (p) => p.stock },
            { key: "categoria", header: "Categoría", render: (p) => p.categoria || "-" },
            { key: "fecha", header: "Creado", render: (p) => new Date(p.created_at).toLocaleString() },
          ]}
        />
      </div>
    </div>
  );
}
