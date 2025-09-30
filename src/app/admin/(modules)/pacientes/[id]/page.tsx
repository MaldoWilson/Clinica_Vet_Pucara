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
      <div className="bg-white border rounded-2xl shadow-sm p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-full bg-indigo-50 overflow-hidden flex items-center justify-center">
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
            <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
              {data.nombre}
            </h1>
            <div className="text-gray-600 flex flex-wrap gap-4 mt-1 text-sm">
              <span>{especie}{data.raza ? ` · ${data.raza}` : ""}</span>
              <span>Sexo: {sexo}</span>
              <span>Edad: {edadTexto}</span>
              <span>Ficha Nº: {data.mascotas_id}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border rounded-2xl shadow-sm">
        <div className="border-b px-4 md:px-6">
          <div className="flex gap-6">
            {["general","antecedentes","historial"].map((t) => (
              <button
                key={t}
                className={`py-4 font-medium ${tab === t ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600 hover:text-gray-800'}`}
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
              <div>
                 <div className="flex items-center justify-between mb-3">
                   <h3 className="text-sm font-semibold text-gray-900">Paciente</h3>
                   <button className="text-gray-400 hover:text-gray-600 text-sm" title="Editar paciente" onClick={() => setEditPet((v) => !v)}>✎</button>
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
              <div>
                 <div className="flex items-center justify-between mb-3">
                   <h3 className="text-sm font-semibold text-gray-900">Tutor</h3>
                   <button className="text-gray-400 hover:text-gray-600 text-sm" title="Editar tutor" onClick={() => setEditOwner((v) => !v)}>✎</button>
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
            <div className="text-gray-600">(Próximamente) Sección de antecedentes médicos.</div>
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
      <div className="col-span-2"><label className="block text-sm">RUT</label><input className="w-full border rounded px-2 py-1" value={rut} onChange={(e) => setRut(e.target.value)} /></div>
      <div><label className="block text-sm">Nombre</label><input className="w-full border rounded px-2 py-1" value={nombre} onChange={(e) => setNombre(e.target.value)} /></div>
      <div><label className="block text-sm">Apellido</label><input className="w-full border rounded px-2 py-1" value={apellido} onChange={(e) => setApellido(e.target.value)} /></div>
      <div><label className="block text-sm">Teléfono</label><input className="w-full border rounded px-2 py-1" value={telefono} onChange={(e) => setTelefono(e.target.value)} /></div>
      <div><label className="block text-sm">Email</label><input className="w-full border rounded px-2 py-1" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
      <div className="col-span-2"><label className="block text-sm">Dirección</label><input className="w-full border rounded px-2 py-1" value={direccion} onChange={(e) => setDireccion(e.target.value)} /></div>
      <div className="col-span-2 flex gap-2 mt-1">
        <button type="submit" className="px-3 py-2 rounded bg-indigo-600 text-white" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
        <button type="button" className="px-3 py-2 rounded border" onClick={onCancel} disabled={saving}>Cancelar</button>
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
      <div><label className="block text-sm">Nombre</label><input className="w-full border rounded px-2 py-1" value={nombre} onChange={(e) => setNombre(e.target.value)} /></div>
      <div><label className="block text-sm">Especie</label>
        <select className="w-full border rounded px-2 py-1 bg-white" value={especie} onChange={(e) => setEspecie(e.target.value as any)}>
          <option value="gato">Gato</option>
          <option value="perro">Perro</option>
        </select>
      </div>
      <div><label className="block text-sm">Raza</label><input className="w-full border rounded px-2 py-1" value={raza} onChange={(e) => setRaza(e.target.value)} /></div>
      <div><label className="block text-sm">Sexo</label>
        <select className="w-full border rounded px-2 py-1 bg-white" value={sexo} onChange={(e) => setSexo(e.target.value as any)}>
          <option value="">Sin especificar</option>
          <option value="m">Macho</option>
          <option value="h">Hembra</option>
        </select>
      </div>
      <div><label className="block text-sm">Fecha nac.</label><input type="date" className="w-full border rounded px-2 py-1" value={nac} onChange={(e) => setNac(e.target.value)} /></div>
      <div><label className="block text-sm">Color</label><input className="w-full border rounded px-2 py-1" value={color} onChange={(e) => setColor(e.target.value)} /></div>
      <div className="col-span-2"><label className="block text-sm">Microchip</label><input className="w-full border rounded px-2 py-1" value={chip} onChange={(e) => setChip(e.target.value)} /></div>
      <div className="col-span-2">
        <label className="block text-sm mb-1">Esterilizado/a</label>
        <button type="button" aria-pressed={esterilizado} onClick={() => setEsterilizado(!esterilizado)} className={`relative inline-flex items-center h-8 rounded-full w-14 transition-colors ${esterilizado ? 'bg-emerald-600' : 'bg-gray-300'}`}>
          <span className={`inline-block w-7 h-7 transform bg-white rounded-full shadow transition-transform ${esterilizado ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </div>
      <div className="col-span-2 flex gap-2 mt-1">
        <button type="submit" className="px-3 py-2 rounded bg-indigo-600 text-white" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
        <button type="button" className="px-3 py-2 rounded border" onClick={onCancel} disabled={saving}>Cancelar</button>
      </div>
    </form>
  );
}


