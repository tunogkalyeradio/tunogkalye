import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Routes that require authentication
const protectedRoutes = ["/admin", "/artist", "/dashboard"];

// Routes that require specific roles
const roleRoutes: Record<string, string[]> = {
  "/admin": ["ADMIN"],
  "/artist": ["ARTIST"],
  "/dashboard": ["CUSTOMER", "ARTIST", "ADMIN"],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the path starts with a protected route
  const matchedRoute = protectedRoutes.find(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (!matchedRoute) {
    return NextResponse.next();
  }

  // Get JWT token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Not authenticated — redirect to login
  if (!token) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check role-based access
  const requiredRoles = roleRoutes[matchedRoute] || [];
  const userRole = (token.role as string) || "";

  if (requiredRoles.length > 0 && !requiredRoles.includes(userRole)) {
    // Wrong role — redirect to appropriate dashboard or home
    const redirectPath =
      userRole === "ADMIN"
        ? "/admin"
        : userRole === "ARTIST"
          ? "/artist"
          : "/dashboard";

    const redirectUrl = new URL(redirectPath, request.url);
    redirectUrl.searchParams.set(
      "error",
      "You do not have permission to access this page"
    );
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/artist/:path*", "/dashboard/:path*"],
};
