import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Allow public access to the landing page and static assets
  if (
    pathname === "/" || 
    pathname.startsWith("/_next") || 
    pathname.startsWith("/static") || 
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Require authentication for everything else
  if (!token) {
    const loginUrl = new URL("https://learnxchain.com/login");
    loginUrl.searchParams.set("callbackUrl", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
