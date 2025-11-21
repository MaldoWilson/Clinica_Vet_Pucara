"use client";

import { useState } from "react";
import { cleanRutInput, formatRutPretty, isValidRut, normalizeRutPlain } from "@/lib/rut";
import { formatIntlPhone, isValidIntlPhone } from "@/lib/phone";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
};

export default function FichaCreateModal({ isOpen, onClose, onSaved }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Propietario
  const [rut, setRut] = useState("");
  const [rutValido, setRutValido] = useState<boolean | null>(null);
  const [ownerLookupLoading, setOwnerLookupLoading] = useState(false);
  const [ownerFound, setOwnerFound] = useState(false);
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [ownerNombre, setOwnerNombre] = useState("");
  const [ownerApellido, setOwnerApellido] = useState("");
  const [ownerTelefono, setOwnerTelefono] = useState("+56 ");
  const [phoneValido, setPhoneValido] = useState<boolean | null>(null);
  const [ownerDireccion, setOwnerDireccion] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");

  // Mascota
  const [nombre, setNombre] = useState("");
  const [especie, setEspecie] = useState<"" | "gato" | "perro">("");
  const [raza, setRaza] = useState("");
  const [sexo, setSexo] = useState<"" | "macho" | "hembra">("");
  const [color, setColor] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [microchip, setMicrochip] = useState("");
  const [esterilizado, setEsterilizado] = useState<null | boolean>(null);

  if (!isOpen) return null;

  async function handleBuscarRut() {
    setOwnerLookupLoading(true);
    setError(null);
    setSuccess(null);
    setOwnerFound(false);
    setOwnerId(null);
    try {
      const q = normalizeRutPlain(rut.trim());
      if (!q) return;
      if (!isValidRut(q)) {
        setRutValido(false);
        return;
      }
      const res = await fetch(`/api/propietarios?rut=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error al buscar propietario");
      const owner = data?.data as any;
      if (owner) {
        setOwnerId(String(owner.propietario_id));
        setOwnerNombre(owner.nombre || "");
        setOwnerApellido(owner.apellido || "");
        setOwnerTelefono(owner.telefono || "");
        setOwnerDireccion(owner.direccion || "");
        setOwnerEmail(owner.correo_electronico || "");
        setOwnerFound(true);
      } else {
        setOwnerNombre("");
        setOwnerApellido("");
        setOwnerTelefono("+56 ");
        setOwnerDireccion("");
        setOwnerEmail("");
        setOwnerFound(false);
      }
    } catch (e: any) {
      setError(e?.message || "Error inesperado al buscar RUT");
    } finally {
      setOwnerLookupLoading(false);
    }
  }

  async function ensureOwner(): Promise<string> {
    if (ownerId) return ownerId;
    const nombreTrim = ownerNombre.trim();
    const apellidoTrim = ownerApellido.trim();
    const rutTrim = normalizeRutPlain(rut.trim());
    const res = await fetch("/api/propietarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: nombreTrim,
        apellido: apellidoTrim,
        rut: rutTrim,
        telefono: ownerTelefono.trim() || undefined,
        direccion: ownerDireccion.trim() || undefined,
        correo_electronico: ownerEmail.trim() || undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      if (res.status === 409) {
        const again = await fetch(`/api/propietarios?rut=${encodeURIComponent(rutTrim)}`);
        const againJson = await again.json();
        if (!again.ok) throw new Error(againJson?.error || "Error al obtener propietario tras conflicto");
        const owner = againJson?.data as any;
        if (!owner) throw new Error("No se pudo resolver propietario existente");
        setOwnerId(String(owner.propietario_id));
        return String(owner.propietario_id);
      }
      throw new Error(data?.error || "No se pudo crear el propietario");
    }
    const owner = data?.data as any;
    setOwnerId(String(owner.propietario_id));
    return String(owner.propietario_id);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      if (!nombre.trim()) throw new Error("El nombre de la mascota es obligatorio");
      const rutOk = isValidRut(normalizeRutPlain(rut.trim()));
      if (!rutOk) throw new Error("RUT inválido (dígito verificador)");
      const phoneOk = isValidIntlPhone(ownerTelefono.trim());
      if (!phoneOk) throw new Error("Teléfono inválido. Usa +CC y 9 dígitos (ej: +56 9XXXXXXXX)");

      const propietarioId = await ensureOwner();

      const payload: any = { nombre: nombre.trim(), propietario_id: propietarioId };
      if (especie !== "") payload.especie = especie === "gato";
      if (raza.trim()) payload.raza = raza.trim();
      if (sexo !== "") payload.sexo = sexo === "macho";
      if (color.trim()) payload.color = color.trim();
      if (fechaNacimiento) payload.fecha_nacimiento = fechaNacimiento;
      if (microchip.trim()) payload.numero_microchip = microchip.trim();
      if (esterilizado !== null) payload.esterilizado = esterilizado;

      const res = await fetch("/api/mascotas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "No se pudo crear la ficha de la mascota");

      setSuccess("Ficha de mascota creada correctamente");
      if (onSaved) onSaved();
      onClose();
    } catch (e: any) {
      setError(e?.message || "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b flex items-center justify-between">
          <h3 className="text-xl font-bold">Crear Ficha</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-6">
          <div>
            <h4 className="text-xs font-semibold tracking-wide text-indigo-600">Datos del Propietario</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">RUT</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={rut}
                    onChange={(e) => {
                      const cleaned = cleanRutInput(e.target.value);
                      const pretty = formatRutPretty(cleaned);
                      setRut(pretty);
                      const normalized = normalizeRutPlain(pretty);
                      setRutValido(normalized.length > 2 ? isValidRut(normalized) : null);
                    }}
                    placeholder="12.345.678-9"
                  />
                  <button
                    type="button"
                    onClick={handleBuscarRut}
                    disabled={ownerLookupLoading}
                    className="px-3 py-2 rounded-md border"
                  >
                    {ownerLookupLoading ? "Buscando..." : "Buscar"}
                  </button>
                </div>
                <div className="mt-1 text-sm">
                  {rutValido === false && <p className="text-red-600">RUT inválido</p>}
                  {rutValido === true && !ownerFound && <p className="text-gray-500">RUT válido</p>}
                  {ownerFound && <p className="text-green-700">Propietario encontrado</p>}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre *</label>
                <input type="text" className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" value={ownerNombre} onChange={(e) => setOwnerNombre(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Apellido *</label>
                <input type="text" className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" value={ownerApellido} onChange={(e) => setOwnerApellido(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Teléfono</label>
                <input
                  type="text"
                  className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={ownerTelefono}
                  onChange={(e) => { const v = formatIntlPhone(e.target.value); setOwnerTelefono(v); setPhoneValido(isValidIntlPhone(v)); }}
                  placeholder="Ej: +56 912345678"
                />
                {phoneValido === false && <p className="text-xs text-red-600 mt-1">Formato requerido: +CC y 9 dígitos. Ej: +56 912345678</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Dirección</label>
                <input type="text" className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" value={ownerDireccion} onChange={(e) => setOwnerDireccion(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Correo electrónico</label>
                <input type="email" className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} />
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold tracking-wide text-indigo-600">Datos de la Mascota</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre *</label>
                <input type="text" className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" value={nombre} onChange={(e) => setNombre(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Especie *</label>
                <select className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" value={especie} onChange={(e) => setEspecie(e.target.value as any)}>
                  <option value="">Selecciona especie</option>
                  <option value="gato">Gato</option>
                  <option value="perro">Perro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Raza</label>
                <input type="text" className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" value={raza} onChange={(e) => setRaza(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Sexo</label>
                <select className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" value={sexo} onChange={(e) => setSexo(e.target.value as any)}>
                  <option value="">Sin especificar</option>
                  <option value="macho">Macho</option>
                  <option value="hembra">Hembra</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Color</label>
                <input type="text" className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" value={color} onChange={(e) => setColor(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Fecha de nacimiento</label>
                <input type="date" className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" value={fechaNacimiento} onChange={(e) => setFechaNacimiento(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">N° microchip</label>
                <input type="text" className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" value={microchip} onChange={(e) => setMicrochip(e.target.value)} />
              </div>
              <div className="flex items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Esterilizado/a</label>
                  <button
                    type="button"
                    aria-pressed={esterilizado === true}
                    onClick={() => setEsterilizado(esterilizado ? null : true)}
                    className={`relative inline-flex items-center h-8 rounded-full w-14 transition-colors ${esterilizado ? 'bg-emerald-600' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block w-7 h-7 transform bg-white rounded-full shadow transition-transform ${esterilizado ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}
          {success && <div className="text-sm text-green-600">{success}</div>}

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t mt-6">
            <button type="button" onClick={onClose} className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium transition-colors">Cancelar</button>
            <button type="submit" disabled={loading} className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 font-medium shadow-sm transition-colors disabled:opacity-50">
              {loading ? "Guardando…" : "Guardar Ficha"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


