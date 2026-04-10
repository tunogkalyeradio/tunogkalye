import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  providers: [
    // ─── Google OAuth ──────────────────────────────────────
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: false,
    }),

    // ─── Facebook OAuth ────────────────────────────────────
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || "",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: false,
    }),

    // ─── Email/Password ────────────────────────────────────
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email },
          select: {
            id: true,
            email: true,
            name: true,
            password: true,
            role: true,
            avatar: true,
          },
        });

        if (!user || !user.password) {
          throw new Error("No account found with this email");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }

        return {
          id: String(user.id),
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.avatar,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Auto-create user for OAuth providers (Google, Facebook)
      if (account && (account.provider === "google" || account.provider === "facebook") && user.email) {
        const existingUser = await db.user.findUnique({
          where: { email: user.email },
        });

        if (!existingUser) {
          // Auto-register new OAuth user
          await db.user.create({
            data: {
              email: user.email,
              name: user.name || "User",
              avatar: user.image || null,
              provider: account.provider,
              role: "CUSTOMER",
            },
          });
        } else {
          // Update avatar if the OAuth provider has a newer one
          if (user.image && existingUser.avatar !== user.image) {
            await db.user.update({
              where: { email: user.email },
              data: { avatar: user.image },
            });
          }
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
        // Fetch role from DB if not present (OAuth first login)
        if (!token.role && user.email) {
          const dbUser = await db.user.findUnique({
            where: { email: user.email },
            select: { id: true, role: true },
          });
          if (dbUser) {
            token.id = String(dbUser.id);
            token.role = dbUser.role;
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
