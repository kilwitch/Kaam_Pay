import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getUserByEmail, upsertGoogleUser } from "@/app/lib/actions/auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await getUserByEmail(credentials.email as string);
        if (!user) return null;

        if (!user.is_email_verified) {
          throw new Error("EMAIL_NOT_VERIFIED");
        }

        if (!user.password_hash) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.password_hash
        );
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.full_name,
          image: user.avatar_url,
          role: user.role,
          username: user.username,
          isEmailVerified: user.is_email_verified,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Google OAuth — upsert user
      if (account?.provider === "google" && profile?.email) {
        try {
          const userId = await upsertGoogleUser({
            email: profile.email,
            name: profile.name ?? "",
            image: (profile as { picture?: string }).picture ?? "",
            providerAccountId: account.providerAccountId,
          });
          user.id = userId;
        } catch {
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user, trigger, session }) {
      // On initial sign-in, populate token from user
      if (user) {
        token.id = user.id!;
        token.role = (user as { role?: "client" | "freelancer" | null }).role ?? null;
        token.username = (user as { username?: string | null }).username ?? null;
        token.isEmailVerified = (user as { isEmailVerified?: boolean }).isEmailVerified ?? false;
      }
      // Allow client-side session updates
      if (trigger === "update" && session) {
        token.role = session.role ?? token.role;
        token.username = session.username ?? token.username;
      }
      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as "client" | "freelancer" | null;
      session.user.username = token.username as string | null;
      session.user.isEmailVerified = token.isEmailVerified as boolean;
      return session;
    },
  },
});
