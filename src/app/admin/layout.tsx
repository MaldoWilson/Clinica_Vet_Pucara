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

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      setLoading(false);
      return;
    }
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session) {
          const redirectUrl = `/admin/login?redirect=${encodeURIComponent(pathname)}`;
          router.push(redirectUrl);
          return;
        }
        const allowedEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
          .split(",")
          .map(s => s.trim().toLowerCase())
          .filter(Boolean);
        const userEmail = (session.user.email || "").toLowerCase();
        if (allowedEmails.length > 0 && !allowedEmails.includes(userEmail)) {
          router.push("/admin/login?error=no-autorizado");
          return;
        }
        setUser(session.user);
      } catch (error) {
        router.push("/admin/login");
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        router.push("/admin/login");
      } else if (session) {
        setUser(session.user);
      }
    });
    return () => subscription.unsubscribe();
  }, [router, pathname, supabase.auth, isLoginPage]);

  if (isLoginPage) return <>{children}</>;
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
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Panel de Administración</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user.email}</span>
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
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <a href="/admin" className={`py-4 px-1 border-b-2 font-medium text-sm ${pathname === "/admin" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}>Gestión</a>
            <a href="/admin/citas" className={`py-4 px-1 border-b-2 font-medium text-sm ${pathname === "/admin/citas" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}>Mascotas</a>
            <a href="/admin/contenido" className={`py-4 px-1 border-b-2 font-medium text-sm ${pathname === "/admin/contenido" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}>Contenido</a>
            <a href="/admin/formularios" className={`py-4 px-1 border-b-2 font-medium text-sm ${pathname === "/admin/formularios" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}>Formularios</a>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}


