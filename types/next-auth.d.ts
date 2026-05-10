import { DefaultSession, DefaultJWT } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "client" | "freelancer" | null;
      username: string | null;
      isEmailVerified: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: "client" | "freelancer" | null;
    username: string | null;
    isEmailVerified: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    role: "client" | "freelancer" | null;
    username: string | null;
    isEmailVerified: boolean;
  }
}
