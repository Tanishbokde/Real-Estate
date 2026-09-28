"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { nagpurDb } from "@/lib/data/nagpur-mock-db";
import { useAuth } from "@/context/AuthContext";
import {
  Property,
  AgentBroker,
  VisitRequest,
  Inquiry,
  FollowUp,
  AppNotification,
  VisitStatus,
  InquiryStatus,
  FollowUpStatus,
  PropertyStatus
} from "@/lib/types/database";
import { formatINR, formatDate, formatDateTime, isMatchingId } from "@/lib/utils";
import { ScheduledVisitsModal } from "@/components/dashboard/ScheduledVisitsModal";
import {
  Building2,
  Calendar,
  MessageSquare,
  Clock,
  Bell,
  CheckCircle2,
  Phone,
  Mail,
  User,
  ShieldCheck,
  Star,
  Users,
  Eye,
  Send,
  Plus,
  Edit2,
  Sparkles,
  ArrowRight,
  LogOut
} from "lucide-react";

export default function AgentDashboardPage() {
  const router = useRouter();
  const { user, role, isAuthenticated, isLoading, logout, switchUser } = useAuth();
  const agentId = user?.agentId || "";

  // Active sub-tab
  const [activeTab, setActiveTab] = useState<
    "visits" | "inquiries" | "followups" | "properties" | "notifications"
  >("visits");

  const [agent, setAgent] = useState<AgentBroker | null>(null);
  const [myProperties, setMyProperties] = useState<Property[]>([]);
  const [myVisits, setMyVisits] = useState<VisitRequest[]>([]);
  const [myInquiries, setMyInquiries] = useState<Inquiry[]>([]);
  const [myFollowUps, setMyFollowUps] = useState<FollowUp[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isScheduledVisitsOpen, setIsScheduledVisitsOpen] = useState(false);

  // Reply state for inquiries
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});

  // Auth guard: Redirect if not authenticated as agent
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || role !== "agent")) {
      router.push("/login/agent");
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

  const loadData = () => {
    if (!agentId && !user) return;
    const allAgents = nagpurDb.getAgents();
    const currentAgent = allAgents.find(a => 
      isMatchingId(a.id, agentId) || 
      (user?.email && a.email.toLowerCase() === user.email.toLowerCase())
    ) || (agentId ? nagpurDb.getAgentById(agentId) : null);
    setAgent(currentAgent || null);

    const activeAgentId = currentAgent?.id || agentId;

    const allProps = nagpurDb.getProperties();
    const assigned = allProps.filter((p) => 
      isMatchingId(p.agent_id, activeAgentId) || isMatchingId(p.agent_id, agentId)
    );
    setMyProperties(assigned);

    // Visits for this agent
    const allVisits = nagpurDb.getVisitRequests();
    const agentVisits = allVisits.filter((v) => {
      const matchesAgent = isMatchingId(v.agent_id, activeAgentId) || isMatchingId(v.agent_id, agentId);
      const matchesProp = assigned.some((p) => isMatchingId(p.id, v.property_id));
      return matchesAgent || matchesProp;
    });
    setMyVisits(agentVisits);

    // Inquiries for this agent
    const allInqs = nagpurDb.getInquiries();
    const agentInqs = allInqs.filter((i) => {
      const matchesAgent = isMatchingId(i.agent_id, activeAgentId) || isMatchingId(i.agent_id, agentId);
      const matchesProp = assigned.some((p) => isMatchingId(p.id, i.property_id));
      return matchesAgent || matchesProp;
    });
    setMyInquiries(agentInqs);

    // Follow-ups for this agent's properties
    const allFollowUps = nagpurDb.getFollowUps();
    const agentFUs = allFollowUps.filter((f) => 
      assigned.some((p) => isMatchingId(p.id, f.property_id))
    );
    setMyFollowUps(agentFUs);

    setNotifications(nagpurDb.getNotifications(user?.id || ""));
  };

  useEffect(() => {
    if (agentId || user) {
      loadData();
      nagpurDb.syncFromSupabase().then(() => loadData()).catch(() => {});
      const handleUpdate = () => loadData();
      window.addEventListener("nagpur_db_updated", handleUpdate);
      return () => window.removeEventListener("nagpur_db_updated", handleUpdate);
    }
  }, [agentId, user?.id]);

  // Handle visit status changes
  const handleUpdateVisit = async (visitId: string, status: VisitStatus, notes?: string) => {
    const updatedNotes = notes || `Status updated to ${status} by broker ${agent?.name || "Agent"}`;
    nagpurDb.updateVisitStatus(
      visitId,
      status,
      updatedNotes,
      undefined,
      agent?.name || user?.name || "Broker"
    );
    try {
      await fetch("/api/visits", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: visitId,
          status,
          agent_notes: updatedNotes,
          author_name: agent?.name || user?.name || "Broker"
        })
      });
    } catch (e) {
      console.warn("PUT /api/visits update error:", e);
    }
    loadData();
  };

  // Handle inquiry reply
  const handleSendReply = (inqId: string) => {
    const text = replyText[inqId];
    if (!text?.trim()) return;

    nagpurDb.updateInquiryStatus(inqId, "resolved", text, agent?.name || user?.name || "Broker");
    setReplyText((prev) => ({ ...prev, [inqId]: "" }));
    loadData();
    alert("Reply sent to customer!");
  };

  // Handle follow up resolution
  const handleResolveFollowUp = (fuId: string, status: FollowUpStatus) => {
    nagpurDb.resolveFollowUp(fuId, status, `Outreach completed by broker ${agent?.name}`);
    loadData();
  };

  // Handle quick property status change
  const handlePropertyStatus = (propId: string, status: PropertyStatus) => {
    nagpurDb.updateProperty(propId, { status });
    loadData();
  };

  // KPI Calculations
  const customersShownProperties = myVisits.filter((v) => v.status === "completed").length;
  const scheduledVisitsCount = myVisits.filter((v) => v.status === "pending" || v.status === "confirmed").length;
  const activeInquiriesCount = myInquiries.filter((i) => i.status === "new" || i.status === "in_progress").length;
  const pendingFollowUpsCount = myFollowUps.filter((f) => f.status === "pending").length;

  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-600">Verifying broker authentication session...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. AGENT PROFILE & KPI HEADER */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white font-extrabold text-xl flex items-center justify-center shadow-lg shrink-0">
            {(agent?.name || user?.name || "A").charAt(0)}
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold uppercase tracking-wider">
                MahaRERA Broker
              </span>
              <span className="text-xs text-slate-400">• {agent?.license_no || "A50500018921"}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {agent?.name || user?.name || "Broker"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              {agent?.agency || user?.agency || "Nagpur Premier Realty"} • {agent?.area_specialization || "Nagpur Region"}
            </p>
          </div>
        </div>

        {/* Broker Account ID & Visible Logout button */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Scheduled Visits Quick-Access Button */}
          <button
            onClick={() => setIsScheduledVisitsOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-md transition cursor-pointer border border-blue-400/30"
            title="View scheduled visits for your properties and update database"
          >
            <Calendar className="w-4 h-4 text-amber-300" />
            <span>Scheduled Visits</span>
            <span className="px-2 py-0.5 rounded-full bg-blue-950 text-amber-300 text-[11px] font-black border border-blue-400/40">
              {scheduledVisitsCount} Active
            </span>
          </button>

          <div className="text-right hidden sm:block">
            <div className="text-[11px] text-slate-400">Agent ID: <span className="text-emerald-400 font-mono font-bold">{agentId}</span></div>
            <div className="text-xs text-slate-300 font-medium">{user?.email}</div>
          </div>
          <button
            onClick={async () => {
              await logout();
              router.push("/login/agent");
            }}
            className="px-4 py-2.5 bg-rose-600/80 hover:bg-rose-600 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition cursor-pointer shadow-md"
            title="Sign out of broker session"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>

      {/* 2. AGENT KPI METRICS (Specifically addresses user request) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* 1. Customers Shown Properties to */}
        <div
          onClick={() => setActiveTab("visits")}
          className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1.5 cursor-pointer hover:border-emerald-300 transition"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Customers Shown</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-black text-slate-900">{customersShownProperties}</p>
          <p className="text-[11px] text-slate-500 font-medium">Customers shown properties</p>
        </div>

        {/* 2. Scheduled Property Visits */}
        <div
          onClick={() => setIsScheduledVisitsOpen(true)}
          className="p-5 bg-gradient-to-br from-blue-50/70 to-white rounded-2xl border border-blue-200 shadow-xs space-y-1.5 cursor-pointer hover:border-blue-400 hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between text-xs font-bold text-blue-900">
            <span>Scheduled Visits</span>
            <Calendar className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-3xl font-black text-blue-600">{scheduledVisitsCount}</p>
          <p className="text-[11px] text-blue-700 font-medium">Click to manage &amp; update</p>
        </div>

        {/* 3. Active Inquiries */}
        <div
          onClick={() => setActiveTab("inquiries")}
          className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1.5 cursor-pointer hover:border-emerald-300 transition"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Active Inquiries</span>
            <MessageSquare className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-3xl font-black text-purple-600">{activeInquiriesCount}</p>
          <p className="text-[11px] text-slate-500 font-medium">{myInquiries.length} total received</p>
        </div>

        {/* 4. Customer Follow-Ups */}
        <div
          onClick={() => setActiveTab("followups")}
          className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1.5 cursor-pointer hover:border-emerald-300 transition"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Customer Follow-Ups</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-3xl font-black text-amber-600">{pendingFollowUpsCount}</p>
          <p className="text-[11px] text-slate-500 font-medium">48h unengaged views</p>
        </div>

        {/* 5. Assigned Listings */}
        <div
          onClick={() => setActiveTab("properties")}
          className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1.5 cursor-pointer hover:border-emerald-300 transition"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>My Portfolio</span>
            <Building2 className="w-4 h-4 text-orange-600" />
          </div>
          <p className="text-3xl font-black text-slate-900">{myProperties.length}</p>
          <p className="text-[11px] text-slate-500 font-medium">Nagpur properties</p>
        </div>
      </div>

      {/* 3. TABS NAVIGATION */}
      <div className="border-b border-slate-200">
        <div className="flex items-center gap-2 sm:gap-6 overflow-x-auto text-xs sm:text-sm font-semibold">
          <button
            onClick={() => setActiveTab("visits")}
            className={`py-3 border-b-2 transition whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === "visits"
                ? "border-emerald-600 text-emerald-600 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Calendar className="w-4 h-4" />
            Scheduled Property Visits ({myVisits.length})
          </button>

          <button
            onClick={() => setActiveTab("inquiries")}
            className={`py-3 border-b-2 transition whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === "inquiries"
                ? "border-emerald-600 text-emerald-600 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Active Inquiries ({myInquiries.length})
          </button>

          <button
            onClick={() => setActiveTab("followups")}
            className={`py-3 border-b-2 transition whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === "followups"
                ? "border-emerald-600 text-emerald-600 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Clock className="w-4 h-4" />
            Customer Follow-Ups ({myFollowUps.length})
          </button>

          <button
            onClick={() => setActiveTab("properties")}
            className={`py-3 border-b-2 transition whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === "properties"
                ? "border-emerald-600 text-emerald-600 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Building2 className="w-4 h-4" />
            My Property Listings ({myProperties.length})
          </button>

          <button
            onClick={() => setActiveTab("notifications")}
            className={`py-3 border-b-2 transition whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === "notifications"
                ? "border-emerald-600 text-emerald-600 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Bell className="w-4 h-4" />
            Agent Notifications ({notifications.length})
          </button>
        </div>
      </div>

      {/* 4. TAB CONTENTS */}

      {/* TAB 1: SCHEDULED VISITS */}
      {activeTab === "visits" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Site Walkthroughs &amp; Property Visits
            </h2>
            <span className="text-xs text-slate-500">
              {customersShownProperties} completed visits • {scheduledVisitsCount} scheduled
            </span>
          </div>

          {myVisits.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-xs text-slate-500">
              No site visits scheduled currently.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myVisits.map((visit) => {
                const prop = nagpurDb.getPropertyById(visit.property_id);
                const cust = nagpurDb.getCustomerById(visit.customer_id);

                const statusColor = {
                  pending: "bg-amber-100 text-amber-800 border-amber-200",
                  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
                  completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
                  cancelled: "bg-rose-100 text-rose-800 border-rose-200",
                  rejected: "bg-slate-200 text-slate-700 border-slate-300",
                }[visit.status];

                return (
                  <div
                    key={visit.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusColor} capitalize`}>
                          {visit.status === "completed" ? "✓ Property Shown" : visit.status}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Scheduled: {visit.scheduled_date}
                        </span>
                      </div>

                      {/* Customer Info */}
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1 text-xs">
                        <div className="flex items-center justify-between font-bold text-slate-900">
                          <span className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-emerald-600" />
                            {cust?.name || "Customer"}
                          </span>
                          <span className="text-slate-600 font-medium">{visit.time_slot}</span>
                        </div>
                        <p className="text-slate-600 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" /> {cust?.phone}
                        </p>
                        {visit.notes && (
                          <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-200/60">
                            Notes: &ldquo;{visit.notes}&rdquo;
                          </p>
                        )}
                        {visit.agent_notes && (
                          <p className="text-[11px] text-emerald-700 font-medium">
                            Broker Memo: {visit.agent_notes}
                          </p>
                        )}
                      </div>

                      {/* Property Preview */}
                      {prop && (
                        <div className="flex items-center gap-3 pt-1">
                          <img
                            src={prop.images[0]}
                            alt={prop.title}
                            className="w-12 h-12 rounded-lg object-cover shrink-0"
                          />
                          <div className="min-w-0">
                            <Link
                              href={`/properties/${prop.id}`}
                              className="font-bold text-slate-900 text-xs hover:text-emerald-600 truncate block"
                            >
                              {prop.title}
                            </Link>
                            <p className="text-[11px] text-slate-500">{prop.locality} • {formatINR(prop.price, prop.listing_type)}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Agent Actions */}
                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2 text-xs">
                      {visit.status === "pending" && (
                        <button
                          onClick={() => handleUpdateVisit(visit.id, "confirmed")}
                          className="px-3 py-1.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                        >
                          Confirm Showing
                        </button>
                      )}

                      {visit.status === "confirmed" && (
                        <button
                          onClick={() => handleUpdateVisit(visit.id, "completed", "Successfully showed property to customer")}
                          className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Mark Property Shown
                        </button>
                      )}

                      {visit.status !== "completed" && visit.status !== "cancelled" && (
                        <button
                          onClick={() => handleUpdateVisit(visit.id, "cancelled", "Cancelled by broker")}
                          className="px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition font-medium"
                        >
                          Cancel
                        </button>
                      )}

                      <button
                        onClick={() => {
                          const note = prompt("Enter agent note for this showing:", visit.agent_notes || "");
                          if (note !== null) handleUpdateVisit(visit.id, visit.status, note);
                        }}
                        className="px-2.5 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                      >
                        Notes
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ACTIVE INQUIRIES */}
      {activeTab === "inquiries" && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900">
            Customer Inquiries on Your Listings ({myInquiries.length})
          </h2>

          {myInquiries.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-xs text-slate-500">
              No active customer inquiries.
            </div>
          ) : (
            <div className="space-y-4">
              {myInquiries.map((inq) => {
                const prop = nagpurDb.getPropertyById(inq.property_id);
                const cust = nagpurDb.getCustomerById(inq.customer_id);

                return (
                  <div key={inq.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-slate-900">{cust?.name}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-500">{cust?.phone}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-emerald-700 font-semibold">{prop?.locality}</span>
                      </div>
                      <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold capitalize">
                        Status: {inq.status}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-800 space-y-1">
                      <p className="font-semibold text-slate-900">Property: {prop?.title}</p>
                      <p className="italic text-slate-700">&ldquo;{inq.message}&rdquo;</p>
                      <span className="text-[10px] text-slate-400 block pt-1">
                        Received: {formatDateTime(inq.created_at)}
                      </span>
                    </div>

                    {inq.agent_reply ? (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900">
                        <span className="font-bold block mb-0.5">Your Sent Reply:</span>
                        <p>{inq.agent_reply}</p>
                      </div>
                    ) : (
                      <div className="space-y-2 pt-1">
                        <label className="block text-xs font-semibold text-slate-700">
                          Send Reply to Customer
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="E.g. Namaste Priya ji, yes spot negotiation is possible. Let us connect on call..."
                            value={replyText[inq.id] || ""}
                            onChange={(e) =>
                              setReplyText((prev) => ({ ...prev, [inq.id]: e.target.value }))
                            }
                            className="flex-1 text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
                          />
                          <button
                            onClick={() => handleSendReply(inq.id)}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 shrink-0"
                          >
                            <Send className="w-3.5 h-3.5" /> Reply
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CUSTOMER FOLLOW-UPS */}
      {activeTab === "followups" && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-xs text-amber-900">
            <h3 className="font-bold text-sm mb-1 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-700" />
              Automated 48-Hour Unengaged View Leads
            </h3>
            <p>
              These customers viewed your listings over 48 hours ago without scheduling a visit or sending an inquiry. Reaching out promptly increases conversion rates by over 40%.
            </p>
          </div>

          {myFollowUps.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-xs text-slate-500">
              No pending follow-ups for your listings.
            </div>
          ) : (
            <div className="space-y-3">
              {myFollowUps.map((fu) => {
                const prop = nagpurDb.getPropertyById(fu.property_id);
                const cust = nagpurDb.getCustomerById(fu.customer_id);

                return (
                  <div
                    key={fu.id}
                    className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{cust?.name}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-600">{cust?.phone}</span>
                        <span className={`px-2 py-0.2 rounded-full font-bold text-[10px] uppercase ${
                          fu.status === "pending" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                        }`}>
                          {fu.status}
                        </span>
                      </div>
                      <p className="text-slate-600">
                        Viewed <strong className="text-slate-900">{prop?.title}</strong> ({prop?.locality})
                      </p>
                      <span className="text-[10px] text-slate-400 block">
                        Triggered: {formatDateTime(fu.triggered_at)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <a
                        href={`tel:${cust?.phone}`}
                        className="px-3 py-1.5 bg-emerald-50 text-emerald-700 font-semibold rounded-lg hover:bg-emerald-100 transition flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3" /> Call Customer
                      </a>
                      {fu.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleResolveFollowUp(fu.id, "contacted")}
                            className="px-3 py-1.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                          >
                            Mark Contacted
                          </button>
                          <button
                            onClick={() => handleResolveFollowUp(fu.id, "converted")}
                            className="px-3 py-1.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition"
                          >
                            Converted
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: MY PROPERTY LISTINGS */}
      {activeTab === "properties" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Your Managed Nagpur Listings ({myProperties.length})
            </h2>
            <Link
              href="/properties"
              className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
            >
              Browse Public Inventory →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {myProperties.map((prop) => (
              <div
                key={prop.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs space-y-3 p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[16/10] rounded-xl overflow-hidden mb-3">
                    <img
                      src={prop.images[0]}
                      alt={prop.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900/80 text-white uppercase">
                      {prop.listing_type}
                    </span>
                  </div>

                  <Link href={`/properties/${prop.id}`} className="font-bold text-slate-900 text-xs sm:text-sm hover:text-emerald-600 line-clamp-2">
                    {prop.title}
                  </Link>

                  <p className="text-xs text-slate-500 mt-1">{prop.locality} • {prop.area_sqft} sqft</p>
                  <p className="text-sm font-extrabold text-slate-900 mt-1">{formatINR(prop.price, prop.listing_type)}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Status:</span>
                  <select
                    value={prop.status}
                    onChange={(e) => handlePropertyStatus(prop.id, e.target.value as PropertyStatus)}
                    className="p-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold capitalize"
                  >
                    <option value="available">Available</option>
                    <option value="pending">Pending</option>
                    <option value="sold">Sold</option>
                    <option value="rented">Rented</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: AGENT NOTIFICATIONS */}
      {activeTab === "notifications" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 max-w-3xl">
          <h2 className="text-base font-bold text-slate-900">Broker Alerts &amp; Notifications</h2>
          {notifications.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No notifications currently.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map((n) => (
                <div key={n.id} className="py-3 flex items-start gap-3 text-xs">
                  <div className="mt-0.5 shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-800 leading-snug">{n.message}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {formatDateTime(n.created_at)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {/* MODAL: SCHEDULED VISITS MANAGEMENT */}
      <ScheduledVisitsModal
        isOpen={isScheduledVisitsOpen}
        onClose={() => setIsScheduledVisitsOpen(false)}
        visits={myVisits}
        properties={myProperties}
        agents={agent ? [agent] : nagpurDb.getAgents()}
        customers={nagpurDb.getCustomers()}
        currentUserName={agent?.name || user?.name || "Broker"}
        onUpdate={() => loadData()}
      />
    </div>
  );
}
