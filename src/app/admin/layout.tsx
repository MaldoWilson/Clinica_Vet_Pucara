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
          <main className="p-4 sm:p-6 lg:p-8 pt-16 md:pt-8">
            {children}
          </main>
        </div>
      </div>
      {/* Botón flotante para abrir el sidebar en móvil */}
      <button
        aria-label="Abrir menú"
        className="md:hidden fixed left-4 top-4 z-40 rounded-xl border border-indigo-100 bg-white/95 backdrop-blur p-2.5 shadow-lg"
        onClick={() => setMobileOpen(true)}
      >
        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
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


