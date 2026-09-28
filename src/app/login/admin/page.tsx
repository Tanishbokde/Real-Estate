"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ShieldCheck, Lock, Mail, KeyRound, AlertCircle } from "lucide-react";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/admin";
  const { user, role, isAuthenticated, isLoading, login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already authenticated as Super Admin, immediately route to the dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated && role === "admin") {
      window.location.href = redirectPath;
    }
  }, [isLoading, isAuthenticated, role, redirectPath]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      const ok = await login("admin", email.trim().toLowerCase(), password);
      if (ok) {
        // Full page reload navigation to ensure new cookies are passed cleanly and Next.js router cache is reset
        window.location.href = redirectPath;
      } else {
        setError("Invalid Super Admin credentials. Access denied.");
        setLoading(false);
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred during admin authentication");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-xl">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-amber-400 text-xs font-bold border border-amber-500/30">
            <ShieldCheck className="w-3.5 h-3.5" /> Secure Admin Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Admin Login
          </h1>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Authorized administrator access for Nagpur Real Estate Platform.
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
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="rajesh.admin@nagpurrealty.in"
                  className="w-full text-xs pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden transition font-medium"
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
                  placeholder="••••••••"
                  className="w-full text-xs pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden transition font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              <KeyRound className="w-4 h-4 text-amber-400" />
              {loading ? "Verifying Credentials..." : "Authenticate & Open Admin Panel"}
            </button>
          </form>

          {/* Authorized Credentials Info */}
          <div className="pt-3 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400 mb-2 font-medium">Default Administrator Credentials</p>
            <div className="text-[11px] text-slate-600 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-left font-mono space-y-1">
              <div><span className="text-slate-400">Email:</span> rajesh.admin@nagpurrealty.in</div>
              <div><span className="text-slate-400">Password:</span> admin123</div>
            </div>
          </div>
        </div>

        {/* Cross Login Navigation Switcher */}
        <div className="bg-slate-100/80 p-4 rounded-2xl text-center text-xs space-y-1 border border-slate-200">
          <p className="text-slate-500 font-medium">Looking for another role login?</p>
          <div className="flex items-center justify-center gap-3 pt-1 font-bold">
            <Link href="/login/agent" className="text-emerald-700 hover:underline">
              👔 Agent Login
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

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
