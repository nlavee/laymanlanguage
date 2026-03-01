"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/api/client";

interface AuthContextType {
  token: string | null;
  user: string | null;
  login: (token: string, username: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = () => {
      const savedToken = localStorage.getItem("auth_token");
      const savedUser = localStorage.getItem("auth_user");
      
      console.log("AuthProvider: Initializing with", { hasToken: !!savedToken, user: savedUser });
      
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(savedUser);
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${savedToken}`;
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = (newToken: string, username: string) => {
    console.log("AuthProvider: Logging in", username);
    setToken(newToken);
    setUser(username);
    localStorage.setItem("auth_token", newToken);
    localStorage.setItem("auth_user", username);
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
    
    // Use a small delay to ensure state is flushed before redirect
    setTimeout(() => {
      router.push("/");
    }, 100);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    delete apiClient.defaults.headers.common["Authorization"];
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isLoading }}>
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
