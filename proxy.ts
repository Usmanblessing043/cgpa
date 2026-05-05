import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";


const JWT_SECRET = process.env.JWT_SECRET!;


const roleRoutes: Record<string, string> = {
  "/admin": "admin",
  "/vendor": "vendor",
  "/customer": "customer",
  "/rider": "rider",
};

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const cookie = req.cookies.get("auth_token");
  const token = cookie?.value;

  const matchedRoute = Object.keys(roleRoutes).find((route) =>
    pathname.startsWith(route)
  );

  if (!token && matchedRoute) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  if (token && matchedRoute) {
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      const requiredRole = roleRoutes[matchedRoute];

      if (decoded.role !== requiredRole) {
        const loginUrl = new URL("/login", req.url);
        return NextResponse.redirect(loginUrl);
      }
    } catch (err) {
      const loginUrl = new URL("/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/vendor/:path*", "/customer/:path*", "/rider/:path*"],
};