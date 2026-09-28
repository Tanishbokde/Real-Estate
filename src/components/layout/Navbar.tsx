"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { nagpurDb } from "@/lib/data/nagpur-mock-db";
import { AppNotification } from "@/lib/types/database";
import {
  Building2,
  ShieldCheck,
  User,
  Bell,
  CheckCircle2,
  Menu,
  X,
  Clock,
  Home,
  LogOut,
  Sparkles,
  KeyRound,
  Database
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, isAuthenticated, logout } = useAuth();

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const refreshNotifs = () => {
    const list = nagpurDb.getNotifications(user?.id);
    setNotifications(list);
  };

  useEffect(() => {
    refreshNotifs();
    const handleUpdate = () => refreshNotifs();
    window.addEventListener("nagpur_db_updated", handleUpdate);
    return () => window.removeEventListener("nagpur_db_updated", handleUpdate);
  }, [user?.id]);

  const unreadCount = notifications.filter((n) => !n.read_status).length;

  const handleMarkAllRead = () => {
    nagpurDb.markAllNotificationsAsRead(user?.id);
    refreshNotifs();
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
    router.refresh();
  };

  return (
    <>
      {/* Top Bar with Three Separate Login Options (Admin Login | Agent Login | Customer Login) */}
      <div className="bg-slate-950 text-slate-200 text-xs px-4 py-2 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Left: Active Session or Welcome */}
          <div className="flex items-center gap-2">
            {isAuthenticated && role ? (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Active Session
                </span>
                <span className="font-semibold text-white flex items-center gap-1.5">
                  {role === "admin" && "👑 Admin: Rajesh Agrawal"}
                  {role === "agent" && `👔 Agent: ${user?.name || "Broker"}`}
                  {role === "customer" && `👤 Customer: ${user?.name || "Buyer"}`}
                </span>
                <Link
                  href={role === "admin" ? "/admin" : role === "agent" ? "/agent" : "/customer"}
                  className="text-orange-400 hover:text-orange-300 underline font-medium ml-1 hidden sm:inline"
                >
                  (Go to Dashboard)
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Nagpur&apos;s Zero Mile Real Estate Portal</span>
              </div>
            )}
          </div>

          {/* Right: Three Separate Login Links + Logout Button */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs">
            <div className="flex items-center gap-2 sm:gap-3 font-semibold">
              <Link
                href="/login/admin"
                className={`transition px-2 py-0.5 rounded ${
                  pathname === "/login/admin"
                    ? "bg-amber-500 text-slate-950 font-bold"
                    : "text-slate-300 hover:text-white hover:underline"
                }`}
              >
                Admin Login
              </Link>
              <span className="text-slate-600">|</span>
              <Link
                href="/login/agent"
                className={`transition px-2 py-0.5 rounded ${
                  pathname === "/login/agent"
                    ? "bg-emerald-500 text-slate-950 font-bold"
                    : "text-slate-300 hover:text-white hover:underline"
                }`}
              >
                Agent Login
              </Link>
              <span className="text-slate-600">|</span>
              <Link
                href="/login/customer"
                className={`transition px-2 py-0.5 rounded ${
                  pathname === "/login/customer"
                    ? "bg-orange-600 text-white font-bold"
                    : "text-slate-300 hover:text-white hover:underline"
                }`}
              >
                Customer Login
              </Link>
            </div>

            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="ml-2 px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-[11px] font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
                title="Sign out of current session"
              >
                <LogOut className="w-3 h-3" />
                Logout
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-bold tracking-tight text-slate-900">
                    Nagpur<span className="text-orange-600">Realty</span>
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 bg-orange-100 text-orange-800 rounded">
                    नागपूर
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 -mt-0.5">Zero Mile Property Hub</p>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              <Link
                href="/"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  pathname === "/" ? "text-orange-600 bg-orange-50 font-semibold" : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                Home
              </Link>
              <Link
                href="/properties"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  pathname.startsWith("/properties") ? "text-orange-600 bg-orange-50 font-semibold" : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                Browse Properties
              </Link>

              {/* Customer Dashboard Link */}
              <Link
                href="/customer"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                  pathname === "/customer" ? "text-orange-600 bg-orange-50 font-semibold" : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <User className="w-4 h-4 text-slate-500" />
                Customer Portal
              </Link>

              {/* Agent Dashboard Link */}
              <Link
                href="/agent"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                  pathname === "/agent" ? "text-emerald-700 bg-emerald-50 font-semibold" : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Building2 className="w-4 h-4 text-emerald-600" />
                Agent Portal
              </Link>

              {/* Admin Panel Link - ONLY accessible & visible when authenticated as Super Admin */}
              {isAuthenticated && role === "admin" && (
                <>
                  <Link
                    href="/admin"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                      pathname === "/admin"
                        ? "bg-slate-900 text-white font-semibold"
                        : "text-slate-900 bg-slate-100 hover:bg-slate-200"
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-500" />
                    Admin Panel
                  </Link>

                  {/* Database Link with Icon */}
                  <Link
                    href="/admin?tab=database"
                    className="px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200"
                    title="Database: View all properties, inquiries, visits & table data"
                  >
                    <Database className="w-4 h-4 text-emerald-600" />
                    <span>Database</span>
                  </Link>
                </>
              )}
            </nav>

            {/* Right Controls: Notifications & Mobile Menu */}
            <div className="flex items-center gap-3">
              {/* Notifications Bell */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifs(!showNotifs)}
                  className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-orange-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifs && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-800 text-sm">Notifications</span>
                        <span className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full font-medium">
                          {notifications.length}
                        </span>
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-xs text-orange-600 hover:text-orange-700 font-medium cursor-pointer"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-slate-400 text-xs">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.slice(0, 6).map((n) => (
                          <div
                            key={n.id}
                            onClick={() => {
                              nagpurDb.markNotificationAsRead(n.id);
                              refreshNotifs();
                            }}
                            className={`p-3 text-xs transition cursor-pointer hover:bg-slate-50 flex items-start gap-2.5 ${
                              !n.read_status ? "bg-orange-50/60 font-medium" : "text-slate-600"
                            }`}
                          >
                            <div className="mt-0.5 shrink-0">
                              {n.type === "follow_up" ? (
                                <Clock className="w-3.5 h-3.5 text-amber-600" />
                              ) : (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="text-slate-800 leading-snug">{n.message}</p>
                              <span className="text-[10px] text-slate-400 mt-1 block">
                                {new Date(n.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="p-2 border-t border-slate-100 bg-slate-50 text-center">
                      <Link
                        href={role === "admin" ? "/admin" : role === "agent" ? "/agent" : "/customer"}
                        onClick={() => setShowNotifs(false)}
                        className="text-xs text-slate-600 hover:text-orange-600 font-medium"
                      >
                        View your dashboard notifications →
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2">
            {isAuthenticated && user && (
              <div className="p-3 bg-slate-900 text-white rounded-xl mb-2 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold">{user.name}</div>
                  <div className="text-[10px] text-slate-400 capitalize">{role} • {user.email}</div>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <LogOut className="w-3 h-3" /> Logout
                </button>
              </div>
            )}
            <div className="p-2 bg-slate-50 rounded-xl mb-2 flex items-center justify-around text-xs font-bold">
              <Link href="/login/admin" onClick={() => setMobileMenuOpen(false)} className="text-slate-800">
                Admin Login
              </Link>
              <span className="text-slate-300">|</span>
              <Link href="/login/agent" onClick={() => setMobileMenuOpen(false)} className="text-emerald-700">
                Agent Login
              </Link>
              <span className="text-slate-300">|</span>
              <Link href="/login/customer" onClick={() => setMobileMenuOpen(false)} className="text-orange-600">
                Customer Login
              </Link>
            </div>

            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-100"
            >
              <Home className="w-4 h-4 text-slate-400" /> Home
            </Link>
            <Link
              href="/properties"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-100"
            >
              <Building2 className="w-4 h-4 text-slate-400" /> Browse Properties
            </Link>
            <Link
              href="/customer"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-100"
            >
              <User className="w-4 h-4 text-slate-400" /> Customer Portal
            </Link>
            <Link
              href="/agent"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-100"
            >
              <Building2 className="w-4 h-4 text-emerald-600" /> Agent Portal
            </Link>
            {isAuthenticated && role === "admin" && (
              <>
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-slate-900 text-white font-medium"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400" /> Admin Control Panel
                </Link>
                <Link
                  href="/admin?tab=database"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-emerald-800 bg-emerald-50 hover:bg-emerald-100 font-semibold border border-emerald-200"
                >
                  <Database className="w-4 h-4 text-emerald-600" /> Database & All Data Explorer
                </Link>
              </>
            )}
          </div>
        )}
      </header>
    </>
  );
}
