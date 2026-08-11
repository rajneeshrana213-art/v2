import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const ALLOWED_ORIGINS = [
  "https://learnxchain.com",
  "https://chat.learnxchain.com",
  "http://localhost:3000",
  "http://localhost:5000",
  "http://127.0.0.1:5000",
];


// Roles definition (KEEP THIS)
const ROLES = {
  superadmin: "superadmin",
  admin: "admin",
  teacher: "teacher",
  student: "student",
  parent: "parent",
  library: "library",
  hostel: "hostel",
  transport: "transport",
  account: "account",
  staff: "staff",
  employee: "employee",
  driver: "driver",
  academics: "academics",
  group_admin: "group_admin",
  forum_user: "forum_user",
};

// ... (KEEP DASHBOARD_PATHS and ROLE_PROTECTED_PATHS)
const isDev = process.env.NODE_ENV === "development" || !process.env.NEXTAUTH_URL?.startsWith("https://");
const aiBaseUrl = isDev ? "http://localhost:5000" : "https://chat.learnxchain.com";

// Dashboard landing paths for each role
const DASHBOARD_PATHS: Record<string, string> = {
  [ROLES.superadmin]: "/dashboard/superadmin",
  [ROLES.admin]: "/dashboard/admin",
  [ROLES.teacher]: "/dashboard/teacher",
  [ROLES.student]: "/dashboard/student",
  [ROLES.parent]: "/dashboard/parent",
  [ROLES.library]: "/dashboard/library",
  [ROLES.hostel]: "/dashboard/hostel",
  [ROLES.transport]: "/dashboard/transport",
  [ROLES.account]: "/dashboard/account",
  [ROLES.staff]: "/dashboard/staff",
  [ROLES.employee]: "/dashboard/employee",
  [ROLES.driver]: "/dashboard/driver",
  [ROLES.academics]: "/dashboard/academics",
  [ROLES.group_admin]: "/dashboard/group-admin",
  [ROLES.forum_user]: `${aiBaseUrl}/lxc`,
};

// Protected path prefixes for each role
const ROLE_PROTECTED_PATHS: Record<string, string[]> = {
  [ROLES.superadmin]: ["/dashboard/superadmin"],
  [ROLES.admin]: ["/dashboard/admin"],
  [ROLES.teacher]: ["/dashboard/teacher", "/dashboard/teacher-timetable"],
  [ROLES.student]: ["/dashboard/student"],
  [ROLES.parent]: ["/dashboard/parent"],
  [ROLES.library]: ["/dashboard/library"],
  [ROLES.hostel]: ["/dashboard/hostel"],
  [ROLES.transport]: ["/dashboard/transport"],
  [ROLES.account]: ["/dashboard/account"],
  [ROLES.staff]: ["/dashboard/staff"],
  [ROLES.employee]: ["/dashboard/employee"],
  [ROLES.driver]: ["/dashboard/driver"],
  [ROLES.academics]: ["/dashboard/academics"],
  [ROLES.group_admin]: ["/dashboard/group-admin"],
  [ROLES.forum_user]: ["/dashboard/forum"],
};

