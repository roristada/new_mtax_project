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

        // Ensure email and password are provided
        if (!credentials.email || !credentials.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        
        console.log('User fetched from Prisma:', user);  // Log user fetched

        // Check if user exists and password matches
        if (user && user.password && await bcrypt.compare(credentials.password, user.password)) {
          return {
            id: user.id.toString(),
            email: user.email,
            company: user.company,
            role: user.role,
            name: user.name,  // Ensure this line is present
          };
        }
        
        // Return null if credentials are invalid
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
    async jwt({ token, user }) {
      if (user) {
        console.log("user",user);
        token.id = user.id;
        token.email = user.email;
        token.company = user.company;
        token.name = user.name ;  // Add this line
        token.role = user.role;
      }
      console.log("JWT token:", token);
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id as string,
        email: token.email as string,
        company: token.company as string,
        name: token.name as string,  // Ensure this line is present
        role: token.role as string,
      };
      console.log("Session:", session);  // Add this log
      return session;
    },
  },
});

export { handler as GET, handler as POST };
