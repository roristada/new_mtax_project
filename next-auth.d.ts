import NextAuth, { type DefaultSession } from "next-auth"

import type { DefaultSession } from 'next-auth';

declare module "next-auth" {
    interface User {
      id: string;
      email: string;
      company?: string;
      role?: string // Optional, based on your schema
    }
  
    interface Session {
      user?: {
        id?: string;
        email?: string;
        company?: string; 
        role?: string // Ensure this matches the type used in callbacks
      };
    }
  
    interface JWT {
        id?: string;
      email?: string;
      company?: string;
      role?: string // Ensure this matches the type used in callbacks
    }
  }

  declare module "next-auth/jwt" {
    interface JWT {
    id?: string;
      email?: string;
      company?: string; 
      role?: string // Add this line
    }
  }
  