// Public paths that do not require authentication
const PUBLIC_PATHS = new Set([
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/public",
  "/",
  "/create-superadmin",
  "/product",
  "/solutions",
  "/ai",
  "/about",
  "/resources",
  "/contact",
  "/book-demo",
  "/privacy",
  "/terms",
  "/cookies",
  "/services",
  "/projects",
  "/careers",
]);

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get("host");

  // 0. Subdomain Specific Routing
  // learnxchain.com -> Force login page as default instead of landing page
  if (hostname?.includes("sms") && pathname === "/") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 1. EXCLUSIONS & CORS for API Routes
  if (pathname.startsWith("/api")) {
    const origin = request.headers.get("origin") || "";
    
    // Check if origin is allowed (explicit match, ends with .learnxchain.com, or localhost)
    const isAllowed = 
      origin && 
      (ALLOWED_ORIGINS.includes(origin) || 
       origin.endsWith(".learnxchain.com") || 
       origin.startsWith("http://localhost:") ||
       origin.startsWith("http://127.0.0.1:"));

    if (isAllowed) {
      const headers = {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Methods": "GET,OPTIONS,PATCH,DELETE,POST,PUT",
        "Access-Control-Allow-Headers":
          "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization",
      };

      // Handle preflight OPTIONS request
      if (request.method === "OPTIONS") {
        return new NextResponse(null, {
          status: 200,
          headers: headers,
        });
      }

      // Handle actual API requests
      const response = NextResponse.next();
      Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      return response;
    }
    
    return NextResponse.next();
  }

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 2. TOKEN VERIFICATION using NextAuth getToken
  const token = await getToken({
    req: request,
    secret: NEXTAUTH_SECRET,
  });

  // If trying to access a protected route without a token
  if (!token) {
    if (
      PUBLIC_PATHS.has(pathname) ||
      pathname.startsWith("/resources/") ||
      pathname.startsWith("/register") ||
      pathname.startsWith("/public") ||
      pathname.startsWith("/careers/")
    ) {
      return NextResponse.next();
    }
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  const userRole = token.role as string;

  if (!userRole) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 3. AUTO-NAVIGATION (Root Redirect)
  // If authenticated user visits root, WE ALLOW THEM to stay on landing page (per user request).
  // They will see a "Dashboard" button in the navbar instead.

  // If authenticated user visits Login page, send them to dashboard
  if (pathname === "/login") {
    const dashboard = DASHBOARD_PATHS[userRole] || "/";
    return NextResponse.redirect(new URL(dashboard, request.url));
  }

  // 4. ROLE GUARD (RBAC)
  // Check if the current path falls under ANY protected role prefix
  let isProtectedScope = false;
  let requiredScope: string | null = null;

  for (const [role, prefixes] of Object.entries(ROLE_PROTECTED_PATHS)) {
    if (prefixes.some((prefix) => pathname.startsWith(prefix))) {
      isProtectedScope = true;
      // Logic: Is this scope meant for the *current* user's role?
      // We only care if the current User DOES NOT match the role defined for this path.
      if (role !== userRole && userRole !== ROLES.superadmin) {
        // Exception: Superadmin can access everything?
        // If strict checks are needed, remove the superadmin check above.
        // Here we imply superadmin bypasses checks.

        // If strict mismatch found:
        // e.g. user=student, path starts with /teacher
        // We need to verify if this specific path is perhaps shared?
        // Assuming strict separation based on ROLES definitions.

        // BUT: We need to be careful. If I iterate and find '/teacher' matches path,
        // but user is student, I shouldn't just error out immediately if there are *overlapping* prefixes?
        // In this app, prefixes seem distinct (/teacher vs /student).

        // If we found a match for a role that IS NOT the user's role, we flag it.
        // But valid case: user=teacher, path=/teacher/dashboard.
        // Loop finds role=teacher. path matches. role==userRole. OK.
        // Loop continues. finds role=student. path DOES NOT match. OK.

        // The only invalid case is:
        // Path matches a prefix that belongs to Role X, AND User Role != Role X.
        // AND, importantly, the path does NOT also belong to User Role (unlikely overlap here).

        // Simplification: Check if path starts with a known protected prefix.
        // If it does, strictly enforce that prefix's owner == userRole.

        return NextResponse.redirect(
          new URL(DASHBOARD_PATHS[userRole] || "/", request.url),
        );
      }
      // If we found a match and it WAS the user's role (or superadmin), we are good.
      // We can break early?
      // Yes, if we assume prefixes don't overlap in a conflicting way.
      break;
    }
  }

  // If path didn't match any protected prefix (e.g. /profile, /settings if they are common), allow access.
  // Or if it matched and passed the check above.

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
