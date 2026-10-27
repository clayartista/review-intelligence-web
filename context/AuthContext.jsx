"use client";

import { createContext, useContext } from "react";

const AuthContext = createContext(undefined);

export function AuthProvider({ user, children }) {
  const value = { user, isLoggedIn: !!user };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth harus dipakai di dalam <AuthProvider>");
  }
  return context;
}
