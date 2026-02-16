import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: "http://localhost:5432", 
});

export const { signIn, signUp, useSession, signOut } = authClient;
