// Componente de navbar
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseClient";
import { useState, useEffect } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Detectar scroll para cambiar el estilo del navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  async function logout() {
    await supabaseBrowser().auth.signOut();
    window.location.href = "/admin/login"; 
  }

  const navLinks = [
    { href: "/", label: "Inicio" },
    { href: "/equipo", label: "Quienes somos" },
    { href: "/servicios", label: "Servicios" },
    { href: "/reservas", label: "Reservas" },
    { href: "/productos", label: "Productos en tienda" },
    { href: "/blog", label: "Blogs" },
    
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Backdrop overlay for mobile menu */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
      
      <header className="fixed top-0 left-0 right-0 z-50">
        <nav className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between bg-white rounded-full px-6 py-3 shadow-lg">
          {/* Mobile menu button and title (visible on mobile, hidden on desktop) */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-full text-gray-600 hover:text-teal-600 hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              <svg
                className={`w-6 h-6 transition-transform duration-200 ${isMenuOpen ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
            <span className="ml-3 text-lg font-semibold text-gray-800">Veterinaria Pucará</span>
          </div>

          {/* Desktop Navigation (hidden on mobile, visible and centered on desktop) */}
          <div className="hidden md:flex flex-grow justify-center items-center space-x-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  isActive(link.href)
                    ? 'text-indigo-600 bg-indigo-100'
                    : 'text-gray-700 hover:text-indigo-500 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
            
            {pathname.startsWith("/admin") && (
              <div className="flex items-center gap-2 ml-4 pl-4 border-l border-gray-200">
                <Link 
                  href="/admin/citas" 
                  className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Admin
                </Link>
                <button 
                  onClick={logout} 
                  className="px-3 py-1.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all"
                >
                  Salir
                </button>
              </div>
            )}
          </div>
          {/* This empty div balances the justify-between on desktop, pushing the centered nav to the middle */}
          <div className="hidden md:flex w-[48px]"></div>
        </div>

        {/* Mobile Navigation */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${
          isMenuOpen 
            ? 'max-h-screen opacity-100 pb-4' 
            : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <div className="pt-4 pb-3 space-y-1">
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">

              {/* Navigation links */}
              <div className="space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                      isActive(link.href)
                        ? 'text-indigo-600 bg-indigo-50 border border-indigo-200'
                        : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            
            {pathname.startsWith("/admin") && (
              <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Administración
                </h3>
                <div className="space-y-1">
                  <Link
                    href="/admin/citas"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-4 py-3 text-base font-medium text-blue-600 bg-blue-50 rounded-xl border border-blue-200"
                  >
                    Panel Admin
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-3 text-base font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
    </>
  );
}
