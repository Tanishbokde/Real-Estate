"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { UserRole } from "@/lib/types/database";

export interface DemoUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  agency?: string;
  agentId?: string;
  customerId?: string;
  phone: string;
}

export const DEMO_USERS: Record<UserRole, DemoUser> = {
  admin: {
    id: "usr-admin",
    email: "rajesh.admin@nagpurrealty.in",
    name: "Rajesh Agrawal",
    role: "admin",
    phone: "+91 98220 11223"
  },
  agent: {
    id: "usr-agent-1",
    email: "amit.sharma@nagpurrealty.in",
    name: "Amit Sharma",
    role: "agent",
    agency: "Dharampeth Realty Advisors",
    agentId: "agent-1",
    phone: "+91 98230 45612"
  },
  customer: {
    id: "usr-cust-1",
    email: "priya.deshmukh@gmail.com",
    name: "Priya Deshmukh",
    role: "customer",
    customerId: "cust-1",
    phone: "+91 98231 99012"
  }
};

export interface RegisterCustomerData {
  name: string;
  email: string;
  phone?: string;
  password?: string;
  preferredLocalities?: string[];
  budgetMax?: number;
}

interface AuthContextType {
  user: DemoUser | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (role: UserRole, email?: string, password?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  registerCustomer: (data: RegisterCustomerData) => Promise<{ success: boolean; error?: string; user?: DemoUser }>;
  switchUser: (role: UserRole) => void;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<UserRole | null>(null);
  const [user, setUser] = useState<DemoUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session", {
        cache: "no-store",
        headers: { "Pragma": "no-cache" }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
          setRoleState(data.user.role);
          setIsAuthenticated(true);
          try {
            localStorage.setItem("nagpur_auth_session", JSON.stringify({
              role: data.user.role,
              isLoggedIn: true,
              email: data.user.email,
              id: data.user.id
            }));
          } catch (_) {}
          setIsLoading(false);
          return;
        }
      }
    } catch (e) {
      console.error("Session refresh error:", e);
    }

    // If server session is not authenticated or expired, strictly clear state and storage
    setUser(null);
    setRoleState(null);
    setIsAuthenticated(false);
    try {
      localStorage.removeItem("nagpur_auth_session");
    } catch (_) {}
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refreshSession();

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "nagpur_auth_session") {
        refreshSession();
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [refreshSession]);

  const login = async (newRole: UserRole, email?: string, password?: string): Promise<boolean> => {
    try {
      const finalEmail = email || DEMO_USERS[newRole].email;
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: newRole,
          email: finalEmail,
          password: password || (newRole === "admin" ? "admin123" : newRole === "agent" ? "agent123" : "customer123")
        })
      });

      const data = await res.json();
      if (res.ok && data.success && data.user) {
        setUser(data.user);
        setRoleState(data.user.role);
        setIsAuthenticated(true);
        try {
          localStorage.setItem("nagpur_auth_session", JSON.stringify({
            role: data.user.role,
            isLoggedIn: true,
            email: data.user.email,
            id: data.user.id
          }));
        } catch (_) {}
        return true;
      } else {
        console.error("Login failed:", data.error);
        return false;
      }
    } catch (err) {
      console.error("Login exception:", err);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST"
      });
    } catch (e) {
      console.error("Logout API call error:", e);
    }
    setUser(null);
    setRoleState(null);
    setIsAuthenticated(false);
    try {
      localStorage.setItem("nagpur_auth_session", JSON.stringify({ isLoggedIn: false }));
      localStorage.removeItem("nagpur_auth_session");
    } catch (_) {}
  };

  const registerCustomer = async (
    data: RegisterCustomerData
  ): Promise<{ success: boolean; error?: string; user?: DemoUser }> => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const resData = await res.json();
      if (res.ok && resData.success && resData.user) {
        setUser(resData.user);
        setRoleState("customer");
        setIsAuthenticated(true);
        try {
          localStorage.setItem("nagpur_auth_session", JSON.stringify({
            role: "customer",
            isLoggedIn: true,
            email: resData.user.email,
            id: resData.user.id
          }));
        } catch (_) {}
        return { success: true, user: resData.user };
      } else {
        return { success: false, error: resData.error || "Registration failed" };
      }
    } catch (err: any) {
      return { success: false, error: err?.message || "Failed to contact registration server" };
    }
  };

  const switchUser = (newRole: UserRole) => {
    login(newRole);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        isLoading,
        login,
        logout,
        registerCustomer,
        switchUser,
        refreshSession
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
