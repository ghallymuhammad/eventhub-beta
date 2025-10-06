import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
      profilePicture?: string | null;
    };
  }

  interface User {
    role: string;
    profilePicture?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    profilePicture?: string | null;
  }
}
