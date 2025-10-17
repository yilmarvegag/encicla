// apps/web-admin/src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = [
  /^\/auth(\/.*)?$/,
  /^\/no-access$/,
  /^\/_next\//,
  /^\/favicon\.ico$/,
  /^\/assets\//,
];

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = req.cookies.get("encicla_token")?.value ?? null;
  const expStr = req.cookies.get("encicla_exp")?.value ?? null;
  const expMs = expStr ? new Date(expStr).getTime() : NaN;
  const expired = !expStr || isNaN(expMs) || Date.now() > expMs - 30_000;
  const loggedIn = Boolean(token) && !expired;

  // Si intenta ir al login estando autenticado → sácalo
  if (/^\/auth(\/login)?$/.test(pathname) && loggedIn) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (PUBLIC_PATHS.some((re) => re.test(pathname))) return NextResponse.next();

  const rolesCsv = req.cookies.get("encicla_roles")?.value ?? "";
    // si no está autenticado lo saca
  if (!token || expired) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/login";
    url.search = `redirect=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }

  // roles
  const norm = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "");
  const roles = rolesCsv.split(",").filter(Boolean).map(norm);

  const isAdmin = roles.includes("administrador");
  const isMonitor = roles.includes("monitor");
  const isAnfitrion = roles.includes("anfitrion"); // ← sin tilde
  const isUsuario = roles.includes("usuario");

  // usuario no puede entrar al admin
  if (isUsuario || (!isAdmin && !isMonitor && !isAnfitrion)) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/login";
    url.search = `redirect=${encodeURIComponent("/no-access")}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api).*)"],
};
