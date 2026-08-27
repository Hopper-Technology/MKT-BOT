import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  pages: { signIn: "/login" },
  callbacks: {
    authorized: async ({ auth: session }) => Boolean(session),
    signIn: async ({ profile }) => {
      const domain = process.env.AUTH_ALLOWED_DOMAIN;
      if (!domain) return true;
      return Boolean(profile?.email?.toLowerCase().endsWith(`@${domain.toLowerCase()}`));
    },
  },
});
