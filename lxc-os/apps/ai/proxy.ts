import { NextResponse, NextRequest } from "next/server";

export default async function proxy(req: NextRequest) {
  // Allow all requests to pass through to the pages.
  // Authentication is handled client-side via the custom JWT AuthProvider (stored in localStorage),
  // and API access is securely validated by Bearer token injection and local 401/403 redirect interceptors.
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
};
