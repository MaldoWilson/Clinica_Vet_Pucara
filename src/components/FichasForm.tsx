// src/components/FichaForm.tsx
"use client";

import { useState } from "react";
import { cleanRutInput, formatRutPretty, normalizeRutPlain, isValidRut } from "@/lib/rut";
import { formatIntlPhone, isValidIntlPhone } from "@/lib/phone";

type Owner = {
  propietario_id: string;
  nombre: string;
  apellido: string;
  rut: string;
  telefono?: string | null;
  direccion?: string | null;
  correo_electronico?: string | null;
};

export default function FichaForm() {
  // Propietario
  const [rut, setRut] = useState("");
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [ownerNombre, setOwnerNombre] = useState("");
  const [ownerApellido, setOwnerApellido] = useState("");
  const [ownerTelefono, setOwnerTelefono] = useState("+56 ");
  const [phoneValido, setPhoneValido] = useState<boolean | null>(null);
  const [ownerDireccion, setOwnerDireccion] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");

  // Mascota
  const [nombre, setNombre] = useState("");
  // especie: gato=true, perro=false
  const [especie, setEspecie] = useState<"" | "gato" | "perro">("");
  const [raza, setRaza] = useState("");
  const [sexo, setSexo] = useState<"" | "macho" | "hembra">("");
  const [color, setColor] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState(""); // YYYY-MM-DD
  const [microchip, setMicrochip] = useState("");
  const [esterilizado, setEsterilizado] = useState<null | boolean>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [ownerLookupLoading, setOwnerLookupLoading] = useState(false);
  const [ownerFound, setOwnerFound] = useState(false);
  const [rutValido, setRutValido] = useState<boolean | null>(null);

  function limpiarFormulario() {
    setRut("");
    setOwnerId(null);
    setOwnerNombre("");
    setOwnerApellido("");
    setOwnerTelefono("");
    setOwnerDireccion("");
    setOwnerEmail("");

    setNombre("");
    setEspecie("");
    setRaza("");
    setSexo("");
    setColor("");
    setFechaNacimiento("");
    setMicrochip("");
    setEsterilizado(null);
    setSuccess(null);
    setError(null);
    setOwnerFound(false);
  }

  async function handleBuscarRut() {
    setOwnerLookupLoading(true);
    setError(null);
    setSuccess(null);
    setOwnerFound(false);
    setOwnerId(null);
    try {
      const q = normalizeRutPlain(rut.trim());
      if (!q) {
        setError("Ingrese un RUT para buscar");
        return;
      }
      if (!isValidRut(q)) {
        setError("RUT inválido (dígito verificador)");
        return;
      }
      const res = await fetch(`/api/propietarios?rut=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error al buscar propietario");
      const owner: Owner | null = data?.data || null;
      if (owner) {
        setOwnerId(String(owner.propietario_id));
        setOwnerNombre(owner.nombre || "");
        setOwnerApellido(owner.apellido || "");
        setOwnerTelefono(owner.telefono || "");
        setOwnerDireccion(owner.direccion || "");
        setOwnerEmail(owner.correo_electronico || "");
        setOwnerFound(true);
      } else {
        // No existe, limpiar campos para crear
        setOwnerNombre("");
        setOwnerApellido("");
        setOwnerTelefono("");
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
    // Si ya tenemos ownerId, devolverlo
    if (ownerId) return ownerId;
    // Crear propietario con los datos llenados
    const nombreTrim = ownerNombre.trim();
    const apellidoTrim = ownerApellido.trim();
    const rutTrim = normalizeRutPlain(rut.trim());
    if (!nombreTrim || !apellidoTrim || !rutTrim) {
      throw new Error("Complete nombre, apellido y RUT del propietario");
    }
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
      // Si chocamos con UNIQUE por carrera, reintentar buscando
      if (res.status === 409) {
        const again = await fetch(`/api/propietarios?rut=${encodeURIComponent(rutTrim)}`);
        const againJson = await again.json();
        if (!again.ok) throw new Error(againJson?.error || "Error al obtener propietario tras conflicto");
        const owner: Owner | null = againJson?.data || null;
        if (!owner) throw new Error("No se pudo resolver propietario existente");
        setOwnerId(String(owner.propietario_id));
        return String(owner.propietario_id);
      }
      throw new Error(data?.error || "No se pudo crear el propietario");
    }
    const owner: Owner = data?.data;
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

      // Asegurar propietario
      const propietarioId = await ensureOwner();

      const payload: any = {
        nombre: nombre.trim(),
        propietario_id: propietarioId,
      };
      if (especie !== "") payload.especie = especie === "gato"; // booleano
      if (raza.trim()) payload.raza = raza.trim();
      if (sexo !== "") payload.sexo = sexo === "macho";
      if (color.trim()) payload.color = color.trim();
      if (fechaNacimiento) payload.fecha_nacimiento = fechaNacimiento; // YYYY-MM-DD
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
      // Reset mínimos de mascota para permitir crear otra
      setNombre("");
      setEspecie("");
      setRaza("");
      setSexo("");
      setColor("");
      setFechaNacimiento("");
      setMicrochip("");
      setEsterilizado(null);
    } catch (e: any) {
      setError(e?.message || "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8 max-w-[90rem] mx-auto">
      <div className="relative overflow-hidden rounded-2xl ring-1 ring-gray-200/70 bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-indigo-400 to-indigo-600" />
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Crear Ficha de Mascota</h2>
          <form onSubmit={handleSubmit}>
          {/* Propietario */}
          <div className="rounded-xl ring-1 ring-gray-200 p-4 bg-white/90 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold tracking-wide text-indigo-600">Datos del Propietario</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
              <div className="md:col-span-2">
                <label className="block font-medium">RUT</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    className="w-full rounded-lg border border-indigo-300/70 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 bg-white"
                    value={rut}
                    onChange={(e) => {
                      const cleaned = cleanRutInput(e.target.value);
                      const pretty = formatRutPretty(cleaned);
                      setRut(pretty);
                      // validar si ya tiene DV
                      const normalized = normalizeRutPlain(pretty);
                      setRutValido(normalized.length > 2 ? isValidRut(normalized) : null);
                    }}
                    placeholder="12.345.678-9"
                  />
                  <button
                    type="button"
                    onClick={handleBuscarRut}
                    disabled={ownerLookupLoading}
                    className="px-3 py-2 rounded-lg ring-1 ring-gray-300 bg-white hover:bg-gray-50"
                    title="Buscar propietario por RUT"
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
                <label className="block font-medium">Nombre *</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-indigo-300/70 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 bg-white"
                  value={ownerNombre}
                  onChange={(e) => setOwnerNombre(e.target.value)}
                  placeholder="Nombre"
                />
              </div>
              <div>
                <label className="block font-medium">Apellido *</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-indigo-300/70 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 bg-white"
                  value={ownerApellido}
                  onChange={(e) => setOwnerApellido(e.target.value)}
                  placeholder="Apellido"
                />
              </div>
              <div>
                <label className="block font-medium">Teléfono</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-indigo-300/70 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 bg-white"
                  value={ownerTelefono}
                  onChange={(e) => {
                    const v = formatIntlPhone(e.target.value);
                    setOwnerTelefono(v);
                    setPhoneValido(isValidIntlPhone(v));
                  }}
                  placeholder="Ej: +56 912345678"
                />
                {phoneValido === false && <p className="text-xs text-red-600 mt-1">Formato requerido: +CC y 9 dígitos. Ej: +56 912345678</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
              <div className="md:col-span-2">
                <label className="block font-medium">Dirección</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-indigo-300/70 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 bg-white"
                  value={ownerDireccion}
                  onChange={(e) => setOwnerDireccion(e.target.value)}
                  placeholder="Calle 123, Ciudad"
                />
              </div>
              <div>
                <label className="block font-medium">Correo electrónico</label>
                <input
                  type="email"
                  className="w-full rounded-lg border border-indigo-300/70 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 bg-white"
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  placeholder="correo@ejemplo.cl"
                />
              </div>
            </div>
          </div>

          {/* Mascota */}
          <div className="rounded-xl ring-1 ring-gray-200 p-4 bg-white/90">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold tracking-wide text-indigo-600">Datos de la Mascota</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
              <div>
                <label className="block font-medium">Nombre *</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-indigo-300/70 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 bg-white"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Firulais"
                />
              </div>
              <div>
                <label className="block font-medium">Especie *</label>
                <select
                  className="w-full rounded-lg border border-indigo-300/70 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 bg-white"
                  value={especie}
                  onChange={(e) => setEspecie(e.target.value as any)}
                >
                  <option value="">Selecciona especie</option>
                  <option value="gato">Gato</option>
                  <option value="perro">Perro</option>
                </select>
               
              </div>
              <div>
                <label className="block font-medium">Raza</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-indigo-300/70 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 bg-white"
                  value={raza}
                  onChange={(e) => setRaza(e.target.value)}
                  placeholder="Mestizo, Labrador, ..."
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
              <div>
                <label className="block font-medium">Sexo</label>
                <select
                  className="w-full rounded-lg border border-indigo-300/70 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 bg-white"
                  value={sexo}
                  onChange={(e) => setSexo(e.target.value as any)}
                >
                  <option value="">Sin especificar</option>
                  <option value="macho">Macho</option>
                  <option value="hembra">Hembra</option>
                </select>
      
              </div>
              <div>
                <label className="block font-medium">Color</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-indigo-300/70 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 bg-white"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="Café, Negro, ..."
                />
              </div>
              <div>
                <label className="block font-medium">Fecha de nacimiento</label>
                <input
                  type="date"
                  className="w-full rounded-lg border border-indigo-300/70 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 bg-white"
                  value={fechaNacimiento}
                  onChange={(e) => setFechaNacimiento(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
              <div>
                <label className="block font-medium">N° microchip</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-indigo-300/70 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 bg-white"
                  value={microchip}
                  onChange={(e) => setMicrochip(e.target.value)}
                  placeholder="Opcional"
                />
              </div>
              <div className="flex items-end">
                <div>
                  <label className="block font-medium mb-1">Esterilizado/a</label>
                  <button
                    type="button"
                    aria-pressed={esterilizado === true}
                    onClick={() => setEsterilizado(esterilizado ? null : true)}
                    className={`relative inline-flex items-center h-8 rounded-full w-14 transition-colors ${esterilizado ? 'bg-emerald-600' : 'bg-gray-300'}`}
                    title="Marcar si la mascota está esterilizada"
                  >
                    <span
                      className={`inline-block w-7 h-7 transform bg-white rounded-full shadow transition-transform ${esterilizado ? 'translate-x-6' : 'translate-x-1'}`}
                    />
                  </button>
          
                </div>
              </div>
            </div>
          </div>

          {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
          {success && <p className="text-sm text-green-600 mt-3">{success}</p>}

          {(() => {
            const rutOk = isValidRut(normalizeRutPlain(rut.trim()));
            const phoneOk = isValidIntlPhone(ownerTelefono.trim());
            const submitDisabled = loading || !rutOk || !phoneOk;
            return (
              <div className="flex items-center gap-2 mt-4">
                <button
                  type="submit"
                  disabled={submitDisabled}
                  className={`px-6 py-3 rounded-lg font-semibold transition-colors ${submitDisabled ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'text-white bg-indigo-600 hover:bg-indigo-700'}`}
                >
                  {loading ? "Guardando..." : "Guardar Ficha"}
                </button>
                <button
                  type="button"
                  className="px-3 py-2 rounded-lg ring-1 ring-gray-300 bg-white hover:bg-gray-50"
                  onClick={limpiarFormulario}
                >
                  Limpiar
                </button>
              </div>
            );
          })()}
          </form>
        </div>
      </div>
    </div>
  );
}
