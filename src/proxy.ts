import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  // In Next.js 16, proxy should be lightweight and NOT handle auth logic
  // Auth logic is handled by the protected layout server component
  // This avoids redirect loops between proxy and layout

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
