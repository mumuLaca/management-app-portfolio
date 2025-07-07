import { PrismaAdapter } from "@next-auth/prisma-adapter";
import NextAuth, { type NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { Session } from "next-auth";
import SlackProvider from "next-auth/providers/slack";
import prisma from "@/lib/prismadb";
import { type Account } from "@prisma/client";
import { type AdapterAccount } from "next-auth/adapters";

export const authOptions: NextAuthOptions = {
  adapter: {
    ...PrismaAdapter(prisma),
    linkAccount: async (
      data: Partial<Account> & { ok?: unknown; state?: unknown }
    ) => {
      // 不要なプロパティを削除
      const accountData = { ...data };
      delete accountData.ok;
      delete accountData.state;
      const account = await prisma.account.create({
        data: accountData as Account,
      });
      return account as unknown as AdapterAccount;
    },
  },
  providers: [
    SlackProvider({
      clientId: process.env.SLACK_CLIENT_ID ?? "",
      clientSecret: process.env.SLACK_CLIENT_SECRET ?? "",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET ?? "",
  callbacks: {
    async jwt({ token, account }) {
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (!session.user?.email) {
        throw new Error("No user email found in session");
      }

      const employee = await prisma.employee.findUniqueOrThrow({
        where: {
          email: session.user.email,
        },
      });

      return {
        ...session,
        employee,
        accessToken: token.accessToken,
      };
    },
  },
  session: {
    strategy: "jwt" as const,
    maxAge: 60 * 60, // 1h
  },
  pages: {
    signIn: "/login",
    signOut: "/login",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
