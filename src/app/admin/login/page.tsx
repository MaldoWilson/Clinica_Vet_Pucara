"use client";
import Image from "next/image";
import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

function LoginContent() {
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
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Barra superior */}
      <div className="w-full h-20 bg-gradient-to-r from-indigo-400 to-indigo-600 shadow-md" />

      {/* Contenido centrado */}
      <div className="flex flex-1 flex-col items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Image
              src="/logo.webp"
              alt="Logo"
              width={140}
              height={140}
              className="object-contain drop-shadow-lg"
              priority
              quality={100}
            />
          </div>
          {/* Título */}
          <h1 className="text-2xl font-bold text-center mb-2 text-gray-800">
            Iniciar Sesión
          </h1>
          {/* Formulario */}
          <form onSubmit={doLogin} className="space-y-4">
            <input
              type="email"
              name="email"
              placeholder="Correo electrónico"
              className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              name="password"
              placeholder="Contraseña"
              className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
              autoComplete="current-password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
            />
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="accent-indigo-400" />
                Recordarme en este dispositivo
              </label>
              <Link
                href="/recuperar"
                className="text-indigo-400 hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-lg font-semibold text-white bg-indigo-500 hover:bg-indigo-600 transition-colors duration-300"
              disabled={loading}
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>
          {/* Volver a la página principal */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm text-indigo-400 hover:underline"
            >
              ← Volver a la página principal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando…</div>}>
      <LoginContent />
    </Suspense>
  );
}


