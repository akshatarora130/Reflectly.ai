import prisma from "@/app/db/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId:
        process.env.GOOGLE_CLIENT_ID ||
        "280728861898-04ubtv1m37lapl14citq0k1ha02i6qpe.apps.googleusercontent.com",
      clientSecret:
        process.env.GOOGLE_CLIENT_SECRET ||
        "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",
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  // Use environment variable for the secret if available
  secret:
    process.env.NEXTAUTH_SECRET ||
    "MQPR02Jmm33WRvqjEBj2EMLfq5zNCVtt6z9aFbSDifw=",

  callbacks: {
    async signIn({ user, account, profile, email, credentials }: any) {
      if (user?.error) {
        return false;
      }
      return true;
    },
    async session({ session, token }: any) {
      // Add user ID to the session
      if (token?.id) {
        session.user.id = token.id;
      }
      return session;
    },
    async jwt({ token, user, account, profile, isNewUser }: any) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  debug: true,
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
};
