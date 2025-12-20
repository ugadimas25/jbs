import React, { createContext, useContext, useState, ReactNode } from "react";
import { useLocation } from "wouter";

interface User {
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, name: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // TEMPORARY: Mock user untuk testing - disable authentication
  const [user, setUser] = useState<User | null>({
    email: "test@example.com",
    name: "Test User"
  });
  const [, setLocation] = useLocation();

  const login = (email: string, name: string) => {
    setUser({ email, name });
    // Navigate back to previous page or home, simplified here
  };

  const logout = () => {
    // setUser(null); // Disabled untuk testing
    setLocation("/");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: true }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
