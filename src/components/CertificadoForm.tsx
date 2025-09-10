// src/components/CertificadoForm.tsx
"use client";

export default function CertificadoForm() {
  return (
    <div className="p-4 border rounded-md bg-white shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Generar Certificado</h2>
      <form>
        <div className="mb-2">
          <label className="block font-medium">Nombre del propietario</label>
          <input type="text" className="w-full border rounded px-2 py-1" />
        </div>
        <div className="mb-2">
          <label className="block font-medium">Nombre de la mascota</label>
          <input type="text" className="w-full border rounded px-2 py-1" />
        </div>
        <div className="mb-2">
          <label className="block font-medium">Tipo de certificado</label>
          <select className="w-full border rounded px-2 py-1">
            <option>Vacunación</option>
            <option>Salud</option>
            <option>Viaje</option>
            <option>Otros</option>
          </select>
        </div>
        <div className="mb-2">
          <label className="block font-medium">Observaciones</label>
          <textarea className="w-full border rounded px-2 py-1"></textarea>
        </div>
        <button
          type="submit"
          className="mt-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Generar Certificado
        </button>
      </form>
    </div>
  );
}
