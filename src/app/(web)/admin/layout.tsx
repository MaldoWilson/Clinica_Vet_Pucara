"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { User } from "@supabase/supabase-js";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClientComponentClient();

  // Si estamos en la página de login, no aplicar autenticación
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    // Si es la página de login, no hacer nada
    if (isLoginPage) {
      setLoading(false);
      return;
    }
    const checkAuth = async () => {
      try {
        console.log("Verificando autenticación en:", pathname);
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error obteniendo sesión:", error);
          router.push("/admin/login");
          return;
        }
        
        if (!session) {
          console.log("No hay sesión, redirigiendo al login");
          const redirectUrl = `/admin/login?redirect=${encodeURIComponent(pathname)}`;
          router.push(redirectUrl);
          return;
        }

        console.log("Sesión encontrada para:", session.user.email);

        // Verificar si el email está autorizado
        const allowedEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
          .split(",")
          .map(s => s.trim().toLowerCase())
          .filter(Boolean);
        
        const userEmail = (session.user.email || "").toLowerCase();
        
        if (allowedEmails.length > 0 && !allowedEmails.includes(userEmail)) {
          console.log("Email no autorizado:", userEmail);
          router.push("/admin/login?error=no-autorizado");
          return;
        }

        console.log("Usuario autorizado, estableciendo usuario");
        setUser(session.user);
      } catch (error) {
        console.error("Error checking auth:", error);
        router.push("/admin/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_OUT" || !session) {
          router.push("/admin/login");
        } else if (session) {
          setUser(session.user);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router, pathname, supabase.auth, isLoginPage]);

  // Si es la página de login, solo mostrar el contenido
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario, no renderizar nada (ya se redirigió)
  if (!user) {
    return null;
  }

  // Layout para admin autenticado
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header del admin */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Panel de Administración
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user.email}
              </span>
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.push("/admin/login");
                }}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navegación del admin */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <a
              href="/admin"
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                pathname === "/admin"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Inicio
            </a>
            <a
              href="/admin/citas"
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                pathname === "/admin/citas"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Citas
            </a>
          </div>
        </div>
      </nav>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
