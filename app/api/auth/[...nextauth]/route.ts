import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import NextAuth from 'next-auth';

const prisma = new PrismaClient();

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'john@doe.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        if (!credentials) return null;

        if (!credentials.email || !credentials.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        
        if (user && user.password && await bcrypt.compare(credentials.password, user.password)) {
          return {
            id: user.id.toString(),
            email: user.email,
            company: user.company,
            role: user.role,
            name: user.name,  
          };
        }
        
        return null;
      },
    }),
  ],
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
    maxAge: 5 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update") {
        const updatedUser = await prisma.user.findUnique({
          where: { id: Number(token.sub || token.id) },
        });
        
        if (updatedUser) {
          token.name = updatedUser.name;
          token.email = updatedUser.email;
          token.company = updatedUser.company;
          token.role = updatedUser.role;
        }
      }
      
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.company = user.company;
        token.name = user.name;
        token.role = user.role;
      }
      
      return token;
    },
    async session({ session, token }) {
      
      session.user = {
        id: token.sub || token.id as string,
        email: token.email as string,
        company: token.company as string,
        name: token.name as string,
        role: token.role as string,
      };
      return session;
    },
  },
});

export { handler as GET, handler as POST };

