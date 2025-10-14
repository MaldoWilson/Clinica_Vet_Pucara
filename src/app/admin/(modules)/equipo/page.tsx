"use client";
import { useEffect, useMemo, useState } from "react";
import AdminEditableTable from "@/components/AdminEditableTable";

type Veterinario = {
  id: string;
  nombre: string;
  especialidad: string | null;
  foto_url: string | null;
  creado_en: string | null;
};

export default function AdminEquipoPage() {
  const [items, setItems] = useState<Veterinario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Veterinario | null>(null);

  const [form, setForm] = useState({ nombre: "", especialidad: "" });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const isEdit = useMemo(() => Boolean(editing?.id), [editing]);

  const loadItems = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/Veterinarios", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Error al cargar");
      setItems(json.data || []);
    } catch (e: any) {
      setError(e.message || "Error al cargar");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadItems(); }, []);

  const resetForm = () => {
    setEditing(null);
    setForm({ nombre: "", especialidad: "" });
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      let payload: any = {
        nombre: form.nombre.trim(),
        especialidad: form.especialidad.trim() || null,
      };
      let method: "POST" | "PUT" = "POST";
      if (isEdit && editing) {
        method = "PUT";
        payload.id = editing.id;
      }
      const res = await fetch("/api/Veterinarios", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Error guardando");
      const saved: Veterinario = json.data;
      if (imageFile) {
        const fd = new FormData();
        fd.append("veterinarioId", saved.id);
        fd.append("file", imageFile);
        const up = await fetch("/api/Veterinarios/upload", { method: "POST", body: fd });
        const upJson = await up.json();
        if (!up.ok || upJson.error) throw new Error(upJson.error || "Error subiendo imagen");
      }
      resetForm();
      await loadItems();
    } catch (e: any) {
      setError(e.message || "Error guardando");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (v: Veterinario) => {
    setEditing(v);
    setForm({ nombre: v.nombre || "", especialidad: v.especialidad || "" });
    setImageFile(null);
    setImagePreview(v.foto_url || null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar integrante del equipo?")) return;
    try {
      setSaving(true);
      setError(null);
      const res = await fetch("/api/Veterinarios", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Error eliminando");
      await loadItems();
    } catch (e: any) {
      setError(e.message || "Error eliminando");
    } finally {
      setSaving(false);
    }
  };

  const handleUploadInline = async (id: string, file: File) => {
    const fd = new FormData();
    fd.append("veterinarioId", id);
    fd.append("file", file);
    const res = await fetch("/api/Veterinarios/upload", { method: "POST", body: fd });
    const json = await res.json();
    if (!res.ok || json.error) throw new Error(json.error || "Error subiendo imagen");
    await loadItems();
  };

  return (
    <div className="space-y-8 max-w-[90rem] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión del Equipo</h1>
          <p className="text-gray-600">Administra el personal veterinario</p>
        </div>
      </div>
      {error && (<div className="p-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>)}
      <div className="relative overflow-hidden rounded-2xl ring-1 ring-gray-200/70 bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-indigo-400 to-indigo-600" />
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-4">{isEdit ? "Editar integrante" : "Nuevo integrante"}</h3>
          <form onSubmit={handleSubmit}>
            <div className="rounded-xl ring-1 ring-gray-200 p-4 bg-white/90 mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold tracking-wide text-indigo-600">Información del Integrante</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <div>
                  <label className="block font-medium">Nombre *</label>
                  <input 
                    className="w-full rounded-lg border border-indigo-300/70 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 bg-white" 
                    value={form.nombre} 
                    onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))} 
                    required 
                    placeholder="Nombre" 
                    aria-label="Nombre" 
                  />
                </div>
                <div>
                  <label className="block font-medium">Especialidad</label>
                  <input 
                    className="w-full rounded-lg border border-indigo-300/70 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 bg-white" 
                    value={form.especialidad} 
                    onChange={(e) => setForm((f) => ({ ...f, especialidad: e.target.value }))} 
                    placeholder="Especialidad" 
                    aria-label="Especialidad" 
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl ring-1 ring-gray-200 p-4 bg-white/90 mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold tracking-wide text-indigo-600">Foto del Integrante</h3>
              </div>
              <div className="mt-3">
                <label className="block font-medium">Foto</label>
                <div className="flex items-center gap-3 flex-wrap">
                  <input 
                    className="block w-full sm:w-auto rounded-lg border border-indigo-300/70 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 bg-white" 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => { 
                      const file = e.target.files?.[0] || null; 
                      setImageFile(file); 
                      setImagePreview(file ? URL.createObjectURL(file) : null); 
                    }} 
                    aria-label="Subir foto" 
                  />
                  {imagePreview && (<img src={imagePreview} alt="preview" className="w-16 h-16 object-cover rounded border shrink-0" />)}
                </div>
                <p className="text-xs text-gray-500 mt-1">Formatos permitidos: JPG, PNG, WEBP. Máx 4MB.</p>
              </div>
            </div>

            <div className="flex items-end gap-2">
              <button 
                type="submit" 
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${saving ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'text-white bg-indigo-600 hover:bg-indigo-700'}`} 
                disabled={saving}
              >
                {saving ? "Guardando..." : isEdit ? "Actualizar" : "Crear Integrante"}
              </button>
              {isEdit && (
                <button 
                  type="button" 
                  onClick={resetForm} 
                  className="px-3 py-2 rounded-lg ring-1 ring-gray-300 bg-white hover:bg-gray-50"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
      <AdminEditableTable
        items={items}
        loading={loading}
        emptyText="Sin integrantes"
        onEdit={(item) => handleEdit(item)}
        onDelete={(id) => handleDelete(id)}
        onUploadImage={async (id, file) => { try { await handleUploadInline(id, file); } catch (err: any) { alert(err.message || "Error subiendo imagen"); } }}
        columns={[
          { key: "foto", header: "Foto", className: "w-[140px]", render: (v: Veterinario) => (
            <div className="flex">
              <div className="flex flex-col items-center w-16">
                {v.foto_url ? (
                  <img src={v.foto_url} alt={v.nombre} className="w-14 h-14 object-cover rounded" />
                ) : (
                  <div className="w-14 h-14 bg-gray-100 rounded grid place-items-center text-xs text-gray-400">Sin imagen</div>
                )}
                <label className="mt-1 text-xs text-blue-600 cursor-pointer">
                  Subir
                  <input type="file" accept="image/*" className="hidden" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; const input = e.currentTarget; await handleUploadInline(v.id, file); if (input) input.value = ""; }} />
                </label>
              </div>
            </div>
          ) },
          { key: "nombre", header: "Nombre", render: (v: Veterinario) => <span className="font-medium">{v.nombre}</span> },
          { key: "especialidad", header: "Especialidad", render: (v: Veterinario) => <span className="text-sm text-gray-600">{v.especialidad || "-"}</span> },
          { key: "creado", header: "Creado", render: (v: Veterinario) => <span className="text-sm text-gray-500">{v.creado_en ? new Date(v.creado_en).toLocaleString() : "-"}</span> },
        ]}
      />
    </div>
  );
}


