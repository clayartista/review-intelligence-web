import { NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  // 1. Logger
  if (pathname.startsWith("/api")) {
    console.log(`[${new Date().toISOString()}] ${request.method} ${pathname}`);
  }

  // 2. Maintenance mode
  if (process.env.MAINTENANCE_MODE === "true" && pathname !== "/maintenance") {
    return NextResponse.redirect(new URL("/maintenance", request.url));
  }

  // 3. Refresh sesi Supabase + auth guard
  const { response, user } = await updateSession(request);

  const protectedPaths = ["/favorites"];

  if (!user && protectedPaths.includes(pathname)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response; // wajib return response ini supaya cookie sesi ikut terkirim
}

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
};
