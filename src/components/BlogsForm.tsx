"use client";

import { useEffect, useState } from "react";
import AdminEditableTable from "@/components/AdminEditableTable";

export default function BlogsForm() {
  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [publico, setPublico] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [blogs, setBlogs] = useState<Array<{ id: string; created_at: string; titulo: string; contenido: string; publico: boolean; image_url?: string | null }>>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [editing, setEditing] = useState<null | { id: string; created_at: string; titulo: string; contenido: string; publico: boolean; image_url?: string | null }>(null);

  async function fetchBlogs() {
    setLoadingList(true);
    try {
      const res = await fetch("/api/blogs?all=true");
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error al obtener blogs");
      setBlogs(data.blogs || []);
    } catch (err: any) {
      // mostramos en la UI del listado mínimo
    } finally {
      setLoadingList(false);
    }
  }

  async function handleUploadImage(blogId: string, file: File) {
    // 1) Subir imagen
    const fd = new FormData();
    fd.append("file", file);
    const up = await fetch("/api/blogs/upload", { method: "POST", body: fd });
    const upJson = await up.json();
    if (!up.ok || upJson.error) throw new Error(upJson.error || "Error al subir imagen");
    const image_url: string | null = upJson.image_url || null;

    // 2) Actualizar blog con nueva image_url
    const res = await fetch("/api/blogs", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: blogId, image_url }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Error al actualizar imagen del blog");

    // 3) Refrescar listado
    await fetchBlogs();
  }

  useEffect(() => {
    fetchBlogs();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!titulo.trim() || !contenido.trim()) {
      setError("Título y contenido son obligatorios");
      return;
    }
    setLoading(true);
    try {
      // 1) Si hay imagen, primero la subimos para obtener la URL pública
      let image_url: string | null = null;
      if (imageFile) {
        const fd = new FormData();
        fd.append("file", imageFile);
        const up = await fetch("/api/blogs/upload", { method: "POST", body: fd });
        const upJson = await up.json();
        if (!up.ok || upJson.error) throw new Error(upJson.error || "Error al subir imagen");
        image_url = upJson.image_url || null;
      }

      const res = await fetch("/api/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo, contenido, publico, image_url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error al crear el blog");
      setSuccess("Blog creado correctamente");
      setTitulo("");
      setContenido("");
      setPublico(false);
      setImageFile(null);
      setImagePreview(null);
      fetchBlogs();
    } catch (err: any) {
      setError(err.message || "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  async function handleEdit(blog: { id: string; created_at: string; titulo: string; contenido: string; publico: boolean; image_url?: string | null }) {
    setEditing(blog);
    setTitulo(blog.titulo);
    setContenido(blog.contenido);
    setPublico(blog.publico);
    setImageFile(null);
    setImagePreview(blog.image_url || null);
  }

  async function handleUpdate() {
    setError(null);
    setSuccess(null);
    if (!editing) return;
    if (!titulo.trim() || !contenido.trim()) {
      setError("Título y contenido son obligatorios");
      return;
    }
    setLoading(true);
    try {
      let image_url: string | null | undefined = imagePreview || editing.image_url || null;
      if (imageFile) {
        const fd = new FormData();
        fd.append("file", imageFile);
        const up = await fetch("/api/blogs/upload", { method: "POST", body: fd });
        const upJson = await up.json();
        if (!up.ok || upJson.error) throw new Error(upJson.error || "Error al subir imagen");
        image_url = upJson.image_url || null;
      }

      const res = await fetch("/api/blogs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editing.id, titulo, contenido, publico, image_url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error al actualizar el blog");
      setSuccess("Blog actualizado");
      setEditing(null);
      setTitulo("");
      setContenido("");
      setPublico(false);
      setImageFile(null);
      setImagePreview(null);
      fetchBlogs();
    } catch (err: any) {
      setError(err.message || "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar blog?")) return;
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await fetch("/api/blogs", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error al eliminar");
      setSuccess("Blog eliminado");
      if (editing?.id === id) setEditing(null);
      fetchBlogs();
    } catch (err: any) {
      setError(err.message || "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">{editing ? "Editar Blog" : "Crear un Blog"}</h2>
        <form onSubmit={editing ? (e) => { e.preventDefault(); handleUpdate(); } : handleSubmit}>
          <div className="mb-2">
            <label className="block font-medium">Título</label>
            <input
              type="text"
              className="w-full border rounded px-2 py-1"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej: Consejos para el cuidado de tu mascota"
            />
          </div>
          <div className="mb-2">
            <label className="block font-medium">Contenido</label>
            <textarea
              className="w-full border rounded px-2 py-1 min-h-[120px]"
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              placeholder="Escribe el contenido del blog..."
            />
          </div>
          <div className="mb-3">
            <label className="block font-medium">Imagen</label>
            <div className="flex items-center gap-3 flex-wrap">
              <input aria-label="..." className="block w-full sm:w-auto"
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
          </div>
          <div className="mb-3 flex items-center gap-2">
            <input
              id="publico"
              type="checkbox"
              checked={publico}
              onChange={(e) => setPublico(e.target.checked)}
            />
            <label htmlFor="publico" className="font-medium">Público</label>
          </div>
          {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
          {success && <p className="text-green-600 text-sm mb-2">{success}</p>}
          <div className="flex items-center gap-2 mt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-lg font-semibold text-white bg-indigo-500 hover:bg-indigo-600 transition-colors duration-300"
            >
              {loading ? (editing ? "Actualizando..." : "Guardando...") : (editing ? "Actualizar" : "Crear Blog")}
            </button>
            
            {editing && (
              <button type="button" className="px-3 py-2 rounded border" onClick={() => {
                setEditing(null);
                setTitulo("");
                setContenido("");
                setPublico(false);
                setImageFile(null);
                setImagePreview(null);
              }}>Cancelar</button>
            )}
          </div>
        </form>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Blogs</h3>
        <AdminEditableTable
          items={blogs}
          loading={loadingList}
          emptyText="Sin blogs aún."
          onEdit={(b) => handleEdit(b)}
          onDelete={(id) => handleDelete(id)}
          columns={[
            { key: "imagen", header: "Imagen", className: "w-[140px]", render: (b) => (
              <div className="flex">
                <div className="flex flex-col items-center w-16">
                  {b.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={b.image_url} alt={b.titulo} className="w-14 h-14 object-cover rounded" />
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
                          await handleUploadImage(b.id, file);
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
            { key: "titulo", header: "Título", render: (b) => b.titulo },
            { key: "fecha", header: "Creado", render: (b) => new Date(b.created_at).toLocaleString() },
            { key: "publico", header: "Público", render: (b) => (b.publico ? "Sí" : "No") },
          ]}
        />
      </div>
    </div>
  );
}
