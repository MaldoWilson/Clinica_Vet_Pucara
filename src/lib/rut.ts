/** Utilidades para formatear y normalizar RUT chileno */

/** Mantiene solo dígitos y K, en mayúscula */
export function cleanRutInput(input: string): string {
  return (input || "").replace(/[^0-9kK]/g, "").toUpperCase();
}

/**
 * Normaliza a forma simple sin puntos y con guión antes del dígito verificador: 12345678-K
 */
export function normalizeRutPlain(input: string): string {
  const cleaned = cleanRutInput(input);
  if (cleaned.length <= 1) return cleaned;
  return `${cleaned.slice(0, -1)}-${cleaned.slice(-1)}`;
}

/**
 * Formatea bonito con puntos y guión: 12.345.678-K
 */
export function formatRutPretty(input: string): string {
  const plain = normalizeRutPlain(input);
  if (!plain.includes("-")) return plain;
  const [num, dv] = plain.split("-");
  const withDots = num.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${withDots}-${dv}`;
}

/** Elimina puntos y guión dejando solo dígitos y K */
export function stripRutPunctuation(input: string): string {
  return cleanRutInput(input).replace(/-/g, "");
}

/** Calcula el dígito verificador esperado para un RUT (parte numérica) */
export function computeRutDV(numericPart: string): string {
  const digits = String(numericPart || "").replace(/[^0-9]/g, "");
  if (!digits) return "";
  let sum = 0;
  let factor = 2;
  for (let i = digits.length - 1; i >= 0; i--) {
    sum += parseInt(digits[i], 10) * factor;
    factor = factor === 7 ? 2 : factor + 1;
  }
  const rest = 11 - (sum % 11);
  if (rest === 11) return "0";
  if (rest === 10) return "K";
  return String(rest);
}

/** Valida el RUT comparando el dígito verificador */
export function isValidRut(input: string): boolean {
  const cleaned = cleanRutInput(input);
  if (cleaned.length < 2) return false;
  const dvInput = cleaned.slice(-1).toUpperCase();
  const body = cleaned.slice(0, -1);
  const expected = computeRutDV(body);
  return expected !== "" && dvInput === expected;
}


