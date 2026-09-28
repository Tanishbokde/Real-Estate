"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { nagpurDb } from "@/lib/data/nagpur-mock-db";
import { useAuth } from "@/context/AuthContext";
import {
  Property,
  AgentBroker,
  Customer,
  Inquiry,
  VisitRequest,
  FollowUp,
  AuditLog,
  PropertyStatus,
  VisitStatus,
  InquiryStatus,
  FollowUpStatus
} from "@/lib/types/database";
import { formatINR, formatDate, formatDateTime, isMatchingId } from "@/lib/utils";
import { getSupabaseDashboardUrl } from "@/lib/supabase/client";
import { ScheduledVisitsModal } from "@/components/dashboard/ScheduledVisitsModal";
import { SupabaseConfigModal } from "@/components/dashboard/SupabaseConfigModal";
import {
  ShieldCheck,
  Building2,
  Users,
  Calendar,
  MessageSquare,
  Clock,
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  UserCheck,
  UserX,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  TrendingUp,
  AlertTriangle,
  Send,
  Eye,
  RotateCcw,
  BarChart3,
  PieChart,
  FileSpreadsheet,
  Award,
  Database,
  Server,
  ExternalLink,
  Table,
  Copy,
  Check,
  LogOut
} from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, role, isAuthenticated, isLoading, logout, switchUser } = useAuth();

  // Active sub-tab
  const [activeTab, setActiveTab] = useState<
    "properties" | "reports" | "agents" | "customers" | "inquiries_visits" | "followups" | "audit" | "database"
  >("properties");

  const [onboardedCreds, setOnboardedCreds] = useState<{
    name: string;
    email: string;
    password: string;
    agentId: string;
  } | null>(null);

  const [newCustomerCreds, setNewCustomerCreds] = useState<{
    name: string;
    email: string;
    phone: string;
    password: string;
    customerId: string;
  } | null>(null);

  // Auth guard: Redirect if not Super Admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || role !== "admin")) {
      router.replace("/login/admin?redirect=%2Fadmin");
    }
  }, [isLoading, isAuthenticated, role, router]);

  // Back button cache security: Force re-validation when returning via back button
  useEffect(() => {
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        window.location.reload();
      }
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  const [dbStatus, setDbStatus] = useState<{
    configured: boolean;
    connected: boolean;
    message: string;
    tableCounts?: Record<string, number>;
  } | null>(null);
  const [isSyncingDb, setIsSyncingDb] = useState(false);

  // Local state
  const [properties, setProperties] = useState<Property[]>([]);
  const [agents, setAgents] = useState<AgentBroker[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [visits, setVisits] = useState<VisitRequest[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Search filter inside admin tables
  const [adminSearch, setAdminSearch] = useState("");

  // Database Table Explorer state
  const [selectedDbTable, setSelectedDbTable] = useState<
    "properties" | "agents" | "customers" | "inquiries" | "visits" | "followups" | "audit"
  >("properties");
  const [dbTableSearch, setDbTableSearch] = useState("");
  const [copiedTable, setCopiedTable] = useState(false);

  // Modals state
  const [isAddPropertyOpen, setIsAddPropertyOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [isAddAgentOpen, setIsAddAgentOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<AgentBroker | null>(null);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [isScheduledVisitsOpen, setIsScheduledVisitsOpen] = useState(false);
  const [isSupabaseConfigOpen, setIsSupabaseConfigOpen] = useState(false);

  const loadData = () => {
    setProperties(nagpurDb.getProperties());
    setAgents(nagpurDb.getAgents());
    setCustomers(nagpurDb.getCustomers());
    setInquiries(nagpurDb.getInquiries());
    setVisits(nagpurDb.getVisitRequests());
    setFollowUps(nagpurDb.getFollowUps());
    setAuditLogs(nagpurDb.getAuditLogs());
  };

  const checkDatabaseStatus = async () => {
    try {
      const res = await fetch("/api/supabase/status");
      const data = await res.json();
      setDbStatus(data);
    } catch (e) {
      console.error("Failed to check Supabase health", e);
    }
  };

  const handleSyncWithSupabase = async () => {
    setIsSyncingDb(true);
    try {
      const res = await fetch("/api/supabase/sync", { method: "POST" });
      const data = await res.json();
      alert(data.message || "Synchronization completed");
      loadData();
      checkDatabaseStatus();
    } catch (e: any) {
      alert(`Sync failed: ${e.message}`);
    } finally {
      setIsSyncingDb(false);
    }
  };

  useEffect(() => {
    // Check if ?tab=database is in the URL to auto-redirect
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam && ["properties", "reports", "agents", "customers", "inquiries_visits", "followups", "audit", "database"].includes(tabParam)) {
        setActiveTab(tabParam as any);
      }
    }

    loadData();
    checkDatabaseStatus();
    // Background sync from Supabase if configured
    nagpurDb.syncFromSupabase().then(() => {
      loadData();
      checkDatabaseStatus();
    }).catch(() => {});

    const handleUpdate = () => {
      loadData();
      checkDatabaseStatus();
    };
    window.addEventListener("nagpur_db_updated", handleUpdate);
    return () => window.removeEventListener("nagpur_db_updated", handleUpdate);
  }, []);

  // Summary KPIs
  const totalProps = properties.length;
  const availableProps = properties.filter((p) => p.status === "available").length;
  const pendingProps = properties.filter((p) => p.status === "pending").length;
  const soldProps = properties.filter((p) => p.status === "sold").length;
  const rentedProps = properties.filter((p) => p.status === "rented").length;

  const totalCustomers = customers.length;
  const totalVisits = visits.length;
  const totalInquiries = inquiries.length;
  const pendingFollowUps = followUps.filter((f) => f.status === "pending").length;

  // Total Business Portfolio Value Calculation
  const totalPortfolioValue = properties.reduce((acc, p) => acc + (p.listing_type === "buy" ? p.price : 0), 0);

  // Run Follow-Up Automation Job
  const handleTriggerAutomation = () => {
    const result = nagpurDb.runFollowUpAutomation();
    loadData();
    alert(`Automation Run Complete!\nGenerated ${result.generatedCount} new follow-up leads and sent dual notifications to Admin & Customers.`);
  };

  // Property CRUD actions
  const handleDeleteProperty = (id: string, title: string) => {
    if (confirm(`Are you sure you want to permanently delete listing "${title}"?`)) {
      nagpurDb.deleteProperty(id);
      loadData();
    }
  };

  const handleStatusChange = (propId: string, status: PropertyStatus) => {
    nagpurDb.updateProperty(propId, { status });
    loadData();
  };

  const handleReassignAgent = (propId: string, newAgentId: string) => {
    nagpurDb.reassignPropertyAgent(propId, newAgentId);
    loadData();
  };

  // Agent actions
  const handleToggleAgentStatus = (agent: AgentBroker) => {
    nagpurDb.updateAgent(agent.id, { is_active: !agent.is_active });
    loadData();
  };

  const handleDeleteAgent = (agent: AgentBroker) => {
    if (confirm(`Are you sure you want to remove broker ${agent.name}? Active properties will be reallocated.`)) {
      const fallback = agents.find((a) => a.id !== agent.id);
      nagpurDb.deleteAgent(agent.id, fallback?.id);
      loadData();
    }
  };

  // Customer actions
  const handleToggleCustomerStatus = (cust: Customer) => {
    const nextStatus = cust.status === "active" ? "inactive" : "active";
    nagpurDb.updateCustomer(cust.id, { status: nextStatus });
    loadData();
  };

  // Visit oversight actions
  const handleVisitStatusChange = async (visitId: string, status: VisitStatus) => {
    const notes = `Updated by Admin (${user?.name || "Admin"})`;
    nagpurDb.updateVisitStatus(
      visitId,
      status,
      notes,
      undefined,
      user?.name || "Admin"
    );
    try {
      await fetch("/api/visits", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: visitId,
          status,
          agent_notes: notes,
          author_name: user?.name || "Admin"
        })
      });
    } catch (e) {
      console.warn("PUT /api/visits admin update error:", e);
    }
    loadData();
  };

  const handleReassignVisitAgent = (visitId: string, newAgentId: string) => {
    nagpurDb.reassignVisitAgent(visitId, newAgentId);
    loadData();
  };

  // Inquiry oversight
  const handleInquiryStatusChange = (inqId: string, status: InquiryStatus) => {
    nagpurDb.updateInquiryStatus(inqId, status, undefined, user?.name || "Admin");
    loadData();
  };

  // Follow-up resolve
  const handleResolveFollowUp = (fuId: string, status: FollowUpStatus) => {
    nagpurDb.resolveFollowUp(fuId, status, `Manually resolved by Admin (${user?.name || "Admin"})`);
    loadData();
  };

  // Reset database to initial seed
  const handleResetDb = () => {
    if (confirm("Reset all Nagpur properties, agents, inquiries, and follow-ups to initial demo state?")) {
      nagpurDb.resetToSeed();
      loadData();
      alert("Database successfully reset to pristine Nagpur seed data!");
    }
  };

  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-600">Verifying Super Admin credentials & session...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. ADMIN COMMAND HEADER */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-bold uppercase tracking-wider">
              Super Admin
            </span>
            <span className="text-xs text-slate-400">• Nagpur Platform Command</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-3">
            Admin Control Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            Platform management for all Nagpur properties, brokers, customer reports, inquiries, scheduled visits, and business analytics.
          </p>
        </div>

        {/* Action Controls in Header */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* SCHEDULED VISITS BUTTON (Direct user requirement) */}
          <button
            onClick={() => setIsScheduledVisitsOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-md transition cursor-pointer border border-blue-400/30"
            title="Click to see how many visits are scheduled and manage them"
          >
            <Calendar className="w-4 h-4 text-amber-300" />
            <span>Scheduled Visits</span>
            <span className="px-2 py-0.5 rounded-full bg-blue-950 text-amber-300 text-[11px] font-black border border-blue-400/40">
              {visits.filter(v => v.status === "pending" || v.status === "confirmed").length} Scheduled
            </span>
          </button>

          {/* DATABASE ICON REDIRECT BUTTON (Shows all website data) */}
          <button
            onClick={() => setActiveTab("database")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-extrabold text-xs shadow-md transition cursor-pointer"
            title="Database: Click to view all properties, agents, inquiries, visits, and tables"
          >
            <Database className="w-4 h-4 text-emerald-200" />
            <span>Database (All Data)</span>
            <span className={`w-2 h-2 rounded-full ${dbStatus?.connected ? "bg-emerald-300" : "bg-amber-300 animate-pulse"}`} />
          </button>

          {/* Connect Supabase Credentials Button */}
          <button
            onClick={() => setIsSupabaseConfigOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold transition cursor-pointer"
            title="Configure Supabase URL and Keys"
          >
            <span className={`w-2.5 h-2.5 rounded-full ${dbStatus?.connected ? "bg-emerald-400" : "bg-amber-400 animate-pulse"}`} />
            <span>{dbStatus?.connected ? "Supabase Connected" : "Connect Supabase"}</span>
          </button>

          {/* External Supabase Cloud Studio Link */}
          <a
            href={getSupabaseDashboardUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold transition cursor-pointer"
            title="Open Supabase Cloud Dashboard & Table Editor in a new tab"
          >
            <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
            <span>Open Supabase Cloud</span>
          </a>

          <button
            onClick={handleTriggerAutomation}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
            title="Scan 48h-72h views without inquiries and generate leads"
          >
            <Sparkles className="w-4 h-4" />
            Trigger 48h Follow-Up Scanner
          </button>

          <button
            onClick={handleResetDb}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            title="Reset to initial seed"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Data
          </button>

          <button
            onClick={async () => {
              await logout();
              router.push("/login/admin");
            }}
            className="px-4 py-2.5 bg-rose-950/80 hover:bg-rose-900 text-rose-200 hover:text-white border border-rose-800 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-md"
            title="Sign out of Super Admin session"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            Sign Out
          </button>
        </div>
      </div>

      {/* 2. EXECUTIVE KPI DASHBOARD & PROPERTY BREAKDOWN */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        {/* Total Properties */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Total Properties</span>
            <Building2 className="w-4 h-4 text-orange-600" />
          </div>
          <p className="text-3xl font-black text-slate-900">{totalProps}</p>
          <div className="text-[11px] text-slate-500">
            <span className="text-emerald-600 font-bold">{availableProps}</span> Avail •{" "}
            <span className="text-amber-600 font-bold">{pendingProps}</span> Pend
          </div>
        </div>

        {/* Portfolio Valuation */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Portfolio Value</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-600">{formatINR(totalPortfolioValue)}</p>
          <p className="text-[11px] text-slate-500">Nagpur real estate</p>
        </div>

        {/* Customers */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Customers</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-3xl font-black text-slate-900">{totalCustomers}</p>
          <p className="text-[11px] text-slate-500">Verified home seekers</p>
        </div>

        {/* Brokers / Agents */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Brokers</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-black text-slate-900">{agents.length}</p>
          <p className="text-[11px] text-slate-500">MahaRERA certified</p>
        </div>

        {/* Scheduled Visits Dedicated KPI Card */}
        <div
          onClick={() => setIsScheduledVisitsOpen(true)}
          className="p-5 bg-gradient-to-br from-blue-50/80 to-white rounded-2xl border border-blue-200 shadow-xs space-y-1.5 cursor-pointer hover:border-blue-400 hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between text-xs text-blue-900 font-bold">
            <span>Scheduled Visits</span>
            <Calendar className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-black text-blue-600">
              {visits.filter(v => v.status === "pending" || v.status === "confirmed").length}
            </p>
            <span className="text-[11px] text-slate-400 font-semibold">/ {visits.length} Total</span>
          </div>
          <div className="flex items-center justify-between text-[11px] font-semibold">
            <span className="text-amber-700">{visits.filter(v => v.status === "pending").length} Pending</span>
            <span className="text-emerald-700">{visits.filter(v => v.status === "confirmed").length} Confirmed</span>
          </div>
        </div>

        {/* Follow-Up Leads */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Auto Follow-Ups</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-3xl font-black text-amber-600">{pendingFollowUps}</p>
          <p className="text-[11px] text-slate-500">{followUps.length} total generated</p>
        </div>
      </div>

      {/* Property Status Breakdown Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-800">Nagpur Portfolio Inventory Breakdown</span>
          <span className="text-slate-500">{totalProps} Total Listings</span>
        </div>

        {/* Multi-segment Progress Bar */}
        <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
          <div
            style={{ width: `${(availableProps / (totalProps || 1)) * 100}%` }}
            className="bg-emerald-500 h-full transition-all"
            title={`Available: ${availableProps}`}
          />
          <div
            style={{ width: `${(pendingProps / (totalProps || 1)) * 100}%` }}
            className="bg-amber-500 h-full transition-all"
            title={`Pending: ${pendingProps}`}
          />
          <div
            style={{ width: `${(soldProps / (totalProps || 1)) * 100}%` }}
            className="bg-rose-500 h-full transition-all"
            title={`Sold: ${soldProps}`}
          />
          <div
            style={{ width: `${(rentedProps / (totalProps || 1)) * 100}%` }}
            className="bg-slate-600 h-full transition-all"
            title={`Rented: ${rentedProps}`}
          />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            <span className="text-slate-600 font-medium">
              Available: {availableProps} ({Math.round((availableProps / (totalProps || 1)) * 100)}%)
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            <span className="text-slate-600 font-medium">
              Pending: {pendingProps} ({Math.round((pendingProps / (totalProps || 1)) * 100)}%)
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500"></span>
            <span className="text-slate-600 font-medium">
              Sold: {soldProps} ({Math.round((soldProps / (totalProps || 1)) * 100)}%)
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-slate-600"></span>
            <span className="text-slate-600 font-medium">
              Rented: {rentedProps} ({Math.round((rentedProps / (totalProps || 1)) * 100)}%)
            </span>
          </div>
        </div>
      </div>

      {/* 3. ADMIN TABS NAVIGATION */}
      <div className="border-b border-slate-200">
        <div className="flex items-center gap-2 sm:gap-6 overflow-x-auto text-xs sm:text-sm font-semibold">
          <button
            onClick={() => setActiveTab("properties")}
            className={`py-3 border-b-2 transition whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === "properties"
                ? "border-orange-600 text-orange-600 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Building2 className="w-4 h-4" />
            Properties ({properties.length})
          </button>

          <button
            onClick={() => setActiveTab("reports")}
            className={`py-3 border-b-2 transition whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === "reports"
                ? "border-orange-600 text-orange-600 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Customer &amp; Business Reports
          </button>

          <button
            onClick={() => setActiveTab("agents")}
            className={`py-3 border-b-2 transition whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === "agents"
                ? "border-orange-600 text-orange-600 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Brokers &amp; Agents ({agents.length})
          </button>

          <button
            onClick={() => setActiveTab("customers")}
            className={`py-3 border-b-2 transition whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === "customers"
                ? "border-orange-600 text-orange-600 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Users className="w-4 h-4" />
            Customers ({customers.length})
          </button>

          <button
            onClick={() => setActiveTab("inquiries_visits")}
            className={`py-3 border-b-2 transition whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === "inquiries_visits"
                ? "border-orange-600 text-orange-600 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Calendar className="w-4 h-4" />
            Visits &amp; Inquiries Oversight ({visits.length + inquiries.length})
          </button>

          <button
            onClick={() => setActiveTab("followups")}
            className={`py-3 border-b-2 transition whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === "followups"
                ? "border-orange-600 text-orange-600 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Clock className="w-4 h-4" />
            Follow-Up Automation ({followUps.length})
          </button>

          <button
            onClick={() => setActiveTab("audit")}
            className={`py-3 border-b-2 transition whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === "audit"
                ? "border-orange-600 text-orange-600 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Live Audit Feed
          </button>

          <button
            onClick={() => setActiveTab("database")}
            className={`py-3 border-b-2 transition whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === "database"
                ? "border-orange-600 text-orange-600 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Database className="w-4 h-4" />
            Supabase Database
            <span className={`w-2 h-2 rounded-full ${dbStatus?.connected ? "bg-emerald-500" : "bg-amber-500 animate-pulse"}`}></span>
          </button>
        </div>
      </div>

      {/* 4. TAB CONTENTS */}

      {/* TAB 1: PROPERTIES (FULL CRUD + AGENT REASSIGNMENT) */}
      {activeTab === "properties" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter properties by title or locality..."
                value={adminSearch}
                onChange={(e) => setAdminSearch(e.target.value)}
                className="w-full text-xs pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
              />
            </div>

            <button
              onClick={() => setIsAddPropertyOpen(true)}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add New Listing
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Property / Locality</th>
                    <th className="p-3.5">Type &amp; Category</th>
                    <th className="p-3.5">Price (INR)</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Assigned Broker</th>
                    <th className="p-3.5 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {properties
                    .filter((p) =>
                      p.title.toLowerCase().includes(adminSearch.toLowerCase()) ||
                      p.locality.toLowerCase().includes(adminSearch.toLowerCase())
                    )
                    .map((prop) => {
                      return (
                        <tr key={prop.id} className="hover:bg-slate-50/80 transition">
                          <td className="p-3.5">
                            <div className="flex items-center gap-3">
                              <img
                                src={prop.images[0]}
                                alt={prop.title}
                                className="w-12 h-12 rounded-lg object-cover shrink-0"
                              />
                              <div>
                                <Link
                                  href={`/properties/${prop.id}`}
                                  className="font-bold text-slate-900 hover:text-orange-600 line-clamp-1"
                                >
                                  {prop.title}
                                </Link>
                                <p className="text-[11px] text-slate-500">
                                  {prop.locality}, Nagpur • {prop.area_sqft} sqft
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="p-3.5">
                            <span className="capitalize font-semibold text-slate-800">
                              {prop.listing_type} • {prop.type}
                            </span>
                            <p className="text-[10px] text-slate-400 capitalize">{prop.category} {prop.bhk ? `(${prop.bhk} BHK)` : ""}</p>
                          </td>

                          <td className="p-3.5 font-bold text-slate-900">
                            {formatINR(prop.price, prop.listing_type)}
                          </td>

                          <td className="p-3.5">
                            <select
                              value={prop.status}
                              onChange={(e) => handleStatusChange(prop.id, e.target.value as PropertyStatus)}
                              className="text-[11px] font-semibold px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 cursor-pointer"
                            >
                              <option value="available">Available</option>
                              <option value="pending">Pending</option>
                              <option value="sold">Sold</option>
                              <option value="rented">Rented</option>
                            </select>
                          </td>

                          <td className="p-3.5">
                            <select
                              value={prop.agent_id || ""}
                              onChange={(e) => handleReassignAgent(prop.id, e.target.value)}
                              className="text-[11px] font-medium p-1 bg-slate-50 border border-slate-200 rounded-lg max-w-[160px] truncate"
                              title="Reassign to another broker"
                            >
                              {agents.map((a) => (
                                <option key={a.id} value={a.id}>
                                  {a.name} ({a.agency})
                                </option>
                              ))}
                            </select>
                          </td>

                          <td className="p-3.5 text-right space-x-2">
                            <button
                              onClick={() => setEditingProperty(prop)}
                              className="p-1.5 text-slate-600 hover:text-orange-600 hover:bg-slate-100 rounded-lg transition"
                              title="Edit listing specs"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProperty(prop.id, prop.title)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="Delete listing"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CUSTOMER & BUSINESS REPORTS (Direct user requirement) */}
      {activeTab === "reports" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Customer Reports &amp; Business Intelligence
              </h2>
              <p className="text-xs text-slate-500">
                Detailed customer engagement reports, inventory valuations, and agent productivity metrics.
              </p>
            </div>
            <span className="text-xs bg-emerald-50 text-emerald-800 font-bold px-3 py-1 rounded-full border border-emerald-200">
              Live Business Analytics
            </span>
          </div>

          {/* Business Summary Metric Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-semibold text-slate-500">Inquiry-to-Visit Ratio</span>
              <p className="text-2xl font-black text-slate-900">
                {totalInquiries > 0 ? Math.round((totalVisits / totalInquiries) * 100) : 0}%
              </p>
              <p className="text-[11px] text-emerald-600 font-medium">Strong customer buying intent</p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-semibold text-slate-500">Visit Showing Completion Rate</span>
              <p className="text-2xl font-black text-slate-900">
                {totalVisits > 0 ? Math.round((visits.filter(v => v.status === "completed").length / totalVisits) * 100) : 0}%
              </p>
              <p className="text-[11px] text-blue-600 font-medium">Active broker site showings</p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-semibold text-slate-500">Follow-Up Lead Recovery</span>
              <p className="text-2xl font-black text-slate-900">
                {followUps.length > 0 ? Math.round((followUps.filter(f => f.status !== "pending").length / followUps.length) * 100) : 0}%
              </p>
              <p className="text-[11px] text-amber-600 font-medium">Leads addressed by brokers</p>
            </div>
          </div>

          {/* Customer Activity Report Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase text-slate-600 tracking-wider">
              Customer Engagement &amp; Inquiry Report
            </h3>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Customer Name</th>
                    <th className="p-3.5">Phone &amp; Email</th>
                    <th className="p-3.5">Views Logged</th>
                    <th className="p-3.5">Inquiries Sent</th>
                    <th className="p-3.5">Visits Scheduled</th>
                    <th className="p-3.5">Preferred Localities</th>
                    <th className="p-3.5">Account Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {customers.map((c) => {
                    const custViews = nagpurDb.getPropertyViews().filter((v) => v.customer_id === c.id);
                    const custInqs = inquiries.filter((i) => i.customer_id === c.id);
                    const custVisits = visits.filter((v) => v.customer_id === c.id);

                    return (
                      <tr key={c.id} className="hover:bg-slate-50 transition">
                        <td className="p-3.5 font-bold text-slate-900">{c.name}</td>
                        <td className="p-3.5 text-slate-600">{c.phone}<br/><span className="text-[10px] text-slate-400">{c.email}</span></td>
                        <td className="p-3.5 font-bold text-slate-800">{custViews.length} views</td>
                        <td className="p-3.5 font-bold text-emerald-700">{custInqs.length} inq</td>
                        <td className="p-3.5 font-bold text-blue-700">{custVisits.length} visits</td>
                        <td className="p-3.5 text-slate-600 text-[11px]">
                          {c.preferences?.preferred_localities?.join(", ") || "All Areas"}
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                            c.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                          }`}>
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Broker Performance Report Table */}
          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-bold uppercase text-slate-600 tracking-wider">
              Agent &amp; Broker Productivity Leaderboard
            </h3>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Broker Name &amp; Agency</th>
                    <th className="p-3.5">Area Specialization</th>
                    <th className="p-3.5">Active Listings</th>
                    <th className="p-3.5">Customer Showings Conducted</th>
                    <th className="p-3.5">Rating</th>
                    <th className="p-3.5">Total Deals Closed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {agents.map((ag) => {
                    const agentProps = properties.filter((p) => p.agent_id === ag.id);
                    const agentCompletedVisits = visits.filter((v) => v.agent_id === ag.id && v.status === "completed");

                    return (
                      <tr key={ag.id} className="hover:bg-slate-50 transition">
                        <td className="p-3.5">
                          <p className="font-bold text-slate-900">{ag.name}</p>
                          <p className="text-[11px] text-slate-500">{ag.agency}</p>
                        </td>
                        <td className="p-3.5 text-slate-700">{ag.area_specialization}</td>
                        <td className="p-3.5 font-bold text-orange-600">{agentProps.length} properties</td>
                        <td className="p-3.5 font-bold text-emerald-700">{agentCompletedVisits.length} shown</td>
                        <td className="p-3.5 font-bold text-amber-600">★ {ag.rating}</td>
                        <td className="p-3.5 font-bold text-slate-900">{ag.total_deals} deals</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BROKERS & AGENTS */}
      {activeTab === "agents" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Local Brokers &amp; Agents Management</h2>
              <p className="text-xs text-slate-500">
                Onboard, edit, manage, or remove agents and reassign their property portfolios.
              </p>
            </div>
            <button
              onClick={() => setIsAddAgentOpen(true)}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Onboard Agent
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {agents.map((agent) => {
              const assignedProps = properties.filter((p) => p.agent_id === agent.id);

              return (
                <div key={agent.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white font-bold text-sm flex items-center justify-center shadow-sm">
                        {agent.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 text-sm">{agent.name}</h3>
                          <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                            agent.is_active ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                          }`}>
                            {agent.is_active ? "Active" : "Suspended"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">{agent.agency}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingAgent(agent)}
                        className="p-1.5 text-slate-500 hover:text-orange-600 rounded-lg hover:bg-slate-100"
                        title="Edit agent profile"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteAgent(agent)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                        title="Delete agent"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1">
                    <p className="text-slate-600">
                      <strong>Specialization:</strong> {agent.area_specialization}
                    </p>
                    <p className="text-slate-600">
                      <strong>Contact:</strong> {agent.phone} • {agent.email}
                    </p>
                    <p className="text-slate-600">
                      <strong>RERA License:</strong> {agent.license_no || "Registered"}
                    </p>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 font-medium">
                      <span>Rating: ★ {agent.rating} ({agent.total_deals} deals)</span>
                      <span className="text-orange-600 font-bold">{assignedProps.length} Active Listings</span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs">
                    <button
                      onClick={() => handleToggleAgentStatus(agent)}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                        agent.is_active
                          ? "bg-rose-50 text-rose-700 hover:bg-rose-100"
                          : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      }`}
                    >
                      {agent.is_active ? "Suspend Account" : "Reactivate Account"}
                    </button>
                    <button
                      onClick={() => {
                        const targetId = prompt("Reassign all properties to Agent ID:", agents.find(a => a.id !== agent.id)?.id || "");
                        if (targetId) {
                          properties.forEach(p => {
                            if (p.agent_id === agent.id) nagpurDb.reassignPropertyAgent(p.id, targetId);
                          });
                          loadData();
                          alert("All listings reassigned!");
                        }
                      }}
                      className="text-slate-600 hover:text-orange-600 font-semibold"
                    >
                      Reassign Portfolio →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: CUSTOMERS */}
      {activeTab === "customers" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Registered Customers ({customers.length})</h2>
              <p className="text-xs text-slate-500">
                View customer profiles, verify preferences, view property view logs, and manage account statuses.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAddCustomerOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" /> Add New Customer
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Customer Name</th>
                  <th className="p-3.5">Contact Details</th>
                  <th className="p-3.5">Preferences</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Joined</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((cust) => {
                  const custViews = nagpurDb.getPropertyViews().filter((v) => isMatchingId(v.customer_id, cust.id));

                  return (
                    <tr key={cust.id} className="hover:bg-slate-50 transition">
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-800 font-bold flex items-center justify-center">
                            {cust.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900">{cust.name}</span>
                            <span className="text-[10px] text-slate-400 block">{custViews.length} property views</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 text-slate-700">
                        <p>{cust.phone}</p>
                        <p className="text-[11px] text-slate-400">{cust.email}</p>
                      </td>
                      <td className="p-3.5 text-slate-600">
                        {cust.preferences ? (
                          <div className="max-w-xs text-[11px]">
                            <span>Budget: {formatINR(cust.preferences.budget_min || 0)} - {formatINR(cust.preferences.budget_max || 0)}</span>
                            {cust.preferences.preferred_localities && (
                              <p className="text-slate-400 truncate">
                                Localities: {cust.preferences.preferred_localities.join(", ")}
                              </p>
                            )}
                          </div>
                        ) : (
                          "General"
                        )}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                          cust.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                        }`}>
                          {cust.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-500">
                        {formatDate(cust.created_at)}
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleToggleCustomerStatus(cust)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                            cust.status === "active"
                              ? "bg-rose-50 text-rose-700 hover:bg-rose-100"
                              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          }`}
                        >
                          {cust.status === "active" ? "Deactivate" : "Reactivate"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: VISITS & INQUIRIES OVERSIGHT */}
      {activeTab === "inquiries_visits" && (
        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Site Visits Oversight ({visits.length})
            </h3>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Customer</th>
                    <th className="p-3.5">Property</th>
                    <th className="p-3.5">Date &amp; Slot</th>
                    <th className="p-3.5">Assigned Agent</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Admin Override</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visits.map((v) => {
                    const cust = customers.find((c) => isMatchingId(c.id, v.customer_id));
                    const prop = properties.find((p) => isMatchingId(p.id, v.property_id));

                    return (
                      <tr key={v.id} className="hover:bg-slate-50 transition">
                        <td className="p-3.5 font-bold text-slate-900">{cust?.name || v.customer_id}</td>
                        <td className="p-3.5">
                          <Link href={`/properties/${v.property_id}`} className="font-semibold text-slate-800 hover:text-orange-600 line-clamp-1">
                            {prop?.title || v.property_id}
                          </Link>
                          <span className="text-[10px] text-slate-400">{prop?.locality}</span>
                        </td>
                        <td className="p-3.5 text-slate-700">
                          <p className="font-semibold">{v.scheduled_date}</p>
                          <p className="text-[10px] text-slate-400">{v.time_slot}</p>
                        </td>
                        <td className="p-3.5">
                          <select
                            value={v.agent_id || ""}
                            onChange={(e) => handleReassignVisitAgent(v.id, e.target.value)}
                            className="p-1 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                          >
                            {agents.map((a) => (
                              <option key={a.id} value={a.id}>
                                {a.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-3.5">
                          <select
                            value={v.status}
                            onChange={(e) => handleVisitStatusChange(v.id, e.target.value as VisitStatus)}
                            className="p-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold capitalize"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => handleVisitStatusChange(v.id, "confirmed")}
                            className="px-2 py-1 bg-emerald-50 text-emerald-700 font-semibold rounded hover:bg-emerald-100 transition mr-1"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleVisitStatusChange(v.id, "cancelled")}
                            className="px-2 py-1 bg-rose-50 text-rose-700 font-semibold rounded hover:bg-rose-100 transition"
                          >
                            Close
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Customer Inquiries Oversight ({inquiries.length})
            </h3>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Customer</th>
                    <th className="p-3.5">Property</th>
                    <th className="p-3.5">Message / Inquiry</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Admin Reply / Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {inquiries.map((inq) => {
                    const cust = customers.find((c) => isMatchingId(c.id, inq.customer_id));
                    const prop = properties.find((p) => isMatchingId(p.id, inq.property_id));

                    return (
                      <tr key={inq.id} className="hover:bg-slate-50 transition">
                        <td className="p-3.5 font-bold text-slate-900">{cust?.name || inq.customer_id}</td>
                        <td className="p-3.5">
                          <Link href={`/properties/${inq.property_id}`} className="font-semibold text-slate-800 hover:text-orange-600 line-clamp-1">
                            {prop?.title || inq.property_id}
                          </Link>
                        </td>
                        <td className="p-3.5 text-slate-700 max-w-sm">
                          <p className="line-clamp-2">&ldquo;{inq.message}&rdquo;</p>
                          {inq.agent_reply && (
                            <p className="text-emerald-700 text-[10px] mt-1 font-medium">
                              Reply: {inq.agent_reply}
                            </p>
                          )}
                        </td>
                        <td className="p-3.5">
                          <select
                            value={inq.status}
                            onChange={(e) => handleInquiryStatusChange(inq.id, e.target.value as InquiryStatus)}
                            className="p-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold capitalize"
                          >
                            <option value="new">New</option>
                            <option value="in_progress">In Progress</option>
                            <option value="contacted">Contacted</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                          </select>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => {
                              const reply = prompt("Enter reply to customer on behalf of broker:", inq.agent_reply || "");
                              if (reply) {
                                nagpurDb.updateInquiryStatus(inq.id, "resolved", reply);
                                loadData();
                              }
                            }}
                            className="px-2.5 py-1 bg-slate-900 text-white font-semibold rounded hover:bg-slate-800 text-xs"
                          >
                            Reply
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: FOLLOW-UP AUTOMATION CENTER */}
      {activeTab === "followups" && (
        <div className="space-y-4">
          <div className="bg-amber-50/70 border border-amber-200 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-bold text-amber-900 text-sm flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-700" />
                48–72 Hour Automated Lead Conversion Engine
              </h3>
              <p className="text-xs text-amber-800 leading-relaxed max-w-2xl">
                The platform monitors <code>property_views</code>. If a customer views a property and takes no action within 48 hours, the system creates an automated follow-up row and triggers dual notifications.
              </p>
            </div>

            <button
              onClick={handleTriggerAutomation}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition shrink-0"
            >
              Run Automation Scanner Now
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Target Customer</th>
                  <th className="p-3.5">Viewed Property</th>
                  <th className="p-3.5">Triggered Time</th>
                  <th className="p-3.5">Notification Status</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Admin Resolution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {followUps.map((fu) => {
                  const cust = customers.find((c) => c.id === fu.customer_id);
                  const prop = properties.find((p) => p.id === fu.property_id);

                  return (
                    <tr key={fu.id} className="hover:bg-slate-50 transition">
                      <td className="p-3.5">
                        <p className="font-bold text-slate-900">{cust?.name || fu.customer_id}</p>
                        <p className="text-[10px] text-slate-400">{cust?.phone}</p>
                      </td>
                      <td className="p-3.5">
                        <Link href={`/properties/${fu.property_id}`} className="font-semibold text-slate-800 hover:text-orange-600 line-clamp-1">
                          {prop?.title || fu.property_id}
                        </Link>
                        <span className="text-[10px] text-orange-600 font-semibold">{prop?.locality}</span>
                      </td>
                      <td className="p-3.5 text-slate-500">
                        {formatDateTime(fu.triggered_at)}
                      </td>
                      <td className="p-3.5">
                        <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                          ✓ Dual Notified
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                          fu.status === "pending"
                            ? "bg-amber-100 text-amber-800"
                            : fu.status === "converted"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-700"
                        }`}>
                          {fu.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-1.5">
                        {fu.status === "pending" ? (
                          <>
                            <button
                              onClick={() => handleResolveFollowUp(fu.id, "contacted")}
                              className="px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded font-semibold text-xs"
                            >
                              Contacted
                            </button>
                            <button
                              onClick={() => handleResolveFollowUp(fu.id, "converted")}
                              className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded font-semibold text-xs"
                            >
                              Converted
                            </button>
                            <button
                              onClick={() => handleResolveFollowUp(fu.id, "dismissed")}
                              className="px-2 py-1 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded font-medium text-xs"
                            >
                              Dismiss
                            </button>
                          </>
                        ) : (
                          <span className="text-[11px] text-slate-400">Resolved ({fu.status})</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: SYSTEM AUDIT TRAIL */}
      {activeTab === "audit" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Chronological System Audit Feed</h2>
              <p className="text-xs text-slate-500">
                Auditing every create, update, approval, visit request, and follow-up across Nagpur users.
              </p>
            </div>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full font-semibold">
              {auditLogs.length} Events Logged
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-3 flex items-start justify-between gap-4 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{log.user_name}</span>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                      {log.role}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="font-semibold text-orange-600">{log.action}</span>
                  </div>
                  <p className="text-slate-600">{log.details}</p>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0">
                  {formatDateTime(log.timestamp)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: SUPABASE DATABASE & REAL-TIME SYNC */}
      {activeTab === "database" && (
        <div className="space-y-6">
          {/* Connection Status Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl ${dbStatus?.connected ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900">Supabase PostgreSQL Connection</h2>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                      dbStatus?.connected ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                    }`}>
                      {dbStatus?.connected ? "Live Connected" : "Local Storage Active"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {dbStatus?.message || "Status check in progress..."}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={checkDatabaseStatus}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Test Connection
                </button>

                <button
                  onClick={handleSyncWithSupabase}
                  disabled={isSyncingDb}
                  className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Database className="w-3.5 h-3.5" />
                  {isSyncingDb ? "Synchronizing..." : "Sync from Supabase"}
                </button>
              </div>
            </div>

            {/* Supabase Table Metrics Grid */}
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Connected Supabase Tables &amp; Record Counts
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                    <span>properties</span>
                    <Building2 className="w-3.5 h-3.5 text-orange-600" />
                  </div>
                  <p className="text-2xl font-black text-slate-900">
                    {dbStatus?.tableCounts?.properties ?? properties.length}
                  </p>
                  <p className="text-[10px] text-slate-400">Nagpur listings</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                    <span>agents_brokers</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <p className="text-2xl font-black text-slate-900">
                    {dbStatus?.tableCounts?.agents ?? agents.length}
                  </p>
                  <p className="text-[10px] text-slate-400">MahaRERA brokers</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                    <span>customers</span>
                    <Users className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <p className="text-2xl font-black text-slate-900">
                    {dbStatus?.tableCounts?.customers ?? customers.length}
                  </p>
                  <p className="text-[10px] text-slate-400">Registered seekers</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                    <span>inquiries</span>
                    <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
                  </div>
                  <p className="text-2xl font-black text-slate-900">
                    {dbStatus?.tableCounts?.inquiries ?? inquiries.length}
                  </p>
                  <p className="text-[10px] text-slate-400">Customer threads</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                    <span>visit_requests</span>
                    <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                  <p className="text-2xl font-black text-slate-900">
                    {dbStatus?.tableCounts?.visits ?? visits.length}
                  </p>
                  <p className="text-[10px] text-slate-400">Scheduled tours</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                    <span>locations</span>
                    <Server className="w-3.5 h-3.5 text-indigo-600" />
                  </div>
                  <p className="text-2xl font-black text-slate-900">
                    {dbStatus?.tableCounts?.localities ?? 21}
                  </p>
                  <p className="text-[10px] text-slate-400">Nagpur areas</p>
                </div>
              </div>
            </div>

            {/* LIVE DATA EXPLORER (ALL WEBSITE DATA) */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-lg font-bold text-slate-900">
                      All Website Database Records Explorer
                    </h3>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Live Data
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Inspect all tables, rows, columns, and data currently stored in your website&apos;s database.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => {
                      let dataToCopy: any = [];
                      if (selectedDbTable === "properties") dataToCopy = properties;
                      else if (selectedDbTable === "agents") dataToCopy = agents;
                      else if (selectedDbTable === "customers") dataToCopy = customers;
                      else if (selectedDbTable === "inquiries") dataToCopy = inquiries;
                      else if (selectedDbTable === "visits") dataToCopy = visits;
                      else if (selectedDbTable === "followups") dataToCopy = followUps;
                      else if (selectedDbTable === "audit") dataToCopy = auditLogs;
                      navigator.clipboard.writeText(JSON.stringify(dataToCopy, null, 2));
                      setCopiedTable(true);
                      setTimeout(() => setCopiedTable(false), 2000);
                    }}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                    title="Copy selected table records as JSON"
                  >
                    {copiedTable ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedTable ? "Copied JSON!" : "Copy Table JSON"}</span>
                  </button>

                  <a
                    href={getSupabaseDashboardUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                    title="Open Supabase Cloud Studio Table Editor"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open in Supabase Cloud</span>
                  </a>
                </div>
              </div>

              {/* Table Selector Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {[
                  { id: "properties", label: "public.properties", count: properties.length },
                  { id: "agents", label: "public.agents_brokers", count: agents.length },
                  { id: "customers", label: "public.customers", count: customers.length },
                  { id: "inquiries", label: "public.inquiries", count: inquiries.length },
                  { id: "visits", label: "public.visit_requests", count: visits.length },
                  { id: "followups", label: "public.follow_ups", count: followUps.length },
                  { id: "audit", label: "public.audit_logs", count: auditLogs.length }
                ].map((tbl) => (
                  <button
                    key={tbl.id}
                    onClick={() => {
                      setSelectedDbTable(tbl.id as any);
                      setDbTableSearch("");
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      selectedDbTable === tbl.id
                        ? "bg-emerald-700 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <span>{tbl.label}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      selectedDbTable === tbl.id ? "bg-emerald-900 text-emerald-200" : "bg-slate-200 text-slate-700"
                    }`}>
                      {tbl.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Table Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={dbTableSearch}
                  onChange={(e) => setDbTableSearch(e.target.value)}
                  placeholder={`Search in ${selectedDbTable} (title, ID, locality, status, etc.)...`}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              {/* Data Table Container */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                <div className="max-h-96 overflow-x-auto overflow-y-auto divide-y divide-slate-100">
                  {/* 1. PROPERTIES TABLE */}
                  {selectedDbTable === "properties" && (
                    <table className="min-w-full text-left text-xs divide-y divide-slate-200">
                      <thead className="bg-slate-50 sticky top-0 z-10 text-slate-600 font-bold">
                        <tr>
                          <th className="p-3">ID</th>
                          <th className="p-3">Title</th>
                          <th className="p-3">Locality</th>
                          <th className="p-3">Type</th>
                          <th className="p-3">BHK</th>
                          <th className="p-3">Price</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Agent</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {properties
                          .filter((p) => {
                            const q = dbTableSearch.toLowerCase();
                            return !q || p.title.toLowerCase().includes(q) || p.locality.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.status.toLowerCase().includes(q);
                          })
                          .map((p) => (
                            <tr key={p.id} className="hover:bg-slate-50/80 transition">
                              <td className="p-3 font-mono text-[11px] text-slate-500">{p.id}</td>
                              <td className="p-3 font-semibold text-slate-900">{p.title}</td>
                              <td className="p-3 text-slate-600">{p.locality}</td>
                              <td className="p-3 uppercase text-[10px] font-bold text-slate-500">{p.type} • {p.listing_type}</td>
                              <td className="p-3 text-slate-700">{p.bhk ? `${p.bhk} BHK` : "Plot/Land"}</td>
                              <td className="p-3 font-bold text-emerald-700">{formatINR(p.price)}</td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  p.status === "available" ? "bg-emerald-100 text-emerald-800" :
                                  p.status === "pending" ? "bg-amber-100 text-amber-800" :
                                  p.status === "sold" ? "bg-rose-100 text-rose-800" : "bg-slate-100 text-slate-700"
                                }`}>
                                  {p.status}
                                </span>
                              </td>
                              <td className="p-3 text-slate-500 font-mono text-[10px]">{p.agent_id || "Unassigned"}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  )}

                  {/* 2. AGENTS TABLE */}
                  {selectedDbTable === "agents" && (
                    <table className="min-w-full text-left text-xs divide-y divide-slate-200">
                      <thead className="bg-slate-50 sticky top-0 z-10 text-slate-600 font-bold">
                        <tr>
                          <th className="p-3">ID</th>
                          <th className="p-3">Agent Name</th>
                          <th className="p-3">Agency</th>
                          <th className="p-3">Phone</th>
                          <th className="p-3">Email</th>
                          <th className="p-3">MahaRERA No</th>
                          <th className="p-3">Rating</th>
                          <th className="p-3">Deals</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {agents
                          .filter((a) => {
                            const q = dbTableSearch.toLowerCase();
                            return !q || a.name.toLowerCase().includes(q) || a.agency.toLowerCase().includes(q) || a.email.toLowerCase().includes(q) || a.id.toLowerCase().includes(q);
                          })
                          .map((a) => (
                            <tr key={a.id} className="hover:bg-slate-50/80 transition">
                              <td className="p-3 font-mono text-[11px] text-slate-500">{a.id}</td>
                              <td className="p-3 font-semibold text-slate-900">{a.name}</td>
                              <td className="p-3 text-slate-600">{a.agency}</td>
                              <td className="p-3 text-slate-600">{a.phone}</td>
                              <td className="p-3 text-slate-600">{a.email}</td>
                              <td className="p-3 font-mono text-[10px] text-slate-500">{a.license_no}</td>
                              <td className="p-3 font-bold text-amber-600">★ {a.rating}</td>
                              <td className="p-3 font-bold text-slate-800">{a.total_deals}</td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  a.is_active ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                                }`}>
                                  {a.is_active ? "Active" : "Inactive"}
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  )}

                  {/* 3. CUSTOMERS TABLE */}
                  {selectedDbTable === "customers" && (
                    <table className="min-w-full text-left text-xs divide-y divide-slate-200">
                      <thead className="bg-slate-50 sticky top-0 z-10 text-slate-600 font-bold">
                        <tr>
                          <th className="p-3">ID</th>
                          <th className="p-3">Customer Name</th>
                          <th className="p-3">Phone</th>
                          <th className="p-3">Email</th>
                          <th className="p-3">Budget Range</th>
                          <th className="p-3">Preferred Localities</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {customers
                          .filter((c) => {
                            const q = dbTableSearch.toLowerCase();
                            return !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q);
                          })
                          .map((c) => (
                            <tr key={c.id} className="hover:bg-slate-50/80 transition">
                              <td className="p-3 font-mono text-[11px] text-slate-500">{c.id}</td>
                              <td className="p-3 font-semibold text-slate-900">{c.name}</td>
                              <td className="p-3 text-slate-600">{c.phone}</td>
                              <td className="p-3 text-slate-600">{c.email}</td>
                              <td className="p-3 font-medium text-slate-800">
                                {formatINR(c.preferences?.budget_min || 0)} - {formatINR(c.preferences?.budget_max || 0)}
                              </td>
                              <td className="p-3 text-slate-600">
                                {c.preferences?.preferred_localities?.join(", ") || "All Nagpur"}
                              </td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  c.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                                }`}>
                                  {c.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  )}

                  {/* 4. INQUIRIES TABLE */}
                  {selectedDbTable === "inquiries" && (
                    <table className="min-w-full text-left text-xs divide-y divide-slate-200">
                      <thead className="bg-slate-50 sticky top-0 z-10 text-slate-600 font-bold">
                        <tr>
                          <th className="p-3">Inquiry ID</th>
                          <th className="p-3">Property ID</th>
                          <th className="p-3">Customer Name</th>
                          <th className="p-3">Customer Message</th>
                          <th className="p-3">Broker Reply</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {inquiries
                          .filter((i) => {
                            const q = dbTableSearch.toLowerCase();
                            const custName = customers.find((c) => c.id === i.customer_id)?.name || "";
                            return !q || i.id.toLowerCase().includes(q) || i.message.toLowerCase().includes(q) || custName.toLowerCase().includes(q);
                          })
                          .map((i) => {
                            const custName = customers.find((c) => c.id === i.customer_id)?.name || i.customer_id;
                            return (
                              <tr key={i.id} className="hover:bg-slate-50/80 transition">
                                <td className="p-3 font-mono text-[11px] text-slate-500">{i.id}</td>
                                <td className="p-3 font-mono text-[11px] text-orange-600">{i.property_id}</td>
                                <td className="p-3 font-semibold text-slate-900">{custName}</td>
                                <td className="p-3 text-slate-700 max-w-xs truncate">{i.message}</td>
                                <td className="p-3 text-slate-600 max-w-xs truncate">{i.agent_reply || "Awaiting reply"}</td>
                                <td className="p-3">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                    i.status === "new" ? "bg-blue-100 text-blue-800" :
                                    i.status === "in_progress" ? "bg-amber-100 text-amber-800" :
                                    i.status === "resolved" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                                  }`}>
                                    {i.status}
                                  </span>
                                </td>
                                <td className="p-3 text-slate-400 text-[10px]">{formatDate(i.created_at)}</td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  )}

                  {/* 5. VISITS TABLE */}
                  {selectedDbTable === "visits" && (
                    <table className="min-w-full text-left text-xs divide-y divide-slate-200">
                      <thead className="bg-slate-50 sticky top-0 z-10 text-slate-600 font-bold">
                        <tr>
                          <th className="p-3">Visit ID</th>
                          <th className="p-3">Property ID</th>
                          <th className="p-3">Customer Name</th>
                          <th className="p-3">Scheduled Date</th>
                          <th className="p-3">Time Slot</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {visits
                          .filter((v) => {
                            const q = dbTableSearch.toLowerCase();
                            const custName = customers.find((c) => c.id === v.customer_id)?.name || "";
                            return !q || v.id.toLowerCase().includes(q) || custName.toLowerCase().includes(q) || v.scheduled_date.includes(q);
                          })
                          .map((v) => {
                            const custName = customers.find((c) => c.id === v.customer_id)?.name || v.customer_id;
                            return (
                              <tr key={v.id} className="hover:bg-slate-50/80 transition">
                                <td className="p-3 font-mono text-[11px] text-slate-500">{v.id}</td>
                                <td className="p-3 font-mono text-[11px] text-orange-600">{v.property_id}</td>
                                <td className="p-3 font-semibold text-slate-900">{custName}</td>
                                <td className="p-3 font-medium text-slate-800">{v.scheduled_date}</td>
                                <td className="p-3 text-slate-600">{v.time_slot}</td>
                                <td className="p-3">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                    v.status === "confirmed" ? "bg-emerald-100 text-emerald-800" :
                                    v.status === "pending" ? "bg-amber-100 text-amber-800" :
                                    v.status === "completed" ? "bg-blue-100 text-blue-800" : "bg-rose-100 text-rose-800"
                                  }`}>
                                    {v.status}
                                  </span>
                                </td>
                                <td className="p-3 text-slate-500">{v.notes || "—"}</td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  )}

                  {/* 6. FOLLOW-UPS TABLE */}
                  {selectedDbTable === "followups" && (
                    <table className="min-w-full text-left text-xs divide-y divide-slate-200">
                      <thead className="bg-slate-50 sticky top-0 z-10 text-slate-600 font-bold">
                        <tr>
                          <th className="p-3">Follow-Up ID</th>
                          <th className="p-3">Customer ID</th>
                          <th className="p-3">Property ID</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Trigger Reason</th>
                          <th className="p-3">Created</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {followUps
                          .filter((f) => {
                            const q = dbTableSearch.toLowerCase();
                            return !q || f.id.toLowerCase().includes(q) || f.customer_id.toLowerCase().includes(q) || f.property_id.toLowerCase().includes(q);
                          })
                          .map((f) => (
                            <tr key={f.id} className="hover:bg-slate-50/80 transition">
                              <td className="p-3 font-mono text-[11px] text-slate-500">{f.id}</td>
                              <td className="p-3 font-semibold text-slate-900">{f.customer_id}</td>
                              <td className="p-3 font-mono text-[11px] text-orange-600">{f.property_id}</td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  f.status === "pending" ? "bg-amber-100 text-amber-800" :
                                  f.status === "contacted" ? "bg-blue-100 text-blue-800" : "bg-emerald-100 text-emerald-800"
                                }`}>
                                  {f.status}
                                </span>
                              </td>
                              <td className="p-3 text-slate-600">{f.resolution_notes || "48h unengaged view scan"}</td>
                              <td className="p-3 text-slate-400 text-[10px]">{formatDateTime(f.triggered_at)}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  )}

                  {/* 7. AUDIT LOGS TABLE */}
                  {selectedDbTable === "audit" && (
                    <table className="min-w-full text-left text-xs divide-y divide-slate-200">
                      <thead className="bg-slate-50 sticky top-0 z-10 text-slate-600 font-bold">
                        <tr>
                          <th className="p-3">Timestamp</th>
                          <th className="p-3">User</th>
                          <th className="p-3">Role</th>
                          <th className="p-3">Action</th>
                          <th className="p-3">Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {auditLogs
                          .filter((l) => {
                            const q = dbTableSearch.toLowerCase();
                            return !q || l.user_name.toLowerCase().includes(q) || l.action.toLowerCase().includes(q) || l.details.toLowerCase().includes(q);
                          })
                          .map((l) => (
                            <tr key={l.id} className="hover:bg-slate-50/80 transition">
                              <td className="p-3 text-slate-400 text-[10px] whitespace-nowrap">{formatDateTime(l.timestamp)}</td>
                              <td className="p-3 font-semibold text-slate-900">{l.user_name}</td>
                              <td className="p-3 uppercase text-[10px] font-bold text-slate-500">{l.role}</td>
                              <td className="p-3 font-semibold text-orange-600">{l.action}</td>
                              <td className="p-3 text-slate-700">{l.details}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>

            {/* Verification Guide & File Locations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
              <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  How to Verify in Your Supabase Dashboard
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-slate-600 leading-relaxed">
                  <li>
                    Open your project at <strong>supabase.com/dashboard</strong>.
                  </li>
                  <li>
                    Click on <strong>Table Editor</strong> in the left navigation.
                  </li>
                  <li>
                    Select <strong>public.properties</strong> to see live property listings.
                  </li>
                  <li>
                    Select <strong>public.visit_requests</strong> or <strong>public.inquiries</strong> to see live submissions made from the website.
                  </li>
                  <li>
                    Any property added or edited in this Admin Panel syncs directly to Supabase!
                  </li>
                </ol>
              </div>

              <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Server className="w-4 h-4 text-orange-600" />
                  Database Configuration &amp; SQL Files
                </h4>
                <ul className="space-y-2 text-slate-600">
                  <li className="flex items-start justify-between gap-2">
                    <span><strong>Environment Variables:</strong> .env.local</span>
                    <span className="text-[11px] text-slate-400 shrink-0">NEXT_PUBLIC_SUPABASE_URL</span>
                  </li>
                  <li className="flex items-start justify-between gap-2">
                    <span><strong>Complete Schema Migration:</strong> supabase/migrations/20240101000000_init_schema.sql</span>
                    <span className="text-[11px] text-emerald-600 font-bold shrink-0">11 Tables + RLS</span>
                  </li>
                  <li className="flex items-start justify-between gap-2">
                    <span><strong>RLS &amp; Realtime Patch:</strong> supabase/migrations/20240101000001_fix_rls_and_realtime.sql</span>
                    <span className="text-[11px] text-blue-600 font-bold shrink-0">Permissive RLS</span>
                  </li>
                  <li className="flex items-start justify-between gap-2">
                    <span><strong>Nagpur Seed Dataset:</strong> supabase/seed.sql</span>
                    <span className="text-[11px] text-slate-400 shrink-0">21 Localities, Brokers</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT PROPERTY */}
      {(isAddPropertyOpen || editingProperty) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200 my-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                {editingProperty ? "Edit Nagpur Property" : "Add New Property Listing"}
              </h3>
              <button
                onClick={() => {
                  setIsAddPropertyOpen(false);
                  setEditingProperty(null);
                }}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const title = formData.get("title") as string;
                const locality = formData.get("locality") as string;
                const price = Number(formData.get("price"));
                const price_range = formData.get("price_range") as string;
                const area_sqft = Number(formData.get("area_sqft"));
                const bhk = formData.get("bhk") ? Number(formData.get("bhk")) : null;
                const listing_type = formData.get("listing_type") as any;
                const type = formData.get("type") as any;
                const category = formData.get("category") as any;
                const agent_id = formData.get("agent_id") as string;
                const address = formData.get("address") as string;
                const description = formData.get("description") as string;
                const imageUrl = formData.get("image") as string;

                if (editingProperty) {
                  nagpurDb.updateProperty(
                    editingProperty.id,
                    {
                      title,
                      locality,
                      price,
                      price_range,
                      area_sqft,
                      bhk,
                      listing_type,
                      type,
                      category,
                      agent_id,
                      address,
                      description,
                      images: imageUrl ? [imageUrl] : editingProperty.images
                    },
                    user?.name || "Super Admin"
                  );
                } else {
                  nagpurDb.createProperty({
                    title,
                    description,
                    type,
                    category,
                    listing_type,
                    bhk,
                    price,
                    price_range,
                    area_sqft,
                    status: "available",
                    locality,
                    address,
                    latitude: 21.1458,
                    longitude: 79.0882,
                    agent_id,
                    images: [imageUrl || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"],
                    features: ["24/7 Water", "Car Parking", "Nagpur Metro Access"],
                    is_featured: false
                  });
                }

                setIsAddPropertyOpen(false);
                setEditingProperty(null);
                loadData();
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Property Title</label>
                <input
                  name="title"
                  defaultValue={editingProperty?.title || ""}
                  required
                  placeholder="E.g. Modern 3 BHK Flat in Dharampeth"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nagpur Locality</label>
                  <select
                    name="locality"
                    defaultValue={editingProperty?.locality || "Dharampeth"}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    {nagpurDb.getLocalities().map((loc) => (
                      <option key={loc.id} value={loc.name}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Listing Type</label>
                  <select
                    name="listing_type"
                    defaultValue={editingProperty?.listing_type || "buy"}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    <option value="buy">Buy (Sale)</option>
                    <option value="rent">Rent (Lease)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    name="category"
                    defaultValue={editingProperty?.category || "apartment"}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    <option value="apartment">Apartment</option>
                    <option value="villa">Villa / House</option>
                    <option value="plot">Plot</option>
                    <option value="land">Commercial Land</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Price (INR)</label>
                  <input
                    name="price"
                    type="number"
                    defaultValue={editingProperty?.price || 6500000}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Price Range Tag</label>
                  <input
                    name="price_range"
                    defaultValue={editingProperty?.price_range || "₹60L - ₹70L"}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Area (sqft)</label>
                  <input
                    name="area_sqft"
                    type="number"
                    defaultValue={editingProperty?.area_sqft || 1200}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">BHK (Optional)</label>
                  <input
                    name="bhk"
                    type="number"
                    defaultValue={editingProperty?.bhk || 3}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Property Type</label>
                  <select
                    name="type"
                    defaultValue={editingProperty?.type || "residential"}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Broker</label>
                  <select
                    name="agent_id"
                    defaultValue={editingProperty?.agent_id || agents[0]?.id}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    {agents.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.agency})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Address</label>
                <input
                  name="address"
                  defaultValue={editingProperty?.address || ""}
                  required
                  placeholder="Street, Building, Locality, Nagpur - 4400XX"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Image URL</label>
                <input
                  name="image"
                  defaultValue={editingProperty?.images[0] || ""}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={editingProperty?.description || ""}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddPropertyOpen(false);
                    setEditingProperty(null);
                  }}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg shadow-sm"
                >
                  {editingProperty ? "Save Changes" : "Create Listing"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ONBOARDED BROKER CREDENTIALS CONFIRMATION */}
      {onboardedCreds && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-emerald-200 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Check className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Broker Successfully Onboarded!</h3>
                <p className="text-xs text-slate-500">Credentials created and immediately active for Agent Login.</p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Broker Name:</span>
                <span className="font-bold text-slate-900">{onboardedCreds.name}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Agent ID:</span>
                <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">{onboardedCreds.agentId}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Login Email:</span>
                <span className="font-mono font-bold text-slate-900">{onboardedCreds.email}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 font-medium">Password:</span>
                <span className="font-mono font-bold text-slate-900 bg-slate-200/70 px-2 py-0.5 rounded">{onboardedCreds.password}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`Nagpur Realty Broker Login\nEmail: ${onboardedCreds.email}\nPassword: ${onboardedCreds.password}\nURL: /login/agent`);
                  alert("Copied broker credentials to clipboard!");
                }}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" /> Copy Credentials
              </button>
              <button
                onClick={() => setOnboardedCreds(null)}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT AGENT */}
      {(isAddAgentOpen || editingAgent) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                {editingAgent ? "Edit Broker Profile" : "Onboard New Broker"}
              </h3>
              <button
                onClick={() => {
                  setIsAddAgentOpen(false);
                  setEditingAgent(null);
                }}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const name = formData.get("name") as string;
                const email = formData.get("email") as string;
                const phone = formData.get("phone") as string;
                const agency = formData.get("agency") as string;
                const area_specialization = formData.get("area") as string;
                const license_no = formData.get("license") as string;

                const password = (formData.get("password") as string) || "agent123";

                if (editingAgent) {
                  nagpurDb.updateAgent(editingAgent.id, {
                    name,
                    email,
                    phone,
                    agency,
                    area_specialization,
                    license_no
                  });
                } else {
                  const res = nagpurDb.createAgentWithAuth({
                    name,
                    email,
                    phone,
                    agency,
                    rating: 4.8,
                    area_specialization,
                    license_no,
                    bio: `Specialized Nagpur broker representing ${agency}.`,
                    total_deals: 12,
                    is_active: true
                  }, password);

                  setOnboardedCreds({
                    name,
                    email,
                    password,
                    agentId: res.agent.id
                  });
                }

                setIsAddAgentOpen(false);
                setEditingAgent(null);
                loadData();
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Agent Name</label>
                <input
                  name="name"
                  defaultValue={editingAgent?.name || ""}
                  required
                  placeholder="E.g. Nilesh Tiwari"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    name="phone"
                    defaultValue={editingAgent?.phone || "+91 "}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    name="email"
                    type="email"
                    defaultValue={editingAgent?.email || ""}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              {!editingAgent && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-slate-700">Broker Portal Password</label>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">Enables Immediate Login</span>
                  </div>
                  <input
                    name="password"
                    type="password"
                    defaultValue="agent123"
                    required
                    placeholder="Enter agent login password (default: agent123)"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono text-xs"
                  />
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Agency Name</label>
                <input
                  name="agency"
                  defaultValue={editingAgent?.agency || "Nagpur Premier Realty"}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Area Specialization</label>
                <input
                  name="area"
                  defaultValue={editingAgent?.area_specialization || "Dharampeth & West Nagpur"}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">MahaRERA License No</label>
                <input
                  name="license"
                  defaultValue={editingAgent?.license_no || "MAHARERA-A505000"}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddAgentOpen(false);
                    setEditingAgent(null);
                  }}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg shadow-sm"
                >
                  {editingAgent ? "Update Broker" : "Onboard"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL: NEW CUSTOMER CREDENTIALS CONFIRMATION */}
      {newCustomerCreds && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-amber-200 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Check className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Customer Successfully Registered!</h3>
                <p className="text-xs text-slate-500">Customer saved to database and ready to sign in.</p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Customer Name:</span>
                <span className="font-bold text-slate-900">{newCustomerCreds.name}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Customer ID:</span>
                <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">{newCustomerCreds.customerId.slice(0, 12)}...</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Phone:</span>
                <span className="font-semibold text-slate-800">{newCustomerCreds.phone}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Login Email:</span>
                <span className="font-mono font-bold text-slate-900">{newCustomerCreds.email}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 font-medium">Login Password:</span>
                <span className="font-mono font-bold text-slate-900 bg-slate-200/70 px-2 py-0.5 rounded">{newCustomerCreds.password}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(`Nagpur Realty Customer Portal Login\nName: ${newCustomerCreds.name}\nEmail: ${newCustomerCreds.email}\nPassword: ${newCustomerCreds.password}\nPortal URL: /login/customer`);
                  alert("Copied customer login credentials to clipboard!");
                }}
                className="flex-1 py-2.5 px-4 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" /> Copy Credentials
              </button>
              <button
                type="button"
                onClick={() => setNewCustomerCreds(null)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW CUSTOMER DIRECTLY FROM ADMIN */}
      {isAddCustomerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Add New Customer</h3>
                  <p className="text-[11px] text-slate-500">Save to database &amp; create login account</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddCustomerOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const name = (formData.get("name") as string)?.trim();
                const email = (formData.get("email") as string)?.trim().toLowerCase();
                const phone = (formData.get("phone") as string)?.trim();
                const password = (formData.get("password") as string)?.trim() || "customer123";
                const localities = (formData.get("localities") as string)?.split(",").map(l => l.trim()).filter(Boolean) || ["Dharampeth"];
                const budget_min = Number(formData.get("budget_min")) || 3000000;
                const budget_max = Number(formData.get("budget_max")) || 12000000;

                try {
                  const res = await fetch("/api/customers", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      name,
                      email,
                      phone,
                      password,
                      preferences: {
                        budget_min,
                        budget_max,
                        preferred_localities: localities,
                        bhk: [2, 3],
                        listing_type: "buy"
                      }
                    })
                  });
                  const data = await res.json();
                  if (data.success) {
                    setIsAddCustomerOpen(false);
                    loadData();
                    setNewCustomerCreds({
                      name,
                      email,
                      phone,
                      password,
                      customerId: data.customer?.id || "cust-" + Date.now()
                    });
                  } else {
                    alert(data.error || "Failed to create customer");
                  }
                } catch (err: any) {
                  alert(err.message || "Network error occurred");
                }
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-orange-600">*</span>
                </label>
                <input
                  name="name"
                  required
                  placeholder="e.g. Tanmay Kulkarni"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Mobile Phone <span className="text-orange-600">*</span>
                  </label>
                  <input
                    name="phone"
                    required
                    placeholder="e.g. +91 98230 12345"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Email Address <span className="text-orange-600">*</span>
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="e.g. tanmay.kulkarni@gmail.com"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-slate-700">
                    Customer Portal Password <span className="text-orange-600">*</span>
                  </label>
                  <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                    Enables Customer Login
                  </span>
                </div>
                <input
                  name="password"
                  type="password"
                  defaultValue="customer123"
                  required
                  placeholder="e.g. customer123 (or custom password)"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Preferred Localities (comma separated)
                </label>
                <input
                  name="localities"
                  defaultValue="Dharampeth, Civil Lines, Ramdaspeth"
                  placeholder="e.g. Dharampeth, Civil Lines, Wardha Road"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Min Budget (₹)</label>
                  <input
                    name="budget_min"
                    type="number"
                    defaultValue={3000000}
                    step={100000}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Max Budget (₹)</label>
                  <input
                    name="budget_max"
                    type="number"
                    defaultValue={12000000}
                    step={100000}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddCustomerOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Save &amp; Register Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SCHEDULED VISITS MANAGEMENT (Real-time Database Updates) */}
      <ScheduledVisitsModal
        isOpen={isScheduledVisitsOpen}
        onClose={() => setIsScheduledVisitsOpen(false)}
        visits={visits}
        properties={properties}
        agents={agents}
        customers={customers}
        currentUserName={user?.name || "Super Admin"}
        onUpdate={() => loadData()}
      />

      {/* MODAL: SUPABASE CONFIGURATION & CREDENTIALS */}
      <SupabaseConfigModal
        isOpen={isSupabaseConfigOpen}
        onClose={() => setIsSupabaseConfigOpen(false)}
        onSuccess={() => {
          loadData();
          checkDatabaseStatus();
        }}
      />
    </div>
  );
}
