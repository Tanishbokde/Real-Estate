"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { User, Lock, Mail, ArrowRight, Heart, Sparkles, Home, Phone, AlertCircle } from "lucide-react";

export default function CustomerLoginPage() {
  const router = useRouter();
  const { login, registerCustomer } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleToggleMode = (signUp: boolean) => {
    setIsSignUp(signUp);
    setError(null);
    setName("");
    setEmail("");
    setPhone("");
    setPassword("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        const res = await registerCustomer({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          password
        });
        if (res.success) {
          router.push("/customer");
        } else {
          setError(res.error || "Failed to create customer account. Please try again.");
        }
      } else {
        const ok = await login("customer", email.trim().toLowerCase(), password);
        if (ok) {
          router.push("/customer");
        } else {
          setError("Invalid customer credentials. Please check your email and password.");
        }
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center mx-auto shadow-xl">
            <Home className="w-8 h-8" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-orange-600" /> Nagpur Home Seeker Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Customer {isSignUp ? "Registration" : "Login"}
          </h1>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            {isSignUp
              ? "Create your private Nagpur buyer profile to track property tours and inquiries."
              : "Explore verified properties across 21 Nagpur areas, book site visits, and track your inquiries."}
          </p>
        </div>

        {/* Login / Register Form Box */}
        <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-xl space-y-5">
          {/* Sign In vs Register Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => handleToggleMode(false)}
              className={`flex-1 py-1.5 rounded-lg transition ${
                !isSignUp ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => handleToggleMode(true)}
              className={`flex-1 py-1.5 rounded-lg transition ${
                isSignUp ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              New Account
            </button>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {isSignUp && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name <span className="text-orange-600">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="e.g. Tanmay Kulkarni"
                      className="w-full text-xs pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-hidden font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mobile Phone Number <span className="text-orange-600">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      placeholder="e.g. +91 98230 12345"
                      className="w-full text-xs pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-hidden font-medium"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address <span className="text-orange-600">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="e.g. priya.deshmukh@gmail.com"
                  className="w-full text-xs pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-hidden font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password <span className="text-orange-600">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="e.g. customer123 (or your password)"
                  className="w-full text-xs pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-hidden font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              <User className="w-4 h-4" />
              {loading ? "Processing..." : isSignUp ? "Create Account & Continue" : "Sign In to Customer Portal"}
            </button>
          </form>

          {/* Clean Demo Credentials Reference Card */}
          <div className="pt-3 border-t border-slate-100">
            <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-amber-900 font-bold text-[11px]">
                <span>Demo Customer Credentials:</span>
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => handleFillDemo("priya.deshmukh@gmail.com", "customer123")}
                    className="text-orange-700 hover:text-orange-800 underline font-semibold text-[10px] cursor-pointer"
                  >
                    Fill in Form
                  </button>
                )}
              </div>
              <div className="text-[11px] text-slate-600 font-mono space-y-0.5">
                <div>Email: <strong className="text-slate-800">priya.deshmukh@gmail.com</strong></div>
                <div>Password: <strong className="text-slate-800">customer123</strong></div>
              </div>
            </div>
          </div>
        </div>

        {/* Cross Login Navigation Switcher */}
        <div className="bg-slate-100/80 p-4 rounded-2xl text-center text-xs space-y-1 border border-slate-200">
          <p className="text-slate-500 font-medium">Looking for staff or management login?</p>
          <div className="flex items-center justify-center gap-3 pt-1 font-bold">
            <Link href="/login/admin" className="text-slate-900 hover:underline">
              👑 Admin Login
            </Link>
            <span className="text-slate-300">|</span>
            <Link href="/login/agent" className="text-emerald-700 hover:underline">
              👔 Agent Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
