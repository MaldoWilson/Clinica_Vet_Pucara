"use client";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

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
      };

      let url = "/api/servicios";
      let method: "POST" | "PUT" = "POST";
      if (isEdit && editing) {
        method = "PUT";
        payload.id = editing.id;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Error guardando");

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
      <div>
        <h2 className="text-2xl font-semibold">Servicios</h2>
        <p className="text-sm text-gray-600">Crea, edita y elimina servicios.</p>
      </div>

      {error && (
        <div className="p-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>
      )}

      {/* Formulario */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-medium mb-4">{isEdit ? "Editar servicio" : "Nuevo servicio"}</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre</label>
            <input
              className="w-full rounded border px-3 py-2"
              value={form.nombre}
              onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
              required
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
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <textarea
              className="w-full rounded border px-3 py-2"
              rows={3}
              value={form.descripcion}
              onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Duración (minutos)</label>
            <input
              type="number"
              className="w-full rounded border px-3 py-2"
              value={form.duracion_min}
              onChange={(e) => setForm((f) => ({ ...f, duracion_min: e.target.value }))}
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
              disabled={saving}
            >
              {saving ? "Guardando..." : isEdit ? "Actualizar" : "Crear"}
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

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Imagen</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Duración</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Creado</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td className="px-4 py-4" colSpan={7}>Cargando...</td></tr>
            ) : servicios.length === 0 ? (
              <tr><td className="px-4 py-4" colSpan={7}>Sin servicios</td></tr>
            ) : (
              servicios.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-3">
                      {s.image_url ? (
                        <Image src={s.image_url} alt={s.nombre} width={56} height={56} className="w-14 h-14 object-cover rounded" />
                      ) : (
                        <div className="w-14 h-14 bg-gray-100 rounded grid place-items-center text-xs text-gray-400">Sin
                          imagen</div>
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
                              await handleUpload(s.id, file);
                            } catch (err: any) {
                              alert(err.message || "Error subiendo imagen");
                            } finally {
                              e.currentTarget.value = "";
                            }
                          }}
                        />
                      </label>
                    </div>
                  </td>
                  <td className="px-4 py-2 font-medium">{s.nombre}</td>
                  <td className="px-4 py-2 text-sm text-gray-600 max-w-[360px] truncate">{s.descripcion}</td>
                  <td className="px-4 py-2">{s.precio_clp != null ? `$${s.precio_clp}` : "-"}</td>
                  <td className="px-4 py-2">{s.duracion_min != null ? `${s.duracion_min} min` : "-"}</td>
                  <td className="px-4 py-2 text-sm text-gray-500">{s.creado_en ? new Date(s.creado_en).toLocaleString() : "-"}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(s)}
                        className="px-3 py-1 rounded border"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="px-3 py-1 rounded bg-red-600 text-white"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}



