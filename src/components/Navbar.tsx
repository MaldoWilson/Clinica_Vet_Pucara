// Componente de navbar
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseClient";
import Image from "next/image";

export default function Navbar() {
  const pathname = usePathname();
async function logout() {
  await supabaseBrowser().auth.signOut();
  window.location.href = "/admin/login";
}
  return (
    <header className="border-b bg-white/70 backdrop-blur sticky top-0 z-50">
      <nav className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Image
            src="/logo.png" 
            alt="Clínica Pucará"
            width={60}
            height={60}
            priority
          />
          <span className="hidden sm:inline">Clínica Pucará</span>
        </Link>
        <div className="flex gap-4 text-sm items-center">
          <Link href="/servicios">Servicios</Link>
          <Link href="/equipo">Equipo</Link>
          <Link href="/reservas">Reservas</Link>
          <Link href="/contacto">Contacto</Link>
          {pathname.startsWith("/admin") ? (
            <>
              <Link href="/admin/citas" className="font-medium">Admin</Link>
              <button onClick={logout} className="border rounded-lg px-3 py-1">Salir</button>
            </>
          ) : null}
        </div>
      </nav>
    </header>
  );
}
