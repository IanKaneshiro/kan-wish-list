import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      groups: string[];
      wishlistId?: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    groups?: string[];
    wishlistId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    groups?: string[];
    wishlistId?: string;
  }
}
