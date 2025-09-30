"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { formatRutPretty, isValidRut } from "@/lib/rut";
import Image from "next/image";

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

type TabId = "general" | "antecedentes" | "historial";

type Antecedentes = {
  mascotas_id: string;
  origen?: string | null;
  habitat?: string | null;
  comportamiento?: string | null;
  enfermedades?: string | null;
  alergias?: string | null;
  observaciones?: string | null;
  alertas?: string[] | null;
  updated_at?: string | null;
};

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

  const [antecedentes, setAntecedentes] = useState<Antecedentes | null>(null);
  const [anteLoading, setAnteLoading] = useState(false);
  const [editAntecedentes, setEditAntecedentes] = useState(false);
  const [savingAntecedentes, setSavingAntecedentes] = useState(false);
  const [newAlert, setNewAlert] = useState("");

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

  useEffect(() => {
    const loadAnte = async () => {
      if (!id) return;
      setAnteLoading(true);
      try {
        const res = await fetch(`/api/mascotas/antecedentes?mascotas_id=${encodeURIComponent(String(id))}`);
        const json = await res.json();
        if (!res.ok || json?.ok === false) throw new Error(json?.error || "No se pudo cargar antecedentes");
        setAntecedentes(json.data as Antecedentes);
      } catch (e: any) {
        setError(e?.message || "Error inesperado");
      } finally {
        setAnteLoading(false);
      }
    };
    loadAnte();
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

  function addAlert() {
    const value = newAlert.trim();
    if (!value) return;
    setAntecedentes((prev) => prev ? ({ ...prev, alertas: [ ...(prev.alertas || []), value ] }) : prev);
    setNewAlert("");
  }

  function removeAlert(index: number) {
    setAntecedentes((prev) => {
      if (!prev) return prev;
      const list = [ ...(prev.alertas || []) ];
      list.splice(index, 1);
      return { ...prev, alertas: list };
    });
  }

  async function saveAntecedentes() {
    if (!data?.mascotas_id || !antecedentes) return;
    setSavingAntecedentes(true); setError(null); setSuccess(null);
    try {
      const payload = {
        mascotas_id: data.mascotas_id,
        origen: antecedentes.origen || null,
        habitat: antecedentes.habitat || null,
        comportamiento: antecedentes.comportamiento || null,
        enfermedades: antecedentes.enfermedades || null,
        alergias: antecedentes.alergias || null,
        observaciones: antecedentes.observaciones || null,
        alertas: antecedentes.alertas || [],
      };
      const res = await fetch("/api/mascotas/antecedentes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || json?.ok === false) throw new Error(json?.error || "No se pudo guardar antecedentes");
      setAntecedentes(json.data as Antecedentes);
      setSuccess("Antecedentes guardados");
      setEditAntecedentes(false);
    } catch (e: any) {
      setError(e?.message || "Error inesperado");
    } finally { setSavingAntecedentes(false); }
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

  if (loading) {
    return <div className="text-center text-gray-600">Cargando...</div>;
  }
  if (!data) return <div className="text-center text-gray-600">Paciente no encontrado</div>;

  const o = data.propietario || {};
  const sexo = data.sexo === true ? "Macho" : data.sexo === false ? "Hembra" : "-";
  const especie = data.especie === true ? "Gato" : "Perro";

  return (
    <div className="max-w-6xl mx-auto">
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
          </div>
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

          {tab === "antecedentes" && (
            <div className={`rounded-xl p-4 bg-white/90 ${editAntecedentes ? 'ring-2 ring-indigo-300 bg-indigo-50/40' : 'ring-1 ring-gray-200'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-semibold tracking-wide text-indigo-600">Antecedentes de {data.nombre}</h3>
                  {editAntecedentes && (<span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 ring-1 ring-amber-200">Editando</span>)}
                </div>
                <button
                  aria-pressed={editAntecedentes}
                  className={`text-sm ${editAntecedentes ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-600'}`}
                  title={editAntecedentes ? "Cerrar edición" : "Editar antecedentes"}
                  onClick={() => setEditAntecedentes((v) => !v)}
                >
                  {editAntecedentes ? '✕' : '✎'}
                </button>
              </div>

              {anteLoading && (
                <div className="text-gray-600">Cargando antecedentes...</div>
              )}

              {!anteLoading && !editAntecedentes && (
                <div className="space-y-4 text-sm">
                  <div>
                    <div className="text-gray-500">Origen</div>
                    <div className="font-medium whitespace-pre-wrap">{antecedentes?.origen || '-'}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Hábitat</div>
                    <div className="font-medium whitespace-pre-wrap">{antecedentes?.habitat || '-'}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Comportamiento</div>
                    <div className="font-medium whitespace-pre-wrap">{antecedentes?.comportamiento || '-'}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Enfermedades</div>
                    <div className="font-medium whitespace-pre-wrap">{antecedentes?.enfermedades || '-'}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Alergias</div>
                    <div className="font-medium whitespace-pre-wrap">{antecedentes?.alergias || '-'}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Observaciones Generales</div>
                    <div className="font-medium whitespace-pre-wrap">{antecedentes?.observaciones || '-'}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 mb-1">Alertas</div>
                    <div className="flex flex-wrap gap-2">
                      {(antecedentes?.alertas || []).length === 0 && (
                        <span className="text-gray-500">Sin alertas</span>
                      )}
                      {(antecedentes?.alertas || []).map((a, i) => (
                        <span key={i} className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 ring-1 ring-rose-200">{a}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {!anteLoading && editAntecedentes && (
                <form
                  onSubmit={(e) => { e.preventDefault(); saveAntecedentes(); }}
                  className="grid grid-cols-1 gap-3 text-sm"
                >
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Origen</label>
                    <textarea className="w-full rounded-lg border border-indigo-300/70 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 bg-white min-h-[72px]" value={antecedentes?.origen || ''} onChange={(e) => setAntecedentes((p) => p ? ({ ...p, origen: e.target.value }) : p)} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Hábitat</label>
                    <textarea className="w-full rounded-lg border border-indigo-300/70 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 bg-white min-h-[72px]" value={antecedentes?.habitat || ''} onChange={(e) => setAntecedentes((p) => p ? ({ ...p, habitat: e.target.value }) : p)} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Comportamiento</label>
                    <textarea className="w-full rounded-lg border border-indigo-300/70 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 bg-white min-h-[72px]" value={antecedentes?.comportamiento || ''} onChange={(e) => setAntecedentes((p) => p ? ({ ...p, comportamiento: e.target.value }) : p)} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Enfermedades</label>
                    <textarea className="w-full rounded-lg border border-indigo-300/70 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 bg-white min-h-[72px]" value={antecedentes?.enfermedades || ''} onChange={(e) => setAntecedentes((p) => p ? ({ ...p, enfermedades: e.target.value }) : p)} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Alergias</label>
                    <textarea className="w-full rounded-lg border border-indigo-300/70 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 bg-white min-h-[72px]" value={antecedentes?.alergias || ''} onChange={(e) => setAntecedentes((p) => p ? ({ ...p, alergias: e.target.value }) : p)} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Observaciones Generales</label>
                    <textarea className="w-full rounded-lg border border-indigo-300/70 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 bg-white min-h-[84px]" value={antecedentes?.observaciones || ''} onChange={(e) => setAntecedentes((p) => p ? ({ ...p, observaciones: e.target.value }) : p)} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Alertas</label>
                    <div className="flex gap-2 mb-2">
                      <input className="flex-1 rounded-lg border border-rose-300/70 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 px-3 py-2 bg-white" value={newAlert} onChange={(e) => setNewAlert(e.target.value)} placeholder="Ej: Alergia a penicilina" />
                      <button type="button" className="px-3 py-2 rounded-lg bg-rose-600 text-white hover:bg-rose-700" onClick={addAlert}>Agregar</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(antecedentes?.alertas || []).map((a, i) => (
                        <span key={`${a}-${i}`} className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 ring-1 ring-rose-200">
                          {a}
                          <button type="button" className="ml-1 text-rose-600/70 hover:text-rose-700" onClick={() => removeAlert(i)}>✕</button>
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-1">
                    <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm" disabled={savingAntecedentes}>{savingAntecedentes ? 'Guardando...' : 'Guardar'}</button>
                    <button type="button" className="px-4 py-2 rounded-lg ring-1 ring-gray-300 bg-white hover:bg-gray-50" onClick={() => setEditAntecedentes(false)} disabled={savingAntecedentes}>Cancelar</button>
                  </div>
                </form>
              )}
            </div>
          )}

          {tab === "historial" && (
            <div className="space-y-3">
              <div className="text-gray-600">(Próximamente) Línea de tiempo de atenciones, vacunas, etc.</div>
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


