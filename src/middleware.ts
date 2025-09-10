import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supa = createMiddlewareClient({ req, res });

  const path = req.nextUrl.pathname;
  const isAdminRoute = path.startsWith("/admin");
  const isLogin = path === "/admin/login";

  // No proteger la página de login
  if (!isAdminRoute || isLogin) return res;

  // Proteger todo lo demás bajo /admin/*
  const { data: { session } } = await supa.auth.getSession();
  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("redirect", req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(url);
  }

  // Verificar emails autorizados usando la variable de entorno correcta
  const allowed = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
    .split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
  const email = (session.user.email || "").toLowerCase();

  if (allowed.length && !allowed.includes(email)) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("error", "no-autorizado");
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: ["/admin/:path*"], // sigue protegiendo todo /admin/*
};
