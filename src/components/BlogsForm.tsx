"use client";

import { useEffect, useMemo, useState } from "react";
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
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [q, setQ] = useState("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

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

  // Filtros (título y fecha)
  const filteredBlogs = useMemo(() => {
    const query = q.trim().toLowerCase();
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;
    const fromBoundary = from ? new Date(from.getFullYear(), from.getMonth(), from.getDate(), 0, 0, 0, 0) : null;
    const toBoundary = to ? new Date(to.getFullYear(), to.getMonth(), to.getDate(), 23, 59, 59, 999) : null;
    return blogs.filter((b) => {
      const tOk = !query || (b.titulo || "").toLowerCase().includes(query);
      if (!fromBoundary && !toBoundary) return tOk;
      const created = b.created_at ? new Date(b.created_at) : null;
      const afterFrom = !fromBoundary || (created && created >= fromBoundary);
      const beforeTo = !toBoundary || (created && created <= toBoundary);
      return tOk && afterFrom && beforeTo;
    });
  }, [blogs, q, fromDate, toDate]);

  // Reiniciar a la primera página cuando cambia el tamaño del listado filtrado
  useEffect(() => {
    setPage(1);
  }, [filteredBlogs.length]);

  // Preview Markdown simplificado (seguro con escape + reemplazos sencillos)
  function escapeHtml(s: string) {
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function applyInline(md: string) {
    let out = md;
    // negrita **texto**
    out = out.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    // cursiva _texto_
    out = out.replace(/_(.+?)_/g, "<em>$1</em>");
    // code `texto`
    out = out.replace(/`([^`]+)`/g, "<code class=\"px-1 py-0.5 bg-gray-200 rounded\">$1</code>");
    return out;
  }

  function renderMarkdown(md: string) {
    const lines = md.split(/\r?\n/);
    const html: string[] = [];
    let inList = false;
    for (const raw of lines) {
      const h1 = raw.match(/^#\s+(.+)/);
      const h2 = raw.match(/^##\s+(.+)/);
      const h3 = raw.match(/^###\s+(.+)/);
      if (/^\s*-\s+/.test(raw)) {
        if (!inList) {
          html.push('<ul class="list-disc pl-6 mb-2">');
          inList = true;
        }
        const item = applyInline(escapeHtml(raw.replace(/^\s*-\s+/, "")));
        html.push(`<li>${item}</li>`);
        continue;
      } else if (inList) {
        html.push('</ul>');
        inList = false;
      }

      if (h3) {
        html.push(`<h3 class="text-lg font-semibold mt-3">${applyInline(escapeHtml(h3[1]))}</h3>`);
      } else if (h2) {
        html.push(`<h2 class="text-xl font-bold mt-3">${applyInline(escapeHtml(h2[1]))}</h2>`);
      } else if (h1) {
        html.push(`<h1 class="text-2xl font-bold mt-3">${applyInline(escapeHtml(h1[1]))}</h1>`);
      } else if (raw.trim() === "") {
        html.push('<div class="h-2"></div>');
      } else {
        html.push(`<p class="mb-2 leading-relaxed">${applyInline(escapeHtml(raw))}</p>`);
      }
    }
    if (inList) html.push('</ul>');
    return html.join("");
  }

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
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow p-5">
        <h2 className="text-xl font-bold mb-4">{editing ? "Editar Blog" : "Crear un Blog"}</h2>
        <form onSubmit={editing ? (e) => { e.preventDefault(); handleUpdate(); } : handleSubmit} className="space-y-6">
          <div>
            <h3 className="text-xs font-semibold tracking-wide text-indigo-600">Información del Blog</h3>
            <div className="grid grid-cols-1 gap-4 mt-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Título *</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ej: Consejos para el cuidado de tu mascota"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Contenido *</label>
                {/* Editor con toolbar básica */}
                <div className="rounded-md border">
                  <div className="flex flex-wrap gap-1 p-2 border-b bg-gray-50">
                    <button type="button" className="px-2 py-1 text-sm rounded hover:bg-gray-100" onClick={() => setContenido((v) => v + "\n\n**negrita**")}>B</button>
                    <button type="button" className="px-2 py-1 text-sm rounded hover:bg-gray-100" onClick={() => setContenido((v) => v + "\n\n_cursiva_")}>I</button>
                    <button type="button" className="px-2 py-1 text-sm rounded hover:bg-gray-100" onClick={() => setContenido((v) => v + "\n\n- elemento de lista")}>Lista</button>
                    <button type="button" className="px-2 py-1 text-sm rounded hover:bg-gray-100" onClick={() => setContenido((v) => v + "\n\n# Título")}>H1</button>
                    <button type="button" className="px-2 py-1 text-sm rounded hover:bg-gray-100" onClick={() => setContenido((v) => v + "\n\n## Subtítulo")}>H2</button>
                  </div>
                  <textarea
                    className="w-full px-3 py-2 min-h-[160px]"
                    value={contenido}
                    onChange={(e) => setContenido(e.target.value)}
                    placeholder="Escribe el contenido del blog... (admite markdown sencillo)"
                  />
                </div>
                {/* Vista previa (render markdown simple) */}
                <div className="mt-2 text-xs text-gray-500">Vista previa</div>
                <div
                  className="mt-1 border rounded-md p-3 text-gray-800 bg-gray-50 min-h-[80px]"
                  dangerouslySetInnerHTML={{ __html: contenido ? renderMarkdown(contenido) : "<span class=\\\"text-gray-400\\\">(Vacío)</span>" }}
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold tracking-wide text-indigo-600">Imagen y Configuración</h3>
            <div className="grid grid-cols-1 gap-4 mt-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Imagen</label>
                <div className="flex items-center gap-3 flex-wrap">
                  <input 
                    aria-label="Subir imagen del blog" 
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
              </div>
              <div className="flex items-center gap-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Público</label>
                  <button
                    type="button"
                    aria-pressed={publico}
                    onClick={() => setPublico(!publico)}
                    className={`relative inline-flex items-center h-8 rounded-full w-14 transition-colors ${publico ? 'bg-emerald-600' : 'bg-gray-300'}`}
                    title="Marcar si el blog es público"
                  >
                    <span
                      className={`inline-block w-7 h-7 transform bg-white rounded-full shadow transition-transform ${publico ? 'translate-x-6' : 'translate-x-1'}`}
                    />
                  </button>
                </div>
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
              {loading ? (editing ? "Actualizando..." : "Guardando...") : (editing ? "Actualizar Blog" : "Guardar Blog")}
            </button>
            
            {editing && (
              <button 
                type="button" 
                className="px-4 py-2 rounded-md border" 
                onClick={() => {
                  setEditing(null);
                  setTitulo("");
                  setContenido("");
                  setPublico(false);
                  setImageFile(null);
                  setImagePreview(null);
                }}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow p-5">
        <h3 className="text-lg font-semibold mb-2">Blogs</h3>
        {/* Filtros estilo Stock: título y fecha */}
        <div className="p-0 mb-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por título..."
              className="px-3 py-2 border rounded-lg"
            />
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="px-3 py-2 border rounded-lg"
              title="Desde"
            />
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="px-3 py-2 border rounded-lg"
              title="Hasta"
            />
          </div>
        </div>
        {(() => {
          const totalPages = Math.max(1, Math.ceil(filteredBlogs.length / pageSize));
          const start = (page - 1) * pageSize;
          const pageItems = filteredBlogs.slice(start, start + pageSize);
          const goTo = (p: number) => setPage(Math.min(totalPages, Math.max(1, p)));
          return (
            <>
              <AdminEditableTable
          items={pageItems}
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
              {filteredBlogs.length > 0 && (
                <div className="mt-4 flex items-center justify-center gap-2">
                  <button
                    className="px-3 py-2 rounded border bg-white disabled:opacity-50"
                    onClick={() => goTo(page - 1)}
                    disabled={page <= 1 || loadingList}
                  >
                    Anterior
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }).slice(0, 7).map((_, i) => {
                      const idx = i + 1;
                      if (totalPages > 7 && idx > 5 && idx < totalPages) {
                        return null;
                      }
                      return (
                        <button
                          key={idx}
                          onClick={() => goTo(idx)}
                          className={`min-w-9 h-9 px-3 py-2 rounded border text-sm ${page === idx ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white hover:bg-gray-50'}`}
                          disabled={loadingList}
                        >
                          {idx}
                        </button>
                      );
                    })}
                    {totalPages > 7 && (
                      <>
                        <span className="px-1">…</span>
                        <button
                          onClick={() => goTo(totalPages)}
                          className={`min-w-9 h-9 px-3 py-2 rounded border text-sm ${page === totalPages ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white hover:bg-gray-50'}`}
                          disabled={loadingList}
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                  </div>
                  <button
                    className="px-3 py-2 rounded border bg-white disabled:opacity-50"
                    onClick={() => goTo(page + 1)}
                    disabled={page >= totalPages || loadingList}
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </>
          );
        })()}
      </div>
    </div>
  );
}
