import { Role } from "@prisma/client";
import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: Role;
      schoolId?: string;
      profilePic?: string;
      schoolLogo?: string;
      schoolName?: string;
    };
  }

  interface User {
    id: string;
    role?: Role;
    schoolId?: string;
    profilePic?: string;
    schoolLogo?: string;
    schoolName?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: Role;
    schoolId?: string;
    profilePic?: string;
    schoolLogo?: string;
    schoolName?: string;
  }
}
