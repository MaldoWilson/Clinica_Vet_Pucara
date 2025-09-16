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

  const [form, setForm] = useState({
    nombre: "",
    especialidad: "",
  });
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

  useEffect(() => {
    loadItems();
  }, []);

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

      // Primero crear/actualizar el registro para obtener id si es nuevo
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

      // Si hay imagen, subirla con la ruta de upload dedicada
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
    <div className="space-y-8">

      {error && (
        <div className="p-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>
      )}

      {/* Formulario */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4">{isEdit ? "Editar integrante" : "Nuevo integrante"}</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre</label>
            <input
              className="w-full rounded border px-3 py-2"
              value={form.nombre}
              onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
              required
              placeholder="Nombre"
              aria-label="Nombre"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Especialidad</label>
            <input
              className="w-full rounded border px-3 py-2"
              value={form.especialidad}
              onChange={(e) => setForm((f) => ({ ...f, especialidad: e.target.value }))}
              placeholder="Especialidad"
              aria-label="Especialidad"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Foto</label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setImageFile(file);
                  setImagePreview(file ? URL.createObjectURL(file) : null);
                }}
                aria-label="Subir foto"
              />
              {imagePreview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imagePreview} alt="preview" className="w-16 h-16 object-cover rounded border" />
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">Formatos permitidos: JPG, PNG, WEBP. Máx 4MB.</p>
          </div>
          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="px-6 py-3 rounded-lg font-semibold text-white bg-indigo-500 hover:bg-indigo-600 transition-colors duration-300"
              disabled={saving}
            >
              {saving ? "Guardando..." : isEdit ? "Actualizar" : "Crear Integrante"}
            </button>
            {isEdit && (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center px-3 py-2 rounded border"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <AdminEditableTable
        items={items}
        loading={loading}
        emptyText="Sin integrantes"
        onEdit={(item) => handleEdit(item)}
        onDelete={(id) => handleDelete(id)}
        onUploadImage={async (id, file) => {
          try {
            await handleUploadInline(id, file);
          } catch (err: any) {
            alert(err.message || "Error subiendo imagen");
          }
        }}
        columns={[
          {
            key: "foto",
            header: "Foto",
            render: (v: Veterinario) => (
              <div className="flex items-center gap-3">
                {v.foto_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={v.foto_url} alt={v.nombre} className="w-14 h-14 object-cover rounded" />
                ) : (
                  <div className="w-14 h-14 bg-gray-100 rounded grid place-items-center text-xs text-gray-400">Sin imagen</div>
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
                      const input = e.currentTarget;
                      await handleUploadInline(v.id, file);
                      if (input) input.value = "";
                    }}
                  />
                </label>
              </div>
            ),
          },
          { key: "nombre", header: "Nombre", render: (v: Veterinario) => <span className="font-medium">{v.nombre}</span> },
          { key: "especialidad", header: "Especialidad", render: (v: Veterinario) => <span className="text-sm text-gray-600">{v.especialidad || "-"}</span> },
          { key: "creado", header: "Creado", render: (v: Veterinario) => <span className="text-sm text-gray-500">{v.creado_en ? new Date(v.creado_en).toLocaleString() : "-"}</span> },
        ]}
      />
    </div>
  );
}


