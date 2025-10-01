"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useParams } from "next/navigation";
import { formatRutPretty, isValidRut } from "@/lib/rut";
import Image from "next/image";
import ConfirmationModal from "@/components/ConfirmationModal";

type Owner = {
  propietario_id: string;
  nombre?: string | null;
  apellido?: string | null;
  rut?: string | null;
  telefono?: string | null;
  direccion?: string | null;
  correo_electronico?: string | null;
};

type Mascota = {
  mascotas_id: string;
  nombre: string;
  especie: boolean; // true=gato, false=perro
  raza?: string | null;
  sexo?: boolean | null;
  color?: string | null;
  fecha_nacimiento?: string | null;
  numero_microchip?: string | null;
  esterilizado?: boolean | null;
  propietario_id: string;
  created_at: string;
  propietario: Owner | null;
};

type Antecedentes = {
  id?: string;
  mascota_id: string;
  origen?: string | null;
  habitat?: string | null;
  comportamiento?: string | null;
  enfermedades?: string | null;
  alergias?: string | null;
  observaciones?: string | null;
  alertas?: string | null;
  created_at?: string;
} | null;

type TabId = "general" | "antecedentes" | "historial";

export default function PacienteDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [data, setData] = useState<Mascota | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabId>("general");
  const [editOwner, setEditOwner] = useState(false);
  const [editPet, setEditPet] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editAnte, setEditAnte] = useState(false);
  const [savingAnte, setSavingAnte] = useState(false);
  const [ante, setAnte] = useState<Antecedentes>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [consultaOpen, setConsultaOpen] = useState(false);
  const [consultas, setConsultas] = useState<any[]>([]);
  const [ultimaConsultaId, setUltimaConsultaId] = useState<string | null>(null);
  const [savingConsulta, setSavingConsulta] = useState(false);
  const [consultaForm, setConsultaForm] = useState({
    fecha: new Date().toISOString().slice(0, 10),
    motivo: "",
    tipo_atencion: "",
    anamnesis: "",
    diagnostico: "",
    tratamiento: "",
    proximo_control: "",
    observaciones: "",
  });
  const [fabOpen, setFabOpen] = useState(false);
  const [recetaOpen, setRecetaOpen] = useState(false);
  const [savingReceta, setSavingReceta] = useState(false);
  const [ultimaReceta, setUltimaReceta] = useState<null | { id: string; fecha?: string; peso?: string; notas?: string; items: Array<{ nombre_medicamento: string; dosis: string; via?: string; frecuencia?: string; duracion?: string; instrucciones?: string; }>; }>(null);
  const [openHistMenu, setOpenHistMenu] = useState<string | null>(null);
  const [editConsulta, setEditConsulta] = useState<null | any>(null);
  const [savingEditConsulta, setSavingEditConsulta] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<null | { id: string }>(null);
  const consultaCardRef = useRef<HTMLDivElement>(null);
  const [recetaForm, setRecetaForm] = useState({
    peso: "",
    notas: "",
    items: [
      { nombre_medicamento: "", dosis: "", via: "", frecuencia: "", duracion: "", instrucciones: "" }
    ] as Array<{ nombre_medicamento: string; dosis: string; via?: string; frecuencia?: string; duracion?: string; instrucciones?: string; }>,
  });

  function addRecetaItem() {
    setRecetaForm((f) => ({ ...f, items: [...f.items, { nombre_medicamento: "", dosis: "", via: "", frecuencia: "", duracion: "", instrucciones: "" }] }));
  }
  function removeRecetaItem(idx: number) {
    setRecetaForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
  }
  function updateRecetaItem(idx: number, field: string, value: string) {
    setRecetaForm((f) => ({ ...f, items: f.items.map((it, i) => i === idx ? { ...it, [field]: value } : it) }));
  }

  // Bloquear scroll del body cuando el modal de consulta está abierto
  useEffect(() => {
    if (editConsulta) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [editConsulta]);

  async function crearReceta() {
    if (!ultimaConsultaId) {
      setError("Debes crear una consulta primero antes de crear una receta.");
      return;
    }
    setSavingReceta(true); setError(null); setSuccess(null);
    try {
      const payload: any = {
        consulta_id: ultimaConsultaId,
        peso: recetaForm.peso ? Number(recetaForm.peso) : null,
        notas: recetaForm.notas || null,
        items: recetaForm.items,
      };
      const res = await fetch("/api/recetas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || json?.ok === false) throw new Error(json?.error || "No se pudo crear la receta");
      setSuccess("Receta creada.");
      setRecetaOpen(false);
      setFabOpen(false);
      setUltimaReceta({ id: String(json.data.id), fecha: json.data.fecha, peso: recetaForm.peso, notas: recetaForm.notas, items: recetaForm.items });
    } catch (e: any) {
      setError(e?.message || "Error inesperado");
    } finally {
      setSavingReceta(false);
    }
  }

  function imprimirUltimaReceta() {
    if (!ultimaReceta) return;
    const w = window.open("", "_blank", "width=800,height=900");
    if (!w) return;
    const css = `body{font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;line-height:1.4;padding:24px;color:#111} h1{font-size:20px;margin:0 0 12px} h2{font-size:16px;margin:16px 0 8px} table{width:100%;border-collapse:collapse;margin-top:8px} th,td{border:1px solid #e5e7eb;padding:8px;text-align:left} .muted{color:#6b7280}`;
    const itemsRows = ultimaReceta.items.map((it, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${it.nombre_medicamento}</td>
        <td>${it.dosis}</td>
        <td>${it.via || ''}</td>
        <td>${it.frecuencia || ''}</td>
        <td>${it.duracion || ''}</td>
        <td>${it.instrucciones || ''}</td>
      </tr>`).join("");
    const html = `<!doctype html><html><head><meta charset='utf-8'><title>Receta ${ultimaReceta.id}</title><style>${css}</style></head><body>
      <h1>Receta #${ultimaReceta.id}</h1>
      <div class='muted'>Fecha: ${ultimaReceta.fecha || ''}</div>
      ${ultimaReceta.peso ? `<div class='muted'>Peso: ${ultimaReceta.peso} kg</div>` : ''}
      ${ultimaReceta.notas ? `<div class='muted'>Notas: ${ultimaReceta.notas}</div>` : ''}
      <h2>Medicamentos</h2>
      <table><thead><tr><th>#</th><th>Medicamento</th><th>Dosis</th><th>Vía</th><th>Frecuencia</th><th>Duración</th><th>Instrucciones</th></tr></thead><tbody>${itemsRows}</tbody></table>
      <script>window.onload=() => window.print();</script>
    </body></html>`;
    w.document.write(html);
    w.document.close();
  }

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/mascotas?id=${encodeURIComponent(String(id))}`);
        const json = await res.json();
        if (!res.ok || json?.ok === false) throw new Error(json?.error || "No se pudo cargar el paciente");
        setData(json.data);
      } catch (e: any) {
        setError(e?.message || "Error inesperado");
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  // Cargar consultas existentes
  useEffect(() => {
    const loadConsultas = async () => {
      try {
        const res = await fetch(`/api/consultas?mascota_id=${encodeURIComponent(String(id))}`);
        const json = await res.json();
        if (res.ok && json?.ok) {
          // Enriquecer cada consulta con sus recetas
          const mapped = await Promise.all((json.data || []).map(async (c: any) => {
            try {
              const resR = await fetch(`/api/recetas?consulta_id=${c.id}`);
              const jsonR = await resR.json();
              const recetas = resR.ok && jsonR?.ok ? jsonR.data : [];
              return ({
                id: c.id,
                fecha: c.created_at || c.fecha,
                motivo: c.motivo,
                veterinario: c.veterinario_id || '',
                tipo: c.tipo_atencion && c.tipo_atencion.toLowerCase().includes('inmun') ? 'inmunizacion' : 'consulta',
                resumen: c.diagnostico || c.tratamiento || '',
                recetas,
              });
            } catch {
              return ({
                id: c.id,
                fecha: c.created_at || c.fecha,
                motivo: c.motivo,
                veterinario: c.veterinario_id || '',
                tipo: c.tipo_atencion && c.tipo_atencion.toLowerCase().includes('inmun') ? 'inmunizacion' : 'consulta',
                resumen: c.diagnostico || c.tratamiento || '',
                recetas: [],
              });
            }
          }));
          setConsultas(mapped);
        }
      } catch {}
    };
    if (id) loadConsultas();
  }, [id]);

  // Cargar antecedentes de la mascota
  useEffect(() => {
    const loadAnte = async () => {
      try {
        const res = await fetch(`/api/antecedentes?mascota_id=${encodeURIComponent(String(id))}`);
        const json = await res.json();
        if (!res.ok || json?.ok === false) throw new Error(json?.error || "No se pudo cargar antecedentes");
        setAnte(json?.data || null);
      } catch (e: any) {
        // si no hay registros aún, ante queda null (es válido)
        setAnte(null);
      }
    };
    if (id) loadAnte();
  }, [id]);

  const edadTexto = useMemo(() => {
    if (!data?.fecha_nacimiento) return "-";
    const birth = new Date(data.fecha_nacimiento);
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    if (months < 0) { years -= 1; months += 12; }
    return years > 0 ? `${years} año(s) ${months} mes(es)` : `${months} mes(es)`;
  }, [data?.fecha_nacimiento]);

  async function saveOwner(updates: Partial<Owner>) {
    if (!data?.propietario?.propietario_id) return;
    setSaving(true); setError(null); setSuccess(null);
    try {
      const res = await fetch("/api/propietarios", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propietario_id: data.propietario.propietario_id, ...updates }),
      });
      const json = await res.json();
      if (!res.ok || json?.ok === false) throw new Error(json?.error || "No se pudo guardar propietario");
      setData((prev) => prev ? ({ ...prev, propietario: json.data }) : prev);
      setSuccess("Propietario actualizado");
      setEditOwner(false);
    } catch (e: any) {
      setError(e?.message || "Error inesperado");
    } finally { setSaving(false); }
  }

  async function crearConsulta() {
    if (!data?.mascotas_id) return;
    setSavingConsulta(true); setError(null); setSuccess(null);
    try {
      const res = await fetch("/api/consultas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mascota_id: data.mascotas_id, ...consultaForm }),
      });
      const json = await res.json();
      if (!res.ok || json?.ok === false) throw new Error(json?.error || "No se pudo crear la consulta");
      setSuccess("Consulta creada.");
      setConsultas((prev) => [{ id: json.data.id, fecha: json.data.fecha }, ...prev]);
      setUltimaConsultaId(String(json.data.id));
    } catch (e: any) {
      setError(e?.message || "Error inesperado");
    } finally {
      setSavingConsulta(false);
    }
  }

  async function savePet(updates: Partial<Mascota>) {
    if (!data?.mascotas_id) return;
    setSaving(true); setError(null); setSuccess(null);
    try {
      const res = await fetch("/api/mascotas", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mascotas_id: data.mascotas_id, ...updates }),
      });
      const json = await res.json();
      if (!res.ok || json?.ok === false) throw new Error(json?.error || "No se pudo guardar mascota");
      setData((prev) => prev ? ({ ...prev, ...json.data }) : prev);
      setSuccess("Mascota actualizada");
      setEditPet(false);
    } catch (e: any) {
      setError(e?.message || "Error inesperado");
    } finally { setSaving(false); }
  }

  async function saveAntecedentes(updates: Omit<NonNullable<Antecedentes>, "id" | "mascota_id" | "created_at">) {
    if (!data?.mascotas_id) return;
    setSavingAnte(true); setError(null); setSuccess(null);
    try {
      const res = await fetch("/api/antecedentes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mascota_id: data.mascotas_id, ...updates }),
      });
      const json = await res.json();
      if (!res.ok || json?.ok === false) throw new Error(json?.error || "No se pudo guardar antecedentes");
      setAnte(json.data as Antecedentes);
      setSuccess("Antecedentes guardados");
      setEditAnte(false);
    } catch (e: any) {
      setError(e?.message || "Error inesperado");
    } finally {
      setSavingAnte(false);
    }
  }

  async function deleteMascota() {
    if (!data?.mascotas_id) return;
    setDeleting(true); setError(null); setSuccess(null);
    try {
      const res = await fetch("/api/mascotas", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mascotas_id: data.mascotas_id }),
      });
      const json = await res.json();
      if (!res.ok || json?.ok === false) throw new Error(json?.error || "No se pudo borrar la mascota");
      window.location.href = "/admin/pacientes";
    } catch (e: any) {
      setError(e?.message || "Error inesperado");
    } finally {
      setDeleting(false);
      setMenuOpen(false);
      setConfirmDeleteOpen(false);
    }
  }

  if (loading) {
    return <div className="text-center text-gray-600">Cargando...</div>;
  }
  if (!data) return <div className="text-center text-gray-600">Paciente no encontrado</div>;

  const o = data.propietario || {};
  const sexo = data.sexo === true ? "Macho" : data.sexo === false ? "Hembra" : "-";
  const especie = data.especie === true ? "Gato" : "Perro";

  function formatFechaHora(iso?: string | null) {
    if (!iso) return "";
    const d = new Date(iso);
    const fecha = d.toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: '2-digit' });
    const hora = d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
    return `${fecha} · ${hora}`;
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Encabezado */}
      <div className="relative overflow-hidden rounded-2xl ring-1 ring-gray-200/70 bg-white/80 backdrop-blur-sm shadow-sm mb-6">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-indigo-400 to-indigo-600" />
        <div className="absolute -inset-1 opacity-0 group-hover:opacity-5 pointer-events-none" />
        <div className="relative p-6">
        <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-50 to-white ring-1 ring-indigo-100 overflow-hidden flex items-center justify-center shadow-sm">
            <Image
              src={data.especie ? "/gato.webp" : "/perro.webp"}
              alt={data.especie ? "Gato" : "Perro"}
              width={160}
              height={160}
              className="w-full h-full object-cover object-center"
              priority
              quality={100}
            />
          </div>
          <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">{data.nombre}</h1>
                {data.esterilizado === true && (
                  <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">Esterilizado/a</span>
                )}
                {data.numero_microchip && (
                  <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200">Chip {data.numero_microchip}</span>
                )}
              </div>
              <div className="text-gray-600 flex flex-wrap gap-x-6 gap-y-2 mt-2 text-sm">
                <span className="inline-flex items-center gap-1"><span className="text-gray-500">Especie:</span> {especie}{data.raza ? ` · ${data.raza}` : ""}</span>
                <span className="inline-flex items-center gap-1"><span className="text-gray-500">Sexo:</span> {sexo}</span>
                <span className="inline-flex items-center gap-1"><span className="text-gray-500">Edad:</span> {edadTexto}</span>
                <span className="inline-flex items-center gap-1"><span className="text-gray-500">Ficha Nº:</span> {data.mascotas_id}</span>
              </div>
            </div>
            {/* Menú acciones */}
            <div className="ml-auto relative">
              <button
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen(v => !v)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
                title="Acciones"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="5" r="1" />
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="12" cy="19" r="1" />
                </svg>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-xl bg-white ring-1 ring-gray-200 shadow-lg z-20 overflow-hidden">
                  <button
                    onClick={() => { setConfirmDeleteOpen(true); setMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Borrar mascota
                  </button>
                </div>
              )}
            </div>
          </div>
          {/* Modal de confirmación */}
          <ConfirmationModal
            isOpen={confirmDeleteOpen}
            onClose={() => setConfirmDeleteOpen(false)}
            onConfirm={deleteMascota}
            title="Borrar mascota"
            message="Esta acción eliminará la mascota de forma permanente. ¿Deseas continuar?"
            confirmText="Borrar"
            cancelText="Cancelar"
            isLoading={deleting}
            danger
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="rounded-2xl ring-1 ring-gray-200/70 bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="px-4 md:px-6 pt-4">
          <div className="flex flex-wrap gap-2">
            {["general","antecedentes","historial"].map((t) => (
              <button
                key={t}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${tab === t ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50'}`}
                onClick={() => setTab(t as TabId)}
              >
                {t === "general" ? "General" : t === "antecedentes" ? "Antecedentes" : "Historial"}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 md:p-6">
          {tab === "general" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Mascota */}
              <div className={`rounded-xl p-4 bg-white/90 ${editPet ? 'ring-2 ring-indigo-300 bg-indigo-50/40' : 'ring-1 ring-gray-200'}`}>
                 <div className="flex items-center justify-between mb-3">
                   <div className="flex items-center gap-2">
                     <h3 className="text-xs font-semibold tracking-wide text-indigo-600">Paciente</h3>
                     {editPet && (<span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 ring-1 ring-amber-200">Editando</span>)}
                   </div>
                   <button aria-pressed={editPet} className={`text-sm ${editPet ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-600'}`} title={editPet ? "Cerrar edición" : "Editar paciente"} onClick={() => setEditPet((v) => !v)}>{editPet ? '✕' : '✎'}</button>
                 </div>
                {!editPet ? (
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                    <div><dt className="text-gray-500">Nombre</dt><dd className="font-medium">{data.nombre}</dd></div>
                    <div><dt className="text-gray-500">Especie</dt><dd className="font-medium">{especie}</dd></div>
                    <div><dt className="text-gray-500">Raza</dt><dd className="font-medium">{data.raza || '-'}</dd></div>
                    <div><dt className="text-gray-500">Sexo</dt><dd className="font-medium">{sexo}</dd></div>
                    <div><dt className="text-gray-500">Fecha nac.</dt><dd className="font-medium">{data.fecha_nacimiento ? new Date(data.fecha_nacimiento).toLocaleDateString('es-CL') : '-'}</dd></div>
                    <div><dt className="text-gray-500">Color</dt><dd className="font-medium">{data.color || '-'}</dd></div>
                    <div><dt className="text-gray-500">Microchip</dt><dd className="font-medium">{data.numero_microchip || '-'}</dd></div>
                    <div><dt className="text-gray-500">Esterilizado</dt><dd className="font-medium">{data.esterilizado ? 'Sí' : 'No'}</dd></div>
                  </dl>
                ) : (
                  <PetEditForm data={data} onCancel={() => setEditPet(false)} onSave={savePet} saving={saving} />
                )}
              </div>

              {/* Propietario */}
              <div className={`rounded-xl p-4 bg-white/90 ${editOwner ? 'ring-2 ring-indigo-300 bg-indigo-50/40' : 'ring-1 ring-gray-200'}`}>
                 <div className="flex items-center justify-between mb-3">
                   <div className="flex items-center gap-2">
                     <h3 className="text-xs font-semibold tracking-wide text-indigo-600">Tutor</h3>
                     {editOwner && (<span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 ring-1 ring-amber-200">Editando</span>)}
                   </div>
                   <button aria-pressed={editOwner} className={`text-sm ${editOwner ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-600'}`} title={editOwner ? "Cerrar edición" : "Editar tutor"} onClick={() => setEditOwner((v) => !v)}>{editOwner ? '✕' : '✎'}</button>
                 </div>
                {!editOwner ? (
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                    <div><dt className="text-gray-500">RUT</dt><dd className="font-medium">{o.rut ? formatRutPretty(o.rut) : '-'}</dd></div>
                    <div><dt className="text-gray-500">Email</dt><dd className="font-medium">{o.correo_electronico || '-'}</dd></div>
                    <div><dt className="text-gray-500">Nombre</dt><dd className="font-medium">{[o.nombre, o.apellido].filter(Boolean).join(' ') || '-'}</dd></div>
                    <div><dt className="text-gray-500">Teléfono</dt><dd className="font-medium">{o.telefono || '-'}</dd></div>
                    <div className="md:col-span-2"><dt className="text-gray-500">Dirección</dt><dd className="font-medium">{o.direccion || '-'}</dd></div>
                  </dl>
                ) : (
                  <OwnerEditForm data={o as Owner} onCancel={() => setEditOwner(false)} onSave={saveOwner} saving={saving} />
                )}
              </div>
            </div>
          )}

          {/* Modal ver/editar consulta */}
          {editConsulta && createPortal(
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-2 sm:p-4">
              {/* Backdrop a pantalla completa */}
              <div className="absolute inset-0 bg-black/50" onClick={() => setEditConsulta(null)} />
              {/* Contenedor del modal con altura máxima y scroll interno */}
              <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl mx-auto max-h-[92vh] overflow-y-auto">
                <div className="px-5 py-4 border-b flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/75">
                  <h3 className="text-base font-semibold">Consulta #{editConsulta.id}</h3>
                  <button onClick={() => setEditConsulta(null)} className="p-2 rounded hover:bg-gray-100">✕</button>
                </div>
                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Fecha</label>
                    <input type="datetime-local" className="w-full rounded-lg border border-gray-300 px-3 py-2"
                      value={(editConsulta.fecha || editConsulta.created_at) ? new Date(editConsulta.fecha || editConsulta.created_at).toISOString().slice(0,16) : ''}
                      onChange={(e) => setEditConsulta({ ...editConsulta, fecha: new Date(e.target.value).toISOString() })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Tipo de atención</label>
                    <input className="w-full rounded-lg border border-gray-300 px-3 py-2" value={editConsulta.tipo_atencion || ''} onChange={(e) => setEditConsulta({ ...editConsulta, tipo_atencion: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Motivo</label>
                    <input className="w-full rounded-lg border border-gray-300 px-3 py-2" value={editConsulta.motivo || ''} onChange={(e) => setEditConsulta({ ...editConsulta, motivo: e.target.value })} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Anamnesis</label>
                    <textarea className="w-full min-h-[80px] rounded-lg border border-gray-300 px-3 py-2" value={editConsulta.anamnesis || ''} onChange={(e) => setEditConsulta({ ...editConsulta, anamnesis: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Diagnóstico</label>
                    <textarea className="w-full min-h-[80px] rounded-lg border border-gray-300 px-3 py-2" value={editConsulta.diagnostico || ''} onChange={(e) => setEditConsulta({ ...editConsulta, diagnostico: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Tratamiento</label>
                    <textarea className="w-full min-h-[80px] rounded-lg border border-gray-300 px-3 py-2" value={editConsulta.tratamiento || ''} onChange={(e) => setEditConsulta({ ...editConsulta, tratamiento: e.target.value })} />
                  </div>
                </div>
                <div className="px-5 py-4 bg-gray-50 rounded-b-xl flex justify-end gap-2 sticky bottom-0">
                  <button onClick={() => setEditConsulta(null)} className="px-4 py-2 rounded-lg ring-1 ring-gray-300 bg-white hover:bg-gray-50">Cerrar</button>
                  <button onClick={async () => {
                    setSavingEditConsulta(true);
                    try {
                      const payload: any = { id: editConsulta.id, motivo: editConsulta.motivo, tipo_atencion: editConsulta.tipo_atencion, anamnesis: editConsulta.anamnesis, diagnostico: editConsulta.diagnostico, tratamiento: editConsulta.tratamiento, fecha: editConsulta.fecha };
                      const res = await fetch('/api/consultas', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                      const json = await res.json();
                      if (!res.ok || json?.ok === false) throw new Error(json?.error || 'Error al guardar');
                      // refrescar lista
                      setConsultas((prev) => prev.map((x) => x.id === editConsulta.id ? { ...x, fecha: payload.fecha || x.fecha, motivo: payload.motivo || x.motivo, resumen: payload.diagnostico || payload.tratamiento || x.resumen } : x));
                      setEditConsulta(null);
                    } catch (e: any) {
                      alert(e?.message || 'Error');
                    } finally { setSavingEditConsulta(false); }
                  }} disabled={savingEditConsulta} className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50">{savingEditConsulta ? 'Guardando...' : 'Guardar cambios'}</button>
                </div>
              </div>
            </div>,
            document.body
          )}

          {/* Confirmación eliminar consulta */}
          {confirmDelete && (
            <ConfirmationModal
              isOpen={true}
              onClose={() => setConfirmDelete(null)}
              onConfirm={async () => {
                try {
                  const res = await fetch('/api/consultas', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: confirmDelete.id }) });
                  const json = await res.json();
                  if (!res.ok || json?.ok === false) throw new Error(json?.error || 'Error al eliminar');
                  setConsultas((prev) => prev.filter((x) => String(x.id) !== String(confirmDelete.id)));
                } catch (e: any) {
                  alert(e?.message || 'Error');
                } finally {
                  setConfirmDelete(null);
                }
              }}
              title="Eliminar consulta"
              message="Esta acción eliminará la consulta permanentemente. ¿Deseas continuar?"
              confirmText="Eliminar"
              cancelText="Cancelar"
              danger
            />
          )}
          {tab === "general" && (<>
          {/* Carta independiente para Consulta */}
          <div className="mt-6 rounded-2xl ring-1 ring-gray-200/70 bg-white/80 backdrop-blur-sm shadow-sm p-4 md:p-6">
            <div className="w-full flex justify-center">
              {!consultaOpen ? (
                <div className="flex items-center gap-3">
                  <button onClick={() => setConsultaOpen(true)} className="px-5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm">Generar consulta</button>
                  <button onClick={() => { setRecetaOpen(true); setFabOpen(false); }} className="px-5 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm">Crear receta</button>
                  <button onClick={() => {/* TODO: Implementar crear certificados */}} className="px-5 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 shadow-sm">Crear certificados</button>
                </div>
              ) : (
                <div className="w-full max-w-4xl relative mt-16">
                  {/* Cerrar formulario (X) */}
                  <button
                    type="button"
                    aria-label="Cerrar formulario"
                    title="Cerrar formulario"
                    onClick={() => setConsultaOpen(false)}
                    className="absolute -top-4 right-0 p-2 rounded-full bg-white shadow ring-1 ring-gray-200 hover:bg-gray-50"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                  <h4 className="text-sm font-semibold text-indigo-600 mb-8 text-center">Nueva consulta</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Fecha</label>
                      <input type="date" className="w-full rounded-lg border border-indigo-300/70 px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" value={consultaForm.fecha} onChange={(e) => setConsultaForm({ ...consultaForm, fecha: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Tipo de atención</label>
                      <input className="w-full rounded-lg border border-indigo-300/70 px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" value={consultaForm.tipo_atencion} onChange={(e) => setConsultaForm({ ...consultaForm, tipo_atencion: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Motivo</label>
                      <input className="w-full rounded-lg border border-indigo-300/70 px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" value={consultaForm.motivo} onChange={(e) => setConsultaForm({ ...consultaForm, motivo: e.target.value })} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Anamnesis</label>
                      <textarea className="w-full min-h-[80px] rounded-lg border border-indigo-300/70 px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" value={consultaForm.anamnesis} onChange={(e) => setConsultaForm({ ...consultaForm, anamnesis: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Diagnóstico</label>
                      <textarea className="w-full min-h-[80px] rounded-lg border border-indigo-300/70 px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" value={consultaForm.diagnostico} onChange={(e) => setConsultaForm({ ...consultaForm, diagnostico: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Tratamiento</label>
                      <textarea className="w-full min-h-[80px] rounded-lg border border-indigo-300/70 px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" value={consultaForm.tratamiento} onChange={(e) => setConsultaForm({ ...consultaForm, tratamiento: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Próximo control</label>
                      <input type="date" className="w-full rounded-lg border border-indigo-300/70 px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" value={consultaForm.proximo_control} onChange={(e) => setConsultaForm({ ...consultaForm, proximo_control: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Observaciones</label>
                      <textarea className="w-full min-h-[80px] rounded-lg border border-indigo-300/70 px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" value={consultaForm.observaciones} onChange={(e) => setConsultaForm({ ...consultaForm, observaciones: e.target.value })} />
                    </div>
                  </div>
                  <div className="w-full flex justify-center mt-3">
                    <button onClick={crearConsulta} disabled={savingConsulta} className="px-5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50">{savingConsulta ? 'Guardando...' : 'Guardar consulta'}</button>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Formulario receta */}
          {recetaOpen && (
            <div className="mt-16 rounded-2xl ring-1 ring-gray-200/70 bg-white/80 backdrop-blur-sm shadow-sm p-4 md:p-6 relative w-full max-w-4xl mx-auto">
              {/* Cerrar formulario (X) */}
              <button
                type="button"
                aria-label="Cerrar formulario"
                title="Cerrar formulario"
                onClick={() => setRecetaOpen(false)}
                className="absolute -top-4 right-0 p-2 rounded-full bg-white shadow ring-1 ring-gray-200 hover:bg-gray-50"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
              <h4 className="text-sm font-semibold text-indigo-600 mb-8 text-center">Nueva receta</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Peso (kg)</label>
                  <input className="w-full rounded-lg border border-indigo-300/70 px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" value={recetaForm.peso} onChange={(e) => setRecetaForm({ ...recetaForm, peso: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Notas</label>
                  <textarea className="w-full min-h-[80px] rounded-lg border border-indigo-300/70 px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" value={recetaForm.notas} onChange={(e) => setRecetaForm({ ...recetaForm, notas: e.target.value })} />
                </div>
              </div>
              <div className="mt-3">
                <h5 className="text-xs font-semibold text-gray-700 mb-2">Medicamentos</h5>
                {recetaForm.items.map((it, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-6 gap-2 mb-2 items-end">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Nombre</label>
                      <input className="w-full rounded-lg border border-indigo-300/70 px-3 py-2 bg-white" value={it.nombre_medicamento} onChange={(e) => updateRecetaItem(idx, 'nombre_medicamento', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Dosis</label>
                      <input className="w-full rounded-lg border border-indigo-300/70 px-3 py-2 bg-white" value={it.dosis} onChange={(e) => updateRecetaItem(idx, 'dosis', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Vía</label>
                      <input className="w-full rounded-lg border border-indigo-300/70 px-3 py-2 bg-white" value={it.via || ''} onChange={(e) => updateRecetaItem(idx, 'via', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Frecuencia</label>
                      <input className="w-full rounded-lg border border-indigo-300/70 px-3 py-2 bg-white" value={it.frecuencia || ''} onChange={(e) => updateRecetaItem(idx, 'frecuencia', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Duración</label>
                      <input className="w-full rounded-lg border border-indigo-300/70 px-3 py-2 bg-white" value={it.duracion || ''} onChange={(e) => updateRecetaItem(idx, 'duracion', e.target.value)} />
                    </div>
                    <div className="md:col-span-6">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Instrucciones</label>
                      <input className="w-full rounded-lg border border-indigo-300/70 px-3 py-2 bg-white" value={it.instrucciones || ''} onChange={(e) => updateRecetaItem(idx, 'instrucciones', e.target.value)} />
                    </div>
                    <div className="md:col-span-6 flex justify-end">
                      {recetaForm.items.length > 1 && (
                        <button type="button" onClick={() => removeRecetaItem(idx)} className="text-sm text-red-600 hover:text-red-700">Eliminar medicamento</button>
                      )}
                    </div>
                  </div>
                ))}
                <div className="w-full flex justify-center">
                  <button type="button" onClick={addRecetaItem} className="px-4 py-2 rounded-lg ring-1 ring-gray-300 bg-white hover:bg-gray-50">Añadir medicamento</button>
                </div>
              </div>
              <div className="w-full flex justify-center mt-3">
                <button onClick={crearReceta} disabled={savingReceta} className="px-5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50">{savingReceta ? 'Guardando...' : 'Guardar receta'}</button>
              </div>
            </div>
          )}

          {/* Resumen última receta */}
          {ultimaReceta && (
            <div className="mt-4 rounded-2xl ring-1 ring-gray-200/70 bg-white/80 backdrop-blur-sm shadow-sm p-4 md:p-6">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-indigo-600">Receta #{ultimaReceta.id}</h4>
                <div className="text-sm text-gray-500">{ultimaReceta.fecha ? new Date(ultimaReceta.fecha).toLocaleString('es-CL') : ''}</div>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {ultimaReceta.peso && <span className="mr-4">Peso: {ultimaReceta.peso} kg</span>}
                {ultimaReceta.notas && <span>Notas: {ultimaReceta.notas}</span>}
              </div>
              <div className="mt-3 overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-600">
                      <th className="py-2 pr-4">#</th>
                      <th className="py-2 pr-4">Medicamento</th>
                      <th className="py-2 pr-4">Dosis</th>
                      <th className="py-2 pr-4">Vía</th>
                      <th className="py-2 pr-4">Frecuencia</th>
                      <th className="py-2 pr-4">Duración</th>
                      <th className="py-2 pr-4">Instrucciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ultimaReceta.items.map((it, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="py-2 pr-4">{idx + 1}</td>
                        <td className="py-2 pr-4">{it.nombre_medicamento}</td>
                        <td className="py-2 pr-4">{it.dosis}</td>
                        <td className="py-2 pr-4">{it.via}</td>
                        <td className="py-2 pr-4">{it.frecuencia}</td>
                        <td className="py-2 pr-4">{it.duracion}</td>
                        <td className="py-2 pr-4">{it.instrucciones}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="w-full flex justify-center gap-2 mt-4">
                <button onClick={imprimirUltimaReceta} className="px-4 py-2 rounded-lg ring-1 ring-gray-300 bg-white hover:bg-gray-50">Imprimir</button>
                <button onClick={imprimirUltimaReceta} className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Descargar PDF</button>
              </div>
            </div>
          )}

          </>)}

          {tab === "antecedentes" && (
            <div className="grid grid-cols-1 gap-6">
              <div className={`rounded-xl p-4 bg-white/90 ${editAnte ? 'ring-2 ring-indigo-300 bg-indigo-50/40' : 'ring-1 ring-gray-200'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-semibold tracking-wide text-indigo-600">Antecedentes</h3>
                    {editAnte && (<span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 ring-1 ring-amber-200">Editando</span>)}
                  </div>
                  <button aria-pressed={editAnte} className={`text-sm ${editAnte ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-600'}`} title={editAnte ? "Cerrar edición" : "Editar antecedentes"} onClick={() => setEditAnte((v) => !v)}>{editAnte ? '✕' : '✎'}</button>
                </div>

                {!editAnte ? (
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                    <div className="md:col-span-1"><dt className="text-gray-500">Origen</dt><dd className="font-medium whitespace-pre-wrap">{ante?.origen || '-'}</dd></div>
                    <div className="md:col-span-1"><dt className="text-gray-500">Hábitat</dt><dd className="font-medium whitespace-pre-wrap">{ante?.habitat || '-'}</dd></div>
                    <div className="md:col-span-1"><dt className="text-gray-500">Comportamiento</dt><dd className="font-medium whitespace-pre-wrap">{ante?.comportamiento || '-'}</dd></div>
                    <div className="md:col-span-1"><dt className="text-gray-500">Enfermedades</dt><dd className="font-medium whitespace-pre-wrap">{ante?.enfermedades || '-'}</dd></div>
                    <div className="md:col-span-1"><dt className="text-gray-500">Alergias</dt><dd className="font-medium whitespace-pre-wrap">{ante?.alergias || '-'}</dd></div>
                    <div className="md:col-span-1"><dt className="text-gray-500">Observaciones</dt><dd className="font-medium whitespace-pre-wrap">{ante?.observaciones || '-'}</dd></div>
                    <div className="md:col-span-2"><dt className="text-gray-500">Alertas</dt><dd className="font-medium whitespace-pre-wrap">{ante?.alertas || '-'}</dd></div>
                  </dl>
                ) : (
                  <AntecedentesForm
                    data={ante}
                    onCancel={() => setEditAnte(false)}
                    onSave={saveAntecedentes}
                    saving={savingAnte}
                  />
                )}
              </div>
            </div>
          )}

          {tab === "historial" && (
            <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">Historial de {data.nombre}</h3>
          </div>

              {/* Ítems del historial (consultas) */}
              {consultas.length === 0 && (
                <div className="text-sm text-gray-500">Sin registros aún.</div>
              )}

             <div className="space-y-4">
                 {consultas.map((c) => (
                   <div key={c.id} className="group relative overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-gray-200">
                     {/* Header con gradiente sutil */}
                     <div className={`relative px-6 py-5 ${c.tipo === 'inmunizacion' ? 'bg-gradient-to-r from-emerald-50 to-emerald-100/50' : 'bg-gradient-to-r from-amber-50 to-amber-100/50'}`}>
                       <div className="flex items-start justify-between">
                         <div className="flex items-center gap-4">
                           {/* Icono de estado mejorado */}
                           <div className={`relative flex items-center justify-center w-10 h-10 rounded-full shadow-sm ${c.tipo === 'inmunizacion' ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                             <span className="text-white font-semibold text-sm">
                               {c.tipo === 'inmunizacion' ? '✓' : '!'}
                             </span>
                             {/* Efecto de brillo */}
                             <div className={`absolute inset-0 rounded-full opacity-20 ${c.tipo === 'inmunizacion' ? 'bg-emerald-300' : 'bg-amber-300'} animate-pulse`}></div>
                           </div>
                           
                           <div className="space-y-1">
                             <div className="flex items-center gap-2">
                               <h4 className="font-semibold text-gray-900 text-base">
                                 {c.tipo === 'inmunizacion' ? 'Inmunización' : 'Consulta'}
                               </h4>
                               {c.motivo && (
                                 <span className="text-gray-600 text-sm">– {c.motivo}</span>
                               )}
                             </div>
                             <div className="flex items-center gap-3 text-sm text-gray-500">
                               <span className="flex items-center gap-1">
                                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                 </svg>
                                 {formatFechaHora(c.fecha)}
                               </span>
                               {c.veterinario && (
                                 <span className="flex items-center gap-1">
                                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                   </svg>
                                   {c.veterinario}
                                 </span>
                               )}
                             </div>
                           </div>
                         </div>
                         
                         {/* Menú de acciones mejorado */}
                         <div className="relative">
                           <button 
                             onClick={() => setOpenHistMenu(openHistMenu === String(c.id) ? null : String(c.id))} 
                             className="p-2 rounded-lg hover:bg-white/80 transition-colors group-hover:bg-white/60"
                           >
                             <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                             </svg>
                           </button>
                           {openHistMenu === String(c.id) && (
                             <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20">
                               <button 
                                 className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors" 
                                 onClick={async () => { 
                                   try { 
                                     setOpenHistMenu(null); 
                                     const res = await fetch(`/api/consultas?id=${c.id}`); 
                                     const json = await res.json(); 
                                     if (res.ok && json?.ok) { 
                                       setEditConsulta(json.data); 
                                     } else { 
                                       setEditConsulta(c); 
                                     } 
                                   } catch { 
                                     setEditConsulta(c); 
                                   } 
                                 }}
                               >
                                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                 </svg>
                                 Ver/Editar
                               </button>
                               <button 
                                 className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors" 
                                 onClick={() => { setConfirmDelete({ id: String(c.id) }); setOpenHistMenu(null); }}
                               >
                                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                 </svg>
                                 Eliminar
                               </button>
                             </div>
                           )}
                         </div>
                       </div>
                     </div>
                     
                     {/* Contenido principal */}
                     <div className="px-6 py-4">
                       {c.resumen || (Array.isArray(c.recetas) && c.recetas.length > 0) ? (
                         <>
                           {c.resumen && (
                             <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                               <div className="flex items-start gap-2">
                                 <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                 </svg>
                                 <div className="text-sm text-gray-700 leading-relaxed">
                                   {c.resumen}
                                 </div>
                               </div>
                             </div>
                           )}
                           
                           {/* Recetas vinculadas con mejor diseño */}
                           {Array.isArray(c.recetas) && c.recetas.length > 0 && (
                             <div className="space-y-3">
                               <div className="flex items-center gap-2 mb-3">
                                 <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                 </svg>
                                 <h5 className="font-semibold text-gray-800">Recetas</h5>
                               </div>
                               <div className="space-y-3">
                                 {c.recetas.map((r: any) => (
                                   <div key={r.id} className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-4 border border-indigo-100 hover:border-indigo-200 transition-colors">
                                     <div className="flex items-center justify-between mb-3">
                                       <div className="flex items-center gap-2">
                                         <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                                         <span className="font-medium text-indigo-800">Receta #{r.id}</span>
                                       </div>
                                       <span className="text-xs text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full">
                                         {formatFechaHora(r.fecha || r.created_at)}
                                       </span>
                                     </div>
                                     {Array.isArray(r.items) && r.items.length > 0 && (
                                       <div className="space-y-2">
                                         {r.items.slice(0,3).map((it: any, idx: number) => (
                                           <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                                             <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full flex-shrink-0"></span>
                                             <span className="font-medium text-gray-800">{it.nombre_medicamento}</span>
                                             <span className="text-gray-500">–</span>
                                             <span>{it.dosis}</span>
                                             {it.via && (
                                               <>
                                                 <span className="text-gray-400">•</span>
                                                 <span className="text-gray-500 text-xs bg-gray-100 px-2 py-0.5 rounded-full">{it.via}</span>
                                               </>
                                             )}
                                           </div>
                                         ))}
                                         {r.items.length > 3 && (
                                           <div className="text-xs text-gray-500 italic">
                                             +{r.items.length - 3} medicamentos más...
                                           </div>
                                         )}
                                       </div>
                                     )}
                                   </div>
                                 ))}
                               </div>
                             </div>
                           )}
                         </>
                       ) : (
                         <div className="flex items-center justify-center py-8">
                           <div className="flex items-center gap-3 text-gray-400">
                             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                             </svg>
                             <span className="text-sm">No hay datos para mostrar</span>
                           </div>
                         </div>
                       )}
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          )}

          {error && <p className="text-sm text-red-600 mt-4">{error}</p>}
          {success && <p className="text-sm text-green-600 mt-4">{success}</p>}
        </div>
      </div>
    </div>
  );
}

function OwnerEditForm({ data, onCancel, onSave, saving }: { data: Owner; onCancel: () => void; onSave: (u: Partial<Owner>) => Promise<void>; saving: boolean; }) {
  const [nombre, setNombre] = useState(data?.nombre || "");
  const [apellido, setApellido] = useState(data?.apellido || "");
  const [rut, setRut] = useState(data?.rut || "");
  const [telefono, setTelefono] = useState(data?.telefono || "");
  const [direccion, setDireccion] = useState(data?.direccion || "");
  const [email, setEmail] = useState(data?.correo_electronico || "");
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSave({ nombre, apellido, rut, telefono, direccion, correo_electronico: email }); }}
      className="grid grid-cols-2 gap-3"
    >
      <div className="col-span-2">
        <label className="block text-xs font-medium text-gray-600 mb-1">RUT</label>
        <input className="w-full rounded-lg border border-indigo-300/70 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 bg-white" value={rut} onChange={(e) => setRut(e.target.value)} />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Nombre</label>
        <input className="w-full rounded-lg border border-indigo-300/70 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 bg-white" value={nombre} onChange={(e) => setNombre(e.target.value)} />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Apellido</label>
        <input className="w-full rounded-lg border border-indigo-300/70 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 bg-white" value={apellido} onChange={(e) => setApellido(e.target.value)} />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Teléfono</label>
        <input className="w-full rounded-lg border border-indigo-300/70 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 bg-white" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
        <input className="w-full rounded-lg border border-indigo-300/70 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 bg-white" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="col-span-2">
        <label className="block text-xs font-medium text-gray-600 mb-1">Dirección</label>
        <input className="w-full rounded-lg border border-indigo-300/70 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 bg-white" value={direccion} onChange={(e) => setDireccion(e.target.value)} />
      </div>
      <div className="col-span-2 flex gap-2 mt-2">
        <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
        <button type="button" className="px-4 py-2 rounded-lg ring-1 ring-gray-300 bg-white hover:bg-gray-50" onClick={onCancel} disabled={saving}>Cancelar</button>
      </div>
    </form>
  );
}

function PetEditForm({ data, onCancel, onSave, saving }: { data: Mascota; onCancel: () => void; onSave: (u: Partial<Mascota>) => Promise<void>; saving: boolean; }) {
  const [nombre, setNombre] = useState(data?.nombre || "");
  const [raza, setRaza] = useState(data?.raza || "");
  const [sexo, setSexo] = useState<"" | "m" | "h">(data.sexo === true ? "m" : data.sexo === false ? "h" : "");
  const [color, setColor] = useState(data?.color || "");
  const [nac, setNac] = useState(data?.fecha_nacimiento || "");
  const [chip, setChip] = useState(data?.numero_microchip || "");
  const [esterilizado, setEsterilizado] = useState<boolean>(data?.esterilizado || false);
  const [especie, setEspecie] = useState<"gato" | "perro">(data.especie ? "gato" : "perro");
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSave({ nombre, raza, sexo: sexo === "m", color, fecha_nacimiento: nac, numero_microchip: chip, esterilizado, especie: especie === "gato" }); }}
      className="grid grid-cols-2 gap-3"
    >
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Nombre</label>
        <input className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2" value={nombre} onChange={(e) => setNombre(e.target.value)} />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Especie</label>
        <select className="w-full rounded-lg border border-indigo-300/70 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 bg-white" value={especie} onChange={(e) => setEspecie(e.target.value as any)}>
          <option value="gato">Gato</option>
          <option value="perro">Perro</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Raza</label>
        <input className="w-full rounded-lg border border-indigo-300/70 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 bg-white" value={raza} onChange={(e) => setRaza(e.target.value)} />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Sexo</label>
        <select className="w-full rounded-lg border border-indigo-300/70 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 bg-white" value={sexo} onChange={(e) => setSexo(e.target.value as any)}>
          <option value="">Sin especificar</option>
          <option value="m">Macho</option>
          <option value="h">Hembra</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Fecha nac.</label>
        <input type="date" className="w-full rounded-lg border border-indigo-300/70 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 bg-white" value={nac} onChange={(e) => setNac(e.target.value)} />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Color</label>
        <input className="w-full rounded-lg border border-indigo-300/70 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 bg-white" value={color} onChange={(e) => setColor(e.target.value)} />
      </div>
      <div className="col-span-2">
        <label className="block text-xs font-medium text-gray-600 mb-1">Microchip</label>
        <input className="w-full rounded-lg border border-indigo-300/70 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 bg-white" value={chip} onChange={(e) => setChip(e.target.value)} />
      </div>
      <div className="col-span-2">
        <label className="block text-xs font-medium text-gray-600 mb-1">Esterilizado/a</label>
        <button type="button" aria-pressed={esterilizado} onClick={() => setEsterilizado(!esterilizado)} className={`relative inline-flex items-center h-8 rounded-full w-14 transition-colors ${esterilizado ? 'bg-emerald-600' : 'bg-gray-300'}`}>
          <span className={`inline-block w-7 h-7 transform bg-white rounded-full shadow transition-transform ${esterilizado ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </div>
      <div className="col-span-2 flex gap-2 mt-2">
        <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
        <button type="button" className="px-4 py-2 rounded-lg ring-1 ring-gray-300 bg-white hover:bg-gray-50" onClick={onCancel} disabled={saving}>Cancelar</button>
      </div>
    </form>
  );
}

function AntecedentesForm({ data, onCancel, onSave, saving }: { data: Antecedentes; onCancel: () => void; onSave: (u: any) => Promise<void>; saving: boolean; }) {
  const [origen, setOrigen] = useState<string>(data?.origen || "");
  const [habitat, setHabitat] = useState<string>(data?.habitat || "");
  const [comportamiento, setComportamiento] = useState<string>(data?.comportamiento || "");
  const [enfermedades, setEnfermedades] = useState<string>(data?.enfermedades || "");
  const [alergias, setAlergias] = useState<string>(data?.alergias || "");
  const [observaciones, setObservaciones] = useState<string>(data?.observaciones || "");
  const [alertas, setAlertas] = useState<string>(data?.alertas || "");
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave({ origen, habitat, comportamiento, enfermedades, alergias, observaciones, alertas }); }} className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Origen</label>
        <input className="w-full rounded-lg border border-indigo-300/70 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 bg-white" value={origen} onChange={(e) => setOrigen(e.target.value)} placeholder="Adoptado, comprado, rescatado..." />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Hábitat</label>
        <input className="w-full rounded-lg border border-indigo-300/70 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 bg-white" value={habitat} onChange={(e) => setHabitat(e.target.value)} placeholder="Interior, exterior, con niños, más mascotas..." />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Comportamiento</label>
        <input className="w-full rounded-lg border border-indigo-300/70 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 bg-white" value={comportamiento} onChange={(e) => setComportamiento(e.target.value)} placeholder="Agresivo, dócil, activo, sedentario..." />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Enfermedades</label>
        <textarea className="w-full min-h-[80px] rounded-lg border border-indigo-300/70 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 bg-white" value={enfermedades} onChange={(e) => setEnfermedades(e.target.value)} placeholder="Antecedentes médicos, edades, tratamientos, resultados..." />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Alergias</label>
        <textarea className="w-full min-h-[80px] rounded-lg border border-indigo-300/70 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 bg-white" value={alergias} onChange={(e) => setAlergias(e.target.value)} placeholder="Vacunas, alimentos, fármacos, atopia..." />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Observaciones</label>
        <textarea className="w-full min-h-[80px] rounded-lg border border-indigo-300/70 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 bg-white" value={observaciones} onChange={(e) => setObservaciones(e.target.value)} placeholder="Notas generales" />
      </div>
      <div className="md:col-span-2">
        <label className="block text-xs font-medium text-gray-600 mb-1">Alertas</label>
        <textarea className="w-full min-h-[80px] rounded-lg border border-indigo-300/70 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 bg-white" value={alertas} onChange={(e) => setAlertas(e.target.value)} placeholder="Advertencias importantes" />
      </div>
      <div className="md:col-span-2 flex gap-2 mt-2">
        <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
        <button type="button" className="px-4 py-2 rounded-lg ring-1 ring-gray-300 bg-white hover:bg-gray-50" onClick={onCancel} disabled={saving}>Cancelar</button>
      </div>
    </form>
  );
}


