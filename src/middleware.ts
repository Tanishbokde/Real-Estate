import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decodeSession, SESSION_COOKIE_NAME } from "@/lib/auth/session";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = sessionCookie ? decodeSession(sessionCookie) : null;

  // Protect Admin dashboard & routes
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (!session || session.role !== "admin") {
      const url = new URL("/login/admin", request.url);
      url.searchParams.set("redirect", pathname);
      const res = NextResponse.redirect(url);
      res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
      res.headers.set("Pragma", "no-cache");
      res.headers.set("Expires", "0");
      return res;
    }
  }

  // Protect Admin-only API routes
  if (pathname.startsWith("/api/supabase/config")) {
    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Admin authentication required" },
        { status: 401 }
      );
    }
  }

  // Protect Agent route
  if (pathname === "/agent" || pathname.startsWith("/agent/")) {
    if (!session || session.role !== "agent") {
      const url = new URL("/login/agent", request.url);
      url.searchParams.set("redirect", pathname);
      const res = NextResponse.redirect(url);
      res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
      res.headers.set("Pragma", "no-cache");
      res.headers.set("Expires", "0");
      return res;
    }
  }

  // Protect Customer route
  if (pathname === "/customer" || pathname.startsWith("/customer/")) {
    if (!session || session.role !== "customer") {
      const url = new URL("/login/customer", request.url);
      url.searchParams.set("redirect", pathname);
      const res = NextResponse.redirect(url);
      res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
      res.headers.set("Pragma", "no-cache");
      res.headers.set("Expires", "0");
      return res;
    }
  }

  // If already authenticated and visiting the corresponding login page, redirect directly to dashboard
  if (pathname === "/login/admin" && session?.role === "admin") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }
  if (pathname === "/login/agent" && session?.role === "agent") {
    return NextResponse.redirect(new URL("/agent", request.url));
  }
  if (pathname === "/login/customer" && session?.role === "customer") {
    return NextResponse.redirect(new URL("/customer", request.url));
  }

  const response = NextResponse.next();
  // Prevent browser caching on authenticated dashboards
  if (
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/agent" ||
    pathname.startsWith("/agent/") ||
    pathname === "/customer" ||
    pathname.startsWith("/customer/")
  ) {
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
  }

  return response;
}

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/agent",
    "/agent/:path*",
    "/customer",
    "/customer/:path*",
    "/login/admin",
    "/login/agent",
    "/login/customer",
    "/api/supabase/config"
  ]
};
