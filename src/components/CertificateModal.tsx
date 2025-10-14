"use client";

import { useEffect, useMemo, useState } from "react";
import { certificateTemplates, CertificateTemplate } from "@/lib/certificate-templates";
import { fillPdfFormFromBytes } from "@/lib/pdfFill";

type Veterinario = { id: string; nombre: string };

type PacienteCompact = {
  id: string;
  nombre: string;
  especie: boolean | null;
  raza?: string | null;
  sexo?: boolean | null;
  fecha_nacimiento?: string | null;
  propietario?: { 
    nombre?: string | null; 
    apellido?: string | null;
    direccion?: string | null;
    rut?: string | null;
    telefono?: string | null;
    correo_electronico?: string | null;
  } | null;
};

export default function CertificateModal({
  open,
  onClose,
  templateMeta,
  paciente,
  veterinarios,
}: {
  open: boolean;
  onClose: () => void;
  templateMeta: { id: number; nombre_archivo: string; url_archivo: string } | null;
  paciente: PacienteCompact;
  veterinarios: Veterinario[];
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualValues, setManualValues] = useState<Record<string, string>>({});
  const [veterinarioId, setVeterinarioId] = useState<string>("");
  const [showAutoFields, setShowAutoFields] = useState(true);
  const [showManualFields, setShowManualFields] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [examenesPrequirurgicos, setExamenesPrequirurgicos] = useState<"si" | "no" | "">("");

  const template: CertificateTemplate | null = useMemo(() => {
    if (!templateMeta) return null;
    // Por ahora, suponer que id del registro coincide con template id (p. ej. id=1)
    const key = String(templateMeta.id);
    return certificateTemplates[key] ?? null;
  }, [templateMeta]);

  useEffect(() => {
    if (!open) {
      setError(null);
      setManualValues({});
      setVeterinarioId("");
      setShowAutoFields(true);
      setShowManualFields(false);
      setExpandedGroups({});
      setExamenesPrequirurgicos("");
    }
  }, [open]);

  const autoContext = useMemo(() => ({
    paciente: {
      id: paciente.id,
      nombre: paciente.nombre,
      especie: paciente.especie,
      raza: paciente.raza,
      sexo: paciente.sexo,
      fecha_nacimiento: paciente.fecha_nacimiento,
    },
    propietario: paciente.propietario ?? null,
    veterinarios: veterinarios.map(v => ({ id: v.id, nombre: v.nombre })),
    now: new Date(),
  }), [paciente, veterinarios]);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const fillValues = useMemo(() => {
    if (!template) return {} as Record<string, string>;
    const base: Record<string, string> = {};
    
    // Procesar campos individuales
    for (const f of template.fields) {
      if (f.type === "auto") {
        base[f.key] = f.source(autoContext) || "";
      }
      if (f.type === "manual") {
        if (f.key === "Texbox4" && veterinarioId) {
          const v = veterinarios.find(x => String(x.id) === String(veterinarioId));
          base[f.key] = v?.nombre || "";
        } else if (f.key === "Texbox15" || f.key === "Texbox16") {
          // Manejar campos de exámenes prequirúrgicos
          if (f.key === "Texbox15") {
            base[f.key] = examenesPrequirurgicos === "si" ? "Sí" : "";
          } else if (f.key === "Texbox16") {
            base[f.key] = examenesPrequirurgicos === "no" ? "No" : "";
          }
        } else {
          base[f.key] = manualValues[f.key] || "";
        }
      }
    }
    
    // Procesar campos de grupos
    if (template.fieldGroups) {
      for (const group of template.fieldGroups) {
        for (const f of group.fields) {
          if (f.type === "auto") {
            base[f.key] = f.source(autoContext) || "";
          }
          if (f.type === "manual") {
            if (f.key === "Texbox4" && veterinarioId) {
              const v = veterinarios.find(x => String(x.id) === String(veterinarioId));
              base[f.key] = v?.nombre || "";
            } else if (f.key === "Texbox15" || f.key === "Texbox16") {
              // Manejar campos de exámenes prequirúrgicos
              if (f.key === "Texbox15") {
                base[f.key] = examenesPrequirurgicos === "si" ? "Sí" : "";
              } else if (f.key === "Texbox16") {
                base[f.key] = examenesPrequirurgicos === "no" ? "No" : "";
              }
            } else {
              base[f.key] = manualValues[f.key] || "";
            }
          }
        }
      }
    }
    
    return base;
  }, [template, autoContext, manualValues, veterinarioId, veterinarios, examenesPrequirurgicos]);

  async function handleDownload() {
    if (!template || !templateMeta) return;
    
    // Validar que se haya seleccionado un veterinario (excepto para certificados que no lo requieren)
    if (
      template.id !== 3 &&
      template.id !== 5 &&
      template.id !== 6 &&
      template.id !== 7 &&
      template.id !== 8 &&
      template.id !== 10 &&
      (!veterinarioId || veterinarioId.trim() === "")
    ) {
      alert("Debe elegir un veterinario antes de continuar.");
      return;
    }
    
    setLoading(true); setError(null);
    try {
      const res = await fetch(`/api/archivos-adjuntos/file?id=${encodeURIComponent(String(templateMeta.id))}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`No se pudo obtener el PDF (${res.status})`);
      const ab = await res.arrayBuffer();
      const bytes = await fillPdfFormFromBytes(ab, fillValues, template.acroFieldAlias);
      const copy = new Uint8Array(bytes);
      const blob = new Blob([copy], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${template.name.replace(/\s+/g, "_")}_${paciente.nombre}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      setError(e?.message || "Error generando PDF");
    } finally {
      setLoading(false);
    }
  }

  async function handleOpenPrint() {
    if (!template || !templateMeta) return;
    
    // Validar que se haya seleccionado un veterinario (excepto para certificados que no lo requieren)
    if (
      template.id !== 3 &&
      template.id !== 5 &&
      template.id !== 6 &&
      template.id !== 7 &&
      template.id !== 8 &&
      template.id !== 10 &&
      (!veterinarioId || veterinarioId.trim() === "")
    ) {
      alert("Debe elegir un veterinario antes de continuar.");
      return;
    }
    
    setLoading(true); setError(null);
    try {
      const res = await fetch(`/api/archivos-adjuntos/file?id=${encodeURIComponent(String(templateMeta.id))}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`No se pudo obtener el PDF (${res.status})`);
      const ab = await res.arrayBuffer();
      const bytes = await fillPdfFormFromBytes(ab, fillValues, template.acroFieldAlias);
      const copy = new Uint8Array(bytes);
      const blob = new Blob([copy], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      // No revocar inmediatamente porque el visor puede necesitar acceso
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (e: any) {
      setError(e?.message || "Error abriendo PDF");
    } finally {
      setLoading(false);
    }
  }

  if (!open || !template || !templateMeta) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-[95vw] max-w-2xl rounded-xl bg-white ring-1 ring-gray-200 shadow-xl overflow-hidden">
        <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
          <div className="text-sm font-semibold text-gray-700">{template.name} · {templateMeta.nombre_archivo}</div>
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-100" title="Cerrar">✕</button>
        </div>
        <div className="p-4 space-y-4">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 ring-1 ring-red-200 rounded p-2">{error}</div>
          )}
          
          {/* Botones de toggle */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => {
                setShowAutoFields(true);
                setShowManualFields(false);
              }}
              className={`px-4 py-2 rounded text-sm font-medium ${
                showAutoFields 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Datos Automáticos
            </button>
            <button
              onClick={() => {
                setShowAutoFields(false);
                setShowManualFields(true);
              }}
              className={`px-4 py-2 rounded text-sm font-medium ${
                showManualFields 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Campos a Llenar
            </button>
          </div>

          <div className="space-y-3">
            {/* Campos individuales */}
            {template.fields
              .filter((f) => {
                if (showAutoFields && f.type === "auto") return true;
                if (showManualFields && f.type === "manual") return true;
                return false;
              })
              .map((f) => (
              <div key={f.key} className="grid grid-cols-3 items-center gap-3">
                <label className="text-sm text-gray-700 col-span-1">{f.label}</label>
                {f.type === "manual" && f.key === "Texbox4" ? (
                  <select
                    className="col-span-2 rounded border-gray-300 text-sm"
                    value={veterinarioId}
                    onChange={(e) => setVeterinarioId(e.target.value)}
                  >
                    <option value="">Selecciona un veterinario</option>
                    {veterinarios.map(v => (
                      <option key={v.id} value={v.id}>{v.nombre}</option>
                    ))}
                  </select>
                ) : f.type === "manual" && f.key === "Texbox15" ? (
                  <div className="col-span-2">
                    <button
                      type="button"
                      onClick={() => setExamenesPrequirurgicos("si")}
                      className={`px-4 py-2 rounded text-sm font-medium flex items-center gap-2 ${
                        examenesPrequirurgicos === "si" 
                          ? 'bg-green-600 text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {examenesPrequirurgicos === "si" && "✗"}
                      Sí
                    </button>
                  </div>
                ) : f.type === "manual" && f.key === "Texbox16" ? (
                  <div className="col-span-2">
                    <button
                      type="button"
                      onClick={() => setExamenesPrequirurgicos("no")}
                      className={`px-4 py-2 rounded text-sm font-medium flex items-center gap-2 ${
                        examenesPrequirurgicos === "no" 
                          ? 'bg-red-600 text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {examenesPrequirurgicos === "no" && "✗"}
                      No
                    </button>
                  </div>
                ) : f.type === "manual" ? (
                  f.key === "Texbox11" && template?.id === 6 ? (
                    <textarea
                      className="col-span-2 rounded border-gray-300 text-sm min-h-[150px] resize-y"
                      placeholder={f.placeholder || ""}
                      value={manualValues[f.key] || ""}
                      onChange={(e) => setManualValues((m) => ({ ...m, [f.key]: e.target.value }))}
                      rows={6}
                    />
                  ) : (
                    <input
                      className="col-span-2 rounded border-gray-300 text-sm"
                      placeholder={f.placeholder || ""}
                      value={manualValues[f.key] || ""}
                      onChange={(e) => setManualValues((m) => ({ ...m, [f.key]: e.target.value }))}
                    />
                  )
                ) : (
                  <input
                    className="col-span-2 rounded border-gray-200 bg-gray-50 text-sm"
                    value={fillValues[f.key] || ""}
                    readOnly
                  />
                )}
              </div>
            ))}

            {/* Grupos de campos */}
            {template.fieldGroups && showManualFields && template.fieldGroups.map((group) => (
              <div key={group.id} className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleGroup(group.id)}
                  className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 rounded-t-lg flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium text-gray-900">{group.name}</div>
                    {group.description && (
                      <div className="text-sm text-gray-600">{group.description}</div>
                    )}
                  </div>
                  <div className="text-gray-500">
                    {expandedGroups[group.id] ? '▼' : '▶'}
                  </div>
                </button>
                
                {expandedGroups[group.id] && (
                  <div className="p-4 space-y-3 bg-white">
                    {group.fields.map((f) => (
                      <div key={f.key} className="grid grid-cols-3 items-center gap-3">
                        <label className="text-sm text-gray-700 col-span-1">{f.label}</label>
                        {f.type === "manual" && f.key === "Texbox4" ? (
                          <select
                            className="col-span-2 rounded border-gray-300 text-sm"
                            value={veterinarioId}
                            onChange={(e) => setVeterinarioId(e.target.value)}
                          >
                            <option value="">Selecciona un veterinario</option>
                            {veterinarios.map(v => (
                              <option key={v.id} value={v.id}>{v.nombre}</option>
                            ))}
                          </select>
                        ) : f.type === "manual" && f.key === "Texbox15" ? (
                          <div className="col-span-2">
                            <button
                              type="button"
                              onClick={() => setExamenesPrequirurgicos("si")}
                              className={`px-4 py-2 rounded text-sm font-medium flex items-center gap-2 ${
                                examenesPrequirurgicos === "si" 
                                  ? 'bg-green-600 text-white' 
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              {examenesPrequirurgicos === "si" && "✗"}
                              Sí
                            </button>
                          </div>
                        ) : f.type === "manual" && f.key === "Texbox16" ? (
                          <div className="col-span-2">
                            <button
                              type="button"
                              onClick={() => setExamenesPrequirurgicos("no")}
                              className={`px-4 py-2 rounded text-sm font-medium flex items-center gap-2 ${
                                examenesPrequirurgicos === "no" 
                                  ? 'bg-red-600 text-white' 
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              {examenesPrequirurgicos === "no" && "✗"}
                              No
                            </button>
                          </div>
                        ) : f.type === "manual" ? (
                          f.key === "Texbox11" && template?.id === 6 ? (
                            <textarea
                              className="col-span-2 rounded border-gray-300 text-sm min-h-[150px] resize-y"
                              placeholder={f.placeholder || ""}
                              value={manualValues[f.key] || ""}
                              onChange={(e) => setManualValues((m) => ({ ...m, [f.key]: e.target.value }))}
                              rows={6}
                            />
                          ) : (
                            <input
                              className="col-span-2 rounded border-gray-300 text-sm"
                              placeholder={f.placeholder || ""}
                              value={manualValues[f.key] || ""}
                              onChange={(e) => setManualValues((m) => ({ ...m, [f.key]: e.target.value }))}
                            />
                          )
                        ) : (
                          <input
                            className="col-span-2 rounded border-gray-200 bg-gray-50 text-sm"
                            value={fillValues[f.key] || ""}
                            readOnly
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="px-4 py-3 border-t bg-gray-50 flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded border text-sm">Cancelar</button>
          <button disabled={loading} onClick={handleOpenPrint} className="px-4 py-2 rounded bg-indigo-600 text-white text-sm disabled:opacity-60">Abrir para imprimir</button>
          <button disabled={loading} onClick={handleDownload} className="px-4 py-2 rounded bg-green-600 text-white text-sm disabled:opacity-60">Rellenar y descargar</button>
        </div>
      </div>
    </div>
  );
}


