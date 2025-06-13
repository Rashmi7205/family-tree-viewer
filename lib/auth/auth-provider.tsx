"use client";

import type React from "react";
import { AuthProvider as FirebaseAuthProvider } from "@/lib/auth/auth-context";

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return <FirebaseAuthProvider>{children}</FirebaseAuthProvider>;
}
