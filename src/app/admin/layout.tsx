"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { User } from "@supabase/supabase-js";
import dynamic from "next/dynamic";
const AdminSidebar = dynamic(() => import("@/components/AdminSidebar"), { ssr: false });

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClientComponentClient();
  const [mobileOpen, setMobileOpen] = useState(false);

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

  // Cerrar el drawer móvil al cambiar la ruta
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

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
      <div className="flex min-h-screen">
        {/* Sidebar - solo escritorio */}
        <div className="hidden md:block">
          <AdminSidebar />
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70 border-b">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                  <button
                    aria-label="Abrir menú"
                    className="p-2 mr-2 rounded hover:bg-gray-100 md:hidden"
                    onClick={() => setMobileOpen(true)}
                  >

                  </button>
                  <div className="flex items-center gap-3">

                    <h1 className="text-lg md:text-xl font-semibold text-gray-900">Panel de Administración</h1>
                  </div>
                </div>
                <div className="hidden md:flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">Admin</span>
                </div>
              </div>
            </div>
          </header>
          <main className="p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
      {/* Drawer móvil */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-64 max-w-[85vw] bg-white shadow-xl">
            <div className="h-full overflow-y-auto">
              <AdminSidebar />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


