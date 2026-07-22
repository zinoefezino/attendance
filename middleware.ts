import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const adminToken = req.cookies.get("admin_token")?.value;
  const { pathname } = req.nextUrl;

  // Protect all /admin routes except the login page itself
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (adminToken !== "authenticated") {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  // Redirect away from login if already authenticated
  if (pathname === "/admin/login" && adminToken === "authenticated") {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
