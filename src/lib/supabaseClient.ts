import { createClient } from "@supabase/supabase-js";

/** ⚠️ En el cliente, Next inyecta las env sólo si se referencian directamente */
const BROWSER_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const BROWSER_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

export const supabaseBrowser = () => {
  if (!BROWSER_URL || !BROWSER_ANON) {
    throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY. Revisa tu .env.local");
  }
  return createClient(BROWSER_URL, BROWSER_ANON);
};

/** En servidor sí podemos leer dinámicamente */
function requireEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Falta la variable de entorno ${name}. Revisa tu .env.local`);
  return v;
}

export const supabaseServer = () =>
  createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    // usa service role si existe; si no, cae a ANON (útil en dev)
    process.env.SUPABASE_SERVICE_ROLE_KEY || requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    { auth: { persistSession: false } }
  );

  export function supabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key, { auth: { persistSession: false } });
}