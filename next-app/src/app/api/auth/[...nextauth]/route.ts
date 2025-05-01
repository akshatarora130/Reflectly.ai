import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/app/db/prisma";

const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId:
        "280728861898-04ubtv1m37lapl14citq0k1ha02i6qpe.apps.googleusercontent.com",
      clientSecret: "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",
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
  callbacks: {
    async session({ session, user }: { session: any; user: any }) {
      session.user.id = user.id;
      return session;
    },
  },
};

// Create handler from auth options
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
