import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  pages: { signIn: "/login" },
  callbacks: {
    authorized: async ({ auth: session }) => Boolean(session),
    signIn: async ({ user, profile }) => {
      const email = (user.email ?? profile?.email)?.trim().toLowerCase();
      if (!email) return false;

      const domain = process.env.AUTH_ALLOWED_DOMAIN;
      if (domain && !email.endsWith(`@${domain.toLowerCase()}`)) return false;

      const emailVerified = profile?.email_verified === true ? new Date() : undefined;

      await prisma.adminUser.upsert({
        where: { email },
        create: {
          email,
          name: user.name,
          image: user.image,
          emailVerified,
        },
        update: {
          name: user.name,
          image: user.image,
          ...(emailVerified ? { emailVerified } : {}),
        },
      });

      return true;
    },
  },
});
