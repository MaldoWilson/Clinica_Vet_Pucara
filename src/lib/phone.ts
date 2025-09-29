/** Utilidades para teléfonos internacionales simples: +CC NNNNNNNNN */

export function cleanPhoneInput(input: string): string {
  return (input || "").replace(/[^+0-9]/g, "");
}

/**
 * Formatea como "+CC NNNNNNNNN" (dos dígitos de país y hasta 9 locales).
 * No valida; sólo acomoda y limita longitud.
 */
export function formatIntlPhone(input: string): string {
  const cleaned = cleanPhoneInput(input);
  let s = cleaned.startsWith("+") ? cleaned.slice(1) : cleaned;
  const cc = s.slice(0, 2).replace(/[^0-9]/g, "");
  const local = s.slice(2).replace(/[^0-9]/g, "").slice(0, 9);
  let out = "+" + cc;
  if (cc.length === 2) out += (local.length ? " " : "");
  out += local;
  return out;
}

/** Valida estrictamente el patrón +CC y 9 dígitos locales */
export function isValidIntlPhone(input: string): boolean {
  return /^\+\d{2}\s?\d{9}$/.test((input || "").trim());
}


