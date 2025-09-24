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
      const supa = createClientComponentClient();
      const { data, error } = await supa.auth.signInWithPassword({
        email: email.trim(),
        password: pass,
      });
      if (error) {
        alert(error.message);
        setLoading(false);
        return;
      }
      if (data.user) {
        setTimeout(() => {
          router.replace(redirect);
          router.refresh();
        }, 100);
      }
    } catch (err: any) {
      alert(err.message || "Error al ingresar");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Clínica Pucará</h1>
          <h2 className="text-xl font-semibold text-gray-700">Panel de Administración</h2>
        </div>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <h3 className="text-lg font-medium text-gray-900 mb-6 text-center">Iniciar Sesión</h3>
          {errorFlag && (
            <div className="mb-4 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
              Tu cuenta no está autorizada para acceder al panel de administración.
            </div>
          )}
          <form onSubmit={doLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Correo electrónico</label>
              <input
                id="email"
                type="email"
                placeholder="tu@email.com"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>
          <div className="mt-6 text-center">
            <a href="/" className="text-sm text-blue-600 hover:text-blue-500">← Volver al sitio principal</a>
          </div>
        </div>
      </div>
    </div>
  );
}


