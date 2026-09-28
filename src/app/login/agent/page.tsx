"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { nagpurDb } from "@/lib/data/nagpur-mock-db";
import { AgentBroker } from "@/lib/types/database";
import { Lock, Mail, Building2, User, CheckCircle2, AlertCircle } from "lucide-react";

export default function AgentLoginPage() {
  const router = useRouter();
  const { user, role, isAuthenticated, isLoading, login } = useAuth();
  const [agents, setAgents] = useState<AgentBroker[]>([]);

  // Requirement 1: Fields must NOT already contain typed text and must be empty by default
  const [emailInput, setEmailInput] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already authenticated as Agent, route directly to agent dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated && role === "agent") {
      window.location.href = "/agent";
    }
  }, [isLoading, isAuthenticated, role]);

  useEffect(() => {
    const list = nagpurDb.getAgents();
    setAgents(list);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!emailInput.trim() || !password) {
      setError("Please enter your broker email ID and password.");
      return;
    }

    setLoading(true);

    try {
      const ok = await login("agent", emailInput.trim().toLowerCase(), password);
      if (ok) {
        window.location.href = "/agent";
      } else {
        setError("Invalid broker email or password. Please verify your credentials.");
        setLoading(false);
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected login error occurred");
      setLoading(false);
    }
  };

  const handleQuickLogin = async (email: string) => {
    setError(null);
    setLoading(true);
    try {
      const ok = await login("agent", email, "agent123");
      if (ok) {
        window.location.href = "/agent";
      } else {
        setError("Quick login failed for " + email);
        setLoading(false);
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected login error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-xl">
            <Building2 className="w-8 h-8" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> MahaRERA Verified Broker Network
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Agent / Broker Login
          </h1>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Access your scheduled customer visits, active property inquiries, and portfolio leads.
          </p>
        </div>

        {/* Login Form Box */}
        <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-xl space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Broker Email ID
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  required
                  placeholder="e.g. amit.sharma@nagpurrealty.in"
                  className="w-full text-xs pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="e.g. agent123"
                  className="w-full text-xs pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              <User className="w-4 h-4" />
              {loading ? "Authenticating Broker..." : "Sign In to Agent Dashboard"}
            </button>
          </form>

          {/* Requirement 1: Demo credentials shown as demo text below fields */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <p className="text-[11px] font-semibold text-slate-500">Demo Broker Credentials (Reference):</p>
            <div className="text-[11px] text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono space-y-1">
              <div><span className="text-slate-400 font-sans">Email ID: </span>amit.sharma@nagpurrealty.in</div>
              <div><span className="text-slate-400 font-sans">Password: </span>agent123</div>
            </div>
            
            <p className="text-[11px] text-slate-400 text-center pt-1">Or 1-click demo login as registered broker:</p>
            <button
              type="button"
              onClick={() => handleQuickLogin("amit.sharma@nagpurrealty.in")}
              className="w-full py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              👔 1-Click Login: Amit Sharma (Dharampeth Luxury Broker)
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin("sneha.k@orangecityestates.com")}
              className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 font-medium text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              👔 1-Click Login: Sneha Kulkarni (Wardha Road / Besa)
            </button>
          </div>
        </div>

        {/* Cross Login Navigation Switcher */}
        <div className="bg-slate-100/80 p-4 rounded-2xl text-center text-xs space-y-1 border border-slate-200">
          <p className="text-slate-500 font-medium">Looking for another role login?</p>
          <div className="flex items-center justify-center gap-3 pt-1 font-bold">
            <Link href="/login/admin" className="text-slate-900 hover:underline">
              👑 Admin Login
            </Link>
            <span className="text-slate-300">|</span>
            <Link href="/login/customer" className="text-orange-600 hover:underline">
              👤 Customer Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
