import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

const isDev = process.env.NODE_ENV === "development" || !process.env.NEXTAUTH_URL?.startsWith("https://");

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required.");
        }

        // Find user by email or username
        const user = await prisma.user.findFirst({
          where: {
            OR: [{ email: credentials.email }, { userName: credentials.email }],
          },
        });

        if (!user || !user.password) {
          throw new Error("User not found.");
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid password.");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as any;
      }
      return session;
    },
  },
  // Only enforce __Secure- prefix cookies with domain scoping in production HTTPS
  cookies: !isDev
    ? {
        sessionToken: {
          name: `__Secure-next-auth.session-token`,
          options: {
            httpOnly: true,
            sameSite: "lax",
            path: "/",
            secure: true,
            domain: (() => {
              try {
                const urlStr = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL;
                if (urlStr) {
                  const hostname = new URL(urlStr).hostname;
                  return hostname.startsWith('.') ? hostname : `.${hostname.replace('www.', '').replace('chat.', '')}`;
                }
              } catch (e) {
                // ignore
              }
              return '.learnxchain.com';
            })(),
          },
        },
      }
    : undefined,
  secret: process.env.NEXTAUTH_SECRET,
};
