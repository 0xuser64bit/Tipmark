import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import db from "@/db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET || "secret",
  callbacks: {
    async signIn({ user }: any) {
      const existingUser = await db.user.findUnique({
        where: { email: user.email },
      });

      if (!existingUser) {
        await db.user.create({
          data: {
            email: user.email,
          },
        });
      }
      return true;
    },
  },
});
