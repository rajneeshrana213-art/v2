import jwt from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from "next";
import { CONFIG } from "./config";
import { IPermissionListObj } from "./types";
import { prisma } from "./prisma";
import { Role } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  // Removed PrismaAdapter to avoid table dependency for now
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findFirst({
          where: {
            OR: [{ email: credentials.email }, { userName: credentials.email }],
          },
          include: {
            school: true,
            Employee: {
              include: {
                department: true,
                designation: true,
              },
            },
          },
        });

        if (!user || !user.password) {
          throw new Error("User not found");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password,
        );

        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          userName: user.userName,
          role: user.role,
          schoolId: user.schoolId || user.school?.id || null,
          schoolGroupId: user.schoolGroupId || null,
          profilePic:
            user.profilePic && user.profilePic.length > 500
              ? null
              : user.profilePic,
          schoolLogo:
            user.school?.schoolLogo && user.school.schoolLogo.length > 500
              ? null
              : user.school?.schoolLogo,
          schoolName: user.school?.schoolName,
          employee: user.Employee
            ? {
                id: user.Employee.id,
                employeeCode: user.Employee.employeeCode,
                employeeType: user.Employee.employeeType,
                status: user.Employee.status,
                department: user.Employee.department?.name || null,
                designation: user.Employee.designation?.name || null,
              }
            : null,
        } as any; // Using any here because of NextAuth user interface mismatch
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        if (!user.email) return false;

        let dbUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (!dbUser) {
          const displayName = user.name || user.email.split("@")[0] || "Google User";
          await prisma.user.create({
            data: {
              name: displayName,
              email: user.email,
              phone: "",
              password: "", // OAuth/Google users don't have a local password hash
              role: "forum_user",
              address: "",
              city: "",
              state: "",
              country: "",
              pincode: "",
              bloodType: "",
              sex: "OTHERS",
              forumUserProfile: {
                create: {
                  educationLevel: null,
                  subjectsExpertise: null,
                },
              },
            },
          });
        }
        return true;
      }
      return true;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      
      // Allow redirects to our local development AI portal (port 5000)
      // or production subdomains of learnxchain.com
      if (
        url.startsWith("http://localhost:5000") ||
        url.startsWith("http://127.0.0.1:5000") ||
        url.includes(".learnxchain.com") ||
        url.startsWith("https://learnxchain.com")
      ) {
        return url;
      }
      
      // Default safety fallback
      try {
        const urlObj = new URL(url);
        const baseObj = new URL(baseUrl);
        if (urlObj.hostname === baseObj.hostname) {
          return url;
        }
      } catch (e) {
        // ignore
      }
      return baseUrl;
    },
    async jwt({ token, user, account, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.schoolId = (user as any).schoolId;
        token.schoolGroupId = (user as any).schoolGroupId;
        token.profilePic = (user as any).profilePic;
        token.schoolLogo = (user as any).schoolLogo;
        token.schoolName = (user as any).schoolName;
        token.userName = (user as any).userName;
        token.employee = (user as any).employee;
      }

      // Handle Google/OAuth user enrichment from DB
      if (account?.provider === "google" && token.email) {
        const dbUser = await prisma.user.findFirst({
          where: { email: token.email },
          include: {
            school: true,
            Employee: {
              include: {
                department: true,
                designation: true,
              },
            },
          },
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.userName = dbUser.userName;
          token.schoolId = dbUser.schoolId || dbUser.school?.id || undefined;
          token.schoolGroupId = dbUser.schoolGroupId || undefined;
          token.profilePic =
            dbUser.profilePic && dbUser.profilePic.length > 500
              ? undefined
              : (dbUser.profilePic ?? undefined);
          token.schoolLogo =
            dbUser.school?.schoolLogo && dbUser.school.schoolLogo.length > 500
              ? undefined
              : (dbUser.school?.schoolLogo ?? undefined);
          token.schoolName = dbUser.school?.schoolName;
          token.employee = dbUser.Employee
            ? {
                id: dbUser.Employee.id,
                employeeCode: dbUser.Employee.employeeCode,
                employeeType: dbUser.Employee.employeeType,
                status: dbUser.Employee.status,
                department: dbUser.Employee.department?.name || null,
                designation: dbUser.Employee.designation?.name || null,
              }
            : null;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as any;
        (session.user as any).schoolId = token.schoolId as string;
        (session.user as any).schoolGroupId = token.schoolGroupId as string;
        (session.user as any).profilePic = token.profilePic as string;
        (session.user as any).schoolLogo = token.schoolLogo as string;
        (session.user as any).schoolName = token.schoolName as string;
        (session.user as any).userName = token.userName as string;
        (session.user as any).employee = token.employee as any;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  events: {
    async signIn({ user }) {
      if (user?.id) {
        await prisma.userLoginLog.create({
          data: {
            userId: user.id,
            role: (user as any).role || "staff",
            timestamp: new Date(),
          },
        });
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

/**
 * LEGACY JWT UTILS (Used by Mobile/Existing APIs)
 */
export const getJwtToken = async (
  data: any,
  expiresIn: any = CONFIG.JWT_DEFAULT_EXPIRY_TIME,
  isRefreshToken: boolean = false,
) => {
  return jwt.sign(
    data,
    isRefreshToken
      ? (CONFIG.JWT_REFRESH_TOKEN_SECRET as string)
      : CONFIG.JWT_ACCESS_TOKEN_SECRET,
    { expiresIn },
  );
};

export const generateJwtToken = getJwtToken;

export const decodeJwtToken = async (
  token: string,
  secretKey = CONFIG.JWT_ACCESS_TOKEN_SECRET,
): Promise<any> => {
  return jwt.verify(token, secretKey) as any;
};

/**
 * Hybrid Auth Verification
 * Supports:
 * 1. Web session (via getServerSession)
 * 2. Mobile/API token (via Authorization: Bearer <token>)
 */
export async function verifyAuth(
  arg1: string | NextApiRequest,
  arg2?: NextApiResponse,
): Promise<any> {
  try {
    // 1. Try web session first — isolated so any session errors never
    //    prevent the Bearer token fallback used by mobile clients.
    if (typeof arg1 !== "string") {
      const req = arg1 as NextApiRequest;
      const res = arg2 as NextApiResponse;

      try {
        const session = await getServerSession(req, res, authOptions);
        if (session?.user) {
          (req as any).user = session.user;
          return session.user;
        }
      } catch (sessionError) {
        // Session check failed (e.g., NEXTAUTH_URL mismatch, bad cookie).
        // Fall through to Bearer token verification — do NOT throw here.
        console.warn("[verifyAuth] Session check failed, trying Bearer:", (sessionError as Error).message);
      }
    }

    // 2. Fallback to manual JWT verification (mobile / Bearer token clients)
    let token = "";
    if (typeof arg1 === "string") {
      token = arg1;
    } else {
      const req = arg1 as NextApiRequest;
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      if (typeof arg1 !== "string" && arg2) {
        arg2
          .status(401)
          .json({ error: "Unauthorized: No session or token found" });
      }
      return null;
    }

    if (!CONFIG.JWT_ACCESS_TOKEN_SECRET) {
      console.error("[verifyAuth] JWT_ACCESS_TOKEN_SECRET is not defined in environment");
      if (typeof arg1 !== "string" && arg2) {
        arg2.status(500).json({ error: "Server configuration error: JWT secret missing" });
      }
      return null;
    }

    const decoded = jwt.verify(token, CONFIG.JWT_ACCESS_TOKEN_SECRET) as any;
    const userId = decoded.userId || decoded.id;

    if (!userId) {
      if (typeof arg1 !== "string" && arg2) {
        arg2.status(401).json({ error: "Unauthorized: Invalid token payload" });
      }
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { school: true },
    });

    if (!user) {
      if (typeof arg1 !== "string" && arg2) {
        arg2.status(401).json({ error: "Unauthorized: User not found" });
      }
      return null;
    }

    const userObj = {
      id: user.id,
      email: user.email,
      userName: user.userName,
      role: user.role,
      schoolId: user.schoolId || user.school?.id || null,
      schoolGroupId: user.schoolGroupId || null,
      name: user.name,
    };

    if (typeof arg1 !== "string") {
      (arg1 as any).user = userObj;
    }

    return userObj;
  } catch (error: any) {
    console.error("[verifyAuth] Error:", error.message);
    if (typeof arg1 !== "string" && arg2) {
      let message = "Unauthorized: Invalid token";
      if (error.name === "TokenExpiredError") message = "Unauthorized: Token expired";
      if (error.name === "JsonWebTokenError") message = `Unauthorized: ${error.message}`;
      
      arg2.status(401).json({ error: message });
    }
    return null;
  }
}

// Permission Utils

export const compareUserPermissionHandler = async (
  permissionObj: IPermissionListObj,
  path: string,
) => {
  let returnData = false;
  const allPermissions = permissionObj.modulePermission
    .split("")
    .map((value) => parseInt(value));

  if (
    (path.includes("/get-list") && allPermissions[1] === 1) ||
    (path.includes("/get") && allPermissions[1] === 1) ||
    (path.includes("/add-user") && allPermissions[0] === 1) ||
    (path.includes("/update") && allPermissions[2] === 1) ||
    (path.includes("/delete") && allPermissions[3] === 1) ||
    (path.includes("/get-permissions") && allPermissions[4] === 1) ||
    (path.includes("/update-permissions") && allPermissions[4] === 1)
  ) {
    returnData = true;
  }

  return returnData;
};

export const checkModuleAccess = async (user: any, moduleName: string) => {
  if (!user) return false;
  if (user.role === Role.superadmin) return true;

  // Assuming isActive check logic was here
  // const userActive = await prisma.user.findFirst({ where: { id: user.id, isActive: 1 } });
  // if(!userActive) return false;

  const permissionObj = await prisma.userPermissions.findFirst({
    where: {
      userId: user.id,
      moduleName: moduleName,
    },
  });

  if (!permissionObj) return false;

  const perms = permissionObj.modulePermission.split("").map(Number);
  // Check Read Permission (Index 1)
  if (perms[1] !== 1) return false;

  return true;
};

export const checkPathAccess = async (
  user: any,
  moduleName: string,
  path: string,
) => {
  if (!user) return false;
  if (user.role === Role.superadmin) return true;

  const permissionObj = await prisma.userPermissions.findFirst({
    where: {
      userId: user.id,
      moduleName: moduleName,
    },
  });

  if (!permissionObj) return false;

  const allowed = await compareUserPermissionHandler(permissionObj, path);
  return allowed;
};
