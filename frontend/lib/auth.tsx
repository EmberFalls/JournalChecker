"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8100";

export type SearchHistoryItem = {
  id: string;
  query: string;
  mode: "identifier" | "website";
  title: string;
  assessment: string;
  confidence: number;
  coverage: number;
  timestamp: string;
  identifiers: string[];
};

export type UserProfile = {
  name: string;
  email: string;
  avatarUrl?: string;
  institution: string;
  role: string;
  apiKey: string;
};

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string, name?: string) => Promise<void>;
  registerAccount: (email: string, password: string, name?: string, institution?: string) => Promise<void>;
  loginWithGoogle: (googleToken?: string) => Promise<void>;
  logout: () => void;
  searchHistory: SearchHistoryItem[];
  addSearchHistory: (item: Omit<SearchHistoryItem, "id" | "timestamp">) => void;
  clearHistory: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);

  // Restore session from LocalStorage
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("ji_token");
      const storedUser = localStorage.getItem("ji_user");

      // Only restore session if BOTH token AND user are present (i.e., from a real login)
      if (storedToken && storedUser) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      }

      const storedHistory = localStorage.getItem("ji_history");
      if (storedHistory) {
        setSearchHistory(JSON.parse(storedHistory));
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  async function login(email: string, password?: string, name?: string) {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: password || "password123" }),
    });

    if (!res.ok) {
      throw new Error("Login failed");
    }

    const data = await res.json();
    const apiUser: UserProfile = {
      name: data.user.name || name || "Dr. Researcher",
      email: data.user.email,
      institution: data.user.institution || "Academic Institution",
      role: data.user.role || "Verified Researcher",
      apiKey: data.user.api_key || `ji_live_${Date.now()}`,
    };
    setUser(apiUser);
    setToken(data.access_token);
    localStorage.setItem("ji_user", JSON.stringify(apiUser));
    localStorage.setItem("ji_token", data.access_token);
  }

  async function registerAccount(email: string, password: string, name?: string, institution?: string) {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name, institution }),
    });

    if (!res.ok) {
      throw new Error("Registration failed");
    }

    const data = await res.json();
    const apiUser: UserProfile = {
      name: data.user.name || name || "Dr. Researcher",
      email: data.user.email,
      institution: data.user.institution || institution || "Academic Institution",
      role: "Verified Researcher",
      apiKey: data.user.api_key || `ji_live_${Date.now()}`,
    };
    setUser(apiUser);
    setToken(data.access_token);
    localStorage.setItem("ji_user", JSON.stringify(apiUser));
    localStorage.setItem("ji_token", data.access_token);
  }

  async function loginWithGoogle(googleToken?: string) {
    if (!googleToken) throw new Error("No Google token provided");

    const res = await fetch(`${API_BASE}/api/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: googleToken }),
    });

    if (!res.ok) {
      throw new Error("Google authentication failed");
    }

    const data = await res.json();
    const apiUser: UserProfile = {
      name: data.user.name || "Researcher",
      email: data.user.email || "",
      institution: data.user.institution || "Academic Institution",
      role: data.user.role || "Verified Researcher",
      apiKey: data.user.api_key || `ji_live_${Date.now()}`,
      avatarUrl: data.user.avatar_url,
    };
    setUser(apiUser);
    setToken(data.access_token);
    localStorage.setItem("ji_user", JSON.stringify(apiUser));
    localStorage.setItem("ji_token", data.access_token);
  }

  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem("ji_user");
    localStorage.removeItem("ji_token");
  }

  function addSearchHistory(item: Omit<SearchHistoryItem, "id" | "timestamp">) {
    const newItem: SearchHistoryItem = {
      ...item,
      id: `hist_${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    setSearchHistory((prev) => {
      const filtered = prev.filter((h) => h.query !== item.query);
      const updated = [newItem, ...filtered];
      localStorage.setItem("ji_history", JSON.stringify(updated));
      return updated;
    });
  }

  function clearHistory() {
    setSearchHistory([]);
    localStorage.removeItem("ji_history");
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        login,
        registerAccount,
        loginWithGoogle,
        logout,
        searchHistory,
        addSearchHistory,
        clearHistory,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
