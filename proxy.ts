import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  const isLoginPage = pathname === "/admin/login";
  const isAdminRoot = pathname === "/admin" || pathname === "/admin/";
  const isAdminApi = pathname.startsWith("/api/admin") || pathname.startsWith("/api/uploads");
  const isAdminPage = pathname.startsWith("/admin") && !isLoginPage;

  if (token && (isLoginPage || isAdminRoot)) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  if (!token) {
    if (isAdminApi) {
      return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });
    }
    if (isAdminPage) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/api/uploads/:path*"],
};
