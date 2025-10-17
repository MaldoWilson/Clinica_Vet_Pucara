import { PDFDocument } from "pdf-lib";

export type FillMap = Record<string, string>;

export async function fetchArrayBuffer(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`No se pudo descargar el PDF: ${res.status}`);
  return await res.arrayBuffer();
}

export async function fillPdfFormFromUrl(url: string, values: FillMap, alias?: Record<string, string>): Promise<Uint8Array> {
  const ab = await fetchArrayBuffer(url);
  const pdfDoc = await PDFDocument.load(ab);
  const form = pdfDoc.getForm();

  Object.entries(values).forEach(([key, value]) => {
    const fieldName = alias?.[key] ?? key;
    try {
      const field = form.getTextField(fieldName);
      field.setText(value ?? "");
    } catch {
      // Si no existe como TextField, ignorar silenciosamente para compatibilidad
    }
  });

  form.flatten(); // dejar texto fijo para impresión
  const bytes = await pdfDoc.save();
  return bytes;
}

export async function fillPdfFormFromBytes(bytes: ArrayBuffer | Uint8Array, values: FillMap, alias?: Record<string, string>): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(bytes);
  const form = pdfDoc.getForm();
  Object.entries(values).forEach(([key, value]) => {
    const fieldName = alias?.[key] ?? key;
    try {
      const field = form.getTextField(fieldName);
      field.setText(value ?? "");
    } catch {}
  });
  form.flatten();
  return await pdfDoc.save();
}


