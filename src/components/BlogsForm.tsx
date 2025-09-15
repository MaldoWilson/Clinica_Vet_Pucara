"use client";

import { useEffect, useState } from "react";

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

  return (
    <div className="p-4 border rounded-md bg-white shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Crear un Blog</h2>
      <form onSubmit={handleSubmit}>
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
          <div className="flex items-center gap-3">
            <input
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
        <button
          type="submit"
          disabled={loading}
          className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-60"
        >
          {loading ? "Guardando..." : "Guardar Blog"}
        </button>
      </form>
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Listado interno (todos los blogs)</h3>
        {loadingList ? (
          <p className="text-sm text-gray-600">Cargando...</p>
        ) : blogs.length === 0 ? (
          <p className="text-sm text-gray-600">Sin blogs aún.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-2 border">Fecha</th>
                  <th className="text-left p-2 border">Título</th>
                  <th className="text-left p-2 border">Imagen</th>
                  <th className="text-left p-2 border">Público</th>
                </tr>
              </thead>
              <tbody>
                {blogs.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="p-2 border align-top">{new Date(b.created_at).toLocaleString()}</td>
                    <td className="p-2 border align-top">{b.titulo}</td>
                    <td className="p-2 border align-top">
                      {b.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={b.image_url} alt={b.titulo} className="w-14 h-14 object-cover rounded" />
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="p-2 border align-top">{b.publico ? "Sí" : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
