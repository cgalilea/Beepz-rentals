"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api } from "./api";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("beepz_token");
    const savedUser = localStorage.getItem("beepz_user");
    if (saved && savedUser) {
      setToken(saved);
      setUser(JSON.parse(savedUser));
      api.setToken(saved);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const result = await api.login(email, password);
    setToken(result.token);
    setUser(result.user);
    api.setToken(result.token);
    localStorage.setItem("beepz_token", result.token);
    localStorage.setItem("beepz_user", JSON.stringify(result.user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    api.setToken(null);
    localStorage.removeItem("beepz_token");
    localStorage.removeItem("beepz_user");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
