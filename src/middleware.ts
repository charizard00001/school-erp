import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-dev-secret");

const publicPaths = ["/login", "/api/auth/login"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths and static files
  if (
    publicPaths.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("session")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    const role = (payload.role as string).toLowerCase();

    // Role-based route protection
    if (pathname.startsWith("/admin") && payload.role !== "ADMIN") {
      return NextResponse.redirect(new URL(`/${role}`, request.url));
    }
    if (pathname.startsWith("/teacher") && payload.role !== "TEACHER") {
      return NextResponse.redirect(new URL(`/${role}`, request.url));
    }
    if (pathname.startsWith("/student") && payload.role !== "STUDENT") {
      return NextResponse.redirect(new URL(`/${role}`, request.url));
    }

    // Redirect root to role dashboard
    if (pathname === "/") {
      return NextResponse.redirect(new URL(`/${role}`, request.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
