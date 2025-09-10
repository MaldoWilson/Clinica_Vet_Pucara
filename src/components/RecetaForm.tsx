// src/components/RecetaForm.tsx
"use client";

export default function RecetaForm() {
  return (
    <div className="p-4 border rounded-md bg-white shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Crear Receta Médica</h2>
      <form>
        <div className="mb-2">
          <label className="block font-medium">Nombre del medicamento</label>
          <input type="text" className="w-full border rounded px-2 py-1" />
        </div>
        <div className="mb-2">
          <label className="block font-medium">Dosis</label>
          <input type="text" className="w-full border rounded px-2 py-1" />
        </div>
        <div className="mb-2">
          <label className="block font-medium">Indicaciones</label>
          <textarea className="w-full border rounded px-2 py-1"></textarea>
        </div>
        <button
          type="submit"
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Guardar Receta
        </button>
      </form>
    </div>
  );
}
