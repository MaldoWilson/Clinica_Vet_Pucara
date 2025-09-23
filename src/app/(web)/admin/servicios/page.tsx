"use client";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import AdminEditableTable from "@/components/AdminEditableTable";

type Servicio = {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio_clp: number | null;
  duracion_min: number | null;
  creado_en: string | null;
  image_url: string | null;
};

export default function AdminServiciosPage() {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Servicio | null>(null);

  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    precio_clp: "",
    duracion_min: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const isEdit = useMemo(() => Boolean(editing?.id), [editing]);

  const loadServicios = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/servicios", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Error al cargar");
      setServicios(json.data || []);
    } catch (e: any) {
      setError(e.message || "Error al cargar");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServicios();
  }, []);

  const resetForm = () => {
    setEditing(null);
    setForm({ nombre: "", descripcion: "", precio_clp: "", duracion_min: "" });
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      const payload: any = {
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim() || null,
        precio_clp: form.precio_clp ? Number(form.precio_clp) : null,
        duracion_min: form.duracion_min ? Number(form.duracion_min) : null,
        image_url: null, // Inicialmente null, se actualizará después si hay imagen
      };

      let url = "/api/servicios";
      let method: "POST" | "PUT" = "POST";
      if (isEdit && editing) {
        method = "PUT";
        payload.id = editing.id;
        // En modo edición, mantener la imagen actual si no hay nueva
        if (!imageFile && editing.image_url) {
          payload.image_url = editing.image_url;
        }
      }

      // 1) Crear/actualizar el servicio primero
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Error guardando");

      const servicioId = json.data?.id;

      // 2) Si hay imagen nueva, subirla después de crear el servicio
      if (imageFile && servicioId) {
        const fd = new FormData();
        fd.append("file", imageFile);
        fd.append("servicioId", servicioId);
        const up = await fetch("/api/servicios/upload", { method: "POST", body: fd });
        const upJson = await up.json();
        if (!up.ok || upJson.error) throw new Error(upJson.error || "Error al subir imagen");
        
        // Actualizar el servicio con la nueva URL de imagen
        const updateRes = await fetch("/api/servicios", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: servicioId,
            image_url: upJson.image_url,
          }),
        });
        const updateJson = await updateRes.json();
        if (!updateRes.ok || !updateJson.ok) {
          console.warn("Error actualizando URL de imagen:", updateJson.error);
        }
      }

      if (!isEdit) {
        // Si es nuevo, resetea el form
        resetForm();
      } else {
        // salir del modo edición
        setEditing(null);
      }
      await loadServicios();
    } catch (e: any) {
      setError(e.message || "Error guardando");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (s: Servicio) => {
    setEditing(s);
    setForm({
      nombre: s.nombre || "",
      descripcion: s.descripcion || "",
      precio_clp: s.precio_clp?.toString() || "",
      duracion_min: s.duracion_min?.toString() || "",
    });
    setImageFile(null);
    setImagePreview(s.image_url || null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar servicio?")) return;
    try {
      setSaving(true);
      setError(null);
      const res = await fetch("/api/servicios", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Error eliminando");
      await loadServicios();
    } catch (e: any) {
      setError(e.message || "Error eliminando");
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (servicioId: string, file: File) => {
    const fd = new FormData();
    fd.append("servicioId", servicioId);
    fd.append("file", file);
    const res = await fetch("/api/servicios/upload", { method: "POST", body: fd });
    const json = await res.json();
    if (!res.ok || json.error) throw new Error(json.error || "Error subiendo imagen");
    await loadServicios();
  };

  return (
    <div className="space-y-8">
 

      {error && (
        <div className="p-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>
      )}

      {/* Formulario */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4">{isEdit ? "Editar servicio" : "Nuevo servicio"}</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre</label>
            <input
              className="w-full rounded border px-3 py-2"
              value={form.nombre}
              onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
              required
              placeholder="Nombre del servicio"
              aria-label="Nombre del servicio"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Precio</label>
            <input
              type="number"
              step="0.01"
              className="w-full rounded border px-3 py-2"
              value={form.precio_clp}
              onChange={(e) => setForm((f) => ({ ...f, precio_clp: e.target.value }))}
              placeholder="Precio en CLP"
              aria-label="Precio en CLP"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <textarea
              className="w-full rounded border px-3 py-2"
              rows={3}
              value={form.descripcion}
              onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
              placeholder="Descripción del servicio"
              aria-label="Descripción del servicio"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Duración (minutos)</label>
            <input
              type="number"
              className="w-full rounded border px-3 py-2"
              value={form.duracion_min}
              onChange={(e) => setForm((f) => ({ ...f, duracion_min: e.target.value }))}
              placeholder="Duración en minutos"
              aria-label="Duración en minutos"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Imagen</label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setImageFile(file);
                  setImagePreview(file ? URL.createObjectURL(file) : null);
                }}
                aria-label="Subir imagen del servicio"
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
              {saving ? "Guardando..." : isEdit ? "Actualizar" : "Crear Servicio"}
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
        items={servicios}
        loading={loading}
        emptyText="Sin servicios"
        onEdit={(item) => handleEdit(item)}
        onDelete={(id) => handleDelete(id)}
        onUploadImage={async (id, file) => {
          try {
            await handleUpload(id, file);
          } catch (err: any) {
            alert(err.message || "Error subiendo imagen");
          }
        }}
        columns={[
          {
            key: "imagen",
            header: "Imagen",
            className: "w-[150px] whitespace-nowrap",
            render: (s: Servicio) => (
              <div className="flex items-center gap-3">
                {s.image_url ? (
                  <Image src={s.image_url} alt={s.nombre} width={56} height={56} className="w-14 h-14 object-cover rounded" />
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
                      await handleUpload(s.id, file);
                      if (input) input.value = "";
                    }}
                  />
                </label>
              </div>
            ),
          },
          { key: "nombre", header: "Nombre", className: "min-w-[180px] max-w-[260px]", render: (s: Servicio) => (
            <span className="font-medium block truncate" title={s.nombre}>{s.nombre}</span>
          ) },
          { key: "descripcion", header: "Descripción", render: (s: Servicio) => <span className="text-sm text-gray-600 max-w-[360px] truncate inline-block">{s.descripcion}</span> },
          { key: "precio", header: "Precio", render: (s: Servicio) => (s.precio_clp != null ? `$${s.precio_clp}` : "-") },
          { key: "duracion", header: "Duración", render: (s: Servicio) => (s.duracion_min != null ? `${s.duracion_min} min` : "-") },
          { key: "creado", header: "Creado", render: (s: Servicio) => <span className="text-sm text-gray-500">{s.creado_en ? new Date(s.creado_en).toLocaleString() : "-"}</span> },
        ]}
      />
    </div>
  );
}



