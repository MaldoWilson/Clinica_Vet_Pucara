"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect") || "/admin/citas";
  const errorFlag = params.get("error") === "no-autorizado";

  const doLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supa = createClientComponentClient(); // 👈 helpers (no tu cliente personalizado)
      const { error } = await supa.auth.signInWithPassword({ email, password: pass });
      if (error) {
        alert(error.message);
        setLoading(false);
        return;
      }

      // cookies ya se escribieron; refresca y redirige
      router.replace(redirect);
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Error al ingresar");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl md:text-3xl font-semibold mb-6">Ingreso administrador</h1>
      {errorFlag && (
        <div className="mb-4 text-sm text-red-600">
          Tu cuenta no está autorizada para el panel.
        </div>
      )}
      <form onSubmit={doLogin} className="space-y-3">
        <input type="email" placeholder="Correo" className="w-full border rounded-xl p-3"
               value={email} onChange={(e)=>setEmail(e.target.value)} required />
        <input type="password" placeholder="Contraseña" className="w-full border rounded-xl p-3"
               value={pass} onChange={(e)=>setPass(e.target.value)} required />
        <button disabled={loading} className="px-5 py-2.5 rounded-xl bg-blue-600 text-white">
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
}
