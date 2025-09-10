"use client";
import { useState } from "react";

export default function ImagenVeterinarioAdmin({ params }: { params: { id: string } }) {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file) return setMsg("Selecciona una imagen");

    const fd = new FormData();
    fd.append("veterinarioId", params.id);
    fd.append("file", file);

    try {
      setBusy(true);
      setMsg("Subiendo...");
      const res = await fetch("/api/veterinarios/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error");
      setMsg("✅ Foto actualizada");
    } catch (err: any) {
      setMsg(`❌ ${err.message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-lg space-y-4">
      <h1 className="text-xl font-semibold">Foto del Veterinario</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          disabled={busy}
          className="block w-full"
        />
        <button
          disabled={busy || !file}
          className="px-4 py-2 rounded-2xl shadow bg-black text-white disabled:opacity-60"
        >
          {busy ? "Subiendo…" : "Subir / Reemplazar"}
        </button>
      </form>
      {msg && <p className="text-sm text-neutral-600">{msg}</p>}
      <p className="text-xs text-neutral-500">≤ 4MB — JPG/PNG/WEBP.</p>
    </div>
  );
}
