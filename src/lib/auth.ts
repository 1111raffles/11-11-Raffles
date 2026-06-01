import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],

  session: { strategy: "jwt" },

  pages: {
    signIn:  "/login",
    signOut: "/",
    error:   "/login",
  },

  providers: [
    CredentialsProvider({
      name: "Email or Username",
      credentials: {
        email:    { label: "Email or Username", type: "text"     },
        password: { label: "Password",          type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const identifier = credentials.email.trim();

        // Try email first, then fall back to name lookup
        let user = await prisma.user.findUnique({
          where: { email: identifier.toLowerCase() },
        });

        if (!user) {
          // Look up by name (case-insensitive)
          user = await prisma.user.findFirst({
            where: { name: { equals: identifier, mode: "insensitive" } },
          });
        }

        if (!user?.passwordHash) return null;

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, email: user.email, name: user.name, image: user.image };
      },
    }),

    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as typeof session.user & { id: string }).id = token.id as string;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
