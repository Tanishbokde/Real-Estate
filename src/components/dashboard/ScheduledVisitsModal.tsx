"use client";

import React, { useState } from "react";
import Link from "next/link";
import { VisitRequest, VisitStatus, Property, AgentBroker, Customer } from "@/lib/types/database";
import { nagpurDb } from "@/lib/data/nagpur-mock-db";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { formatDate, isMatchingId } from "@/lib/utils";
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
  Phone,
  User,
  Building2,
  RefreshCw,
  Edit3,
  CalendarCheck,
  Check,
  Database,
  ArrowRight,
  ShieldCheck
} from "lucide-react";

interface ScheduledVisitsModalProps {
  isOpen: boolean;
  onClose: () => void;
  visits: VisitRequest[];
  properties: Property[];
  agents: AgentBroker[];
  customers: Customer[];
  currentUserName?: string;
  onUpdate: () => void;
}

export function ScheduledVisitsModal({
  isOpen,
  onClose,
  visits,
  properties,
  agents,
  customers,
  currentUserName = "Admin",
  onUpdate
}: ScheduledVisitsModalProps) {
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "confirmed" | "pending" | "completed" | "cancelled">("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [reschedulingVisitId, setReschedulingVisitId] = useState<string | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newTimeSlot, setNewTimeSlot] = useState("11:00 AM - 12:30 PM");
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState("");
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  if (!isOpen) return null;

  // Counts
  const pendingVisits = visits.filter(v => v.status === "pending");
  const confirmedVisits = visits.filter(v => v.status === "confirmed");
  const activeVisitsCount = pendingVisits.length + confirmedVisits.length;
  const completedVisits = visits.filter(v => v.status === "completed");
  const cancelledVisits = visits.filter(v => v.status === "cancelled" || v.status === "rejected");

  const filteredVisits = visits.filter((v) => {
    // Status filter
    if (filterStatus === "active" && v.status !== "pending" && v.status !== "confirmed") return false;
    if (filterStatus === "pending" && v.status !== "pending") return false;
    if (filterStatus === "confirmed" && v.status !== "confirmed") return false;
    if (filterStatus === "completed" && v.status !== "completed") return false;
    if (filterStatus === "cancelled" && v.status !== "cancelled" && v.status !== "rejected") return false;

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const prop = properties.find(p => isMatchingId(p.id, v.property_id));
      const cust = customers.find(c => isMatchingId(c.id, v.customer_id));
      const agent = agents.find(a => isMatchingId(a.id, v.agent_id));
      return (
        v.id.toLowerCase().includes(q) ||
        v.scheduled_date.toLowerCase().includes(q) ||
        v.time_slot.toLowerCase().includes(q) ||
        (prop?.title && prop.title.toLowerCase().includes(q)) ||
        (prop?.locality && prop.locality.toLowerCase().includes(q)) ||
        (cust?.name && cust.name.toLowerCase().includes(q)) ||
        (agent?.name && agent.name.toLowerCase().includes(q))
      );
    }

    return true;
  });

  const showNotification = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  // 1. Direct status change
  const handleStatusChange = async (visitId: string, status: VisitStatus) => {
    nagpurDb.updateVisitStatus(
      visitId,
      status,
      undefined,
      undefined,
      currentUserName
    );
    try {
      await fetch("/api/visits", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: visitId,
          status,
          author_name: currentUserName
        })
      });
    } catch (e) {
      console.warn("PUT /api/visits status error:", e);
    }
    showNotification(`Visit #${visitId.slice(0, 8)} marked as "${status}" and updated in Database!`);
    onUpdate();
  };

  // 2. Reschedule visit
  const handleSaveReschedule = async (visitId: string) => {
    if (!newDate) {
      alert("Please select a valid preferred date.");
      return;
    }

    const note = `Rescheduled by ${currentUserName} to ${newDate} (${newTimeSlot})`;
    nagpurDb.updateVisitStatus(
      visitId,
      "confirmed",
      note,
      { scheduled_date: newDate, time_slot: newTimeSlot },
      currentUserName
    );

    try {
      await fetch("/api/visits", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: visitId,
          status: "confirmed",
          agent_notes: note,
          scheduled_date: newDate,
          time_slot: newTimeSlot,
          author_name: currentUserName
        })
      });
    } catch (e) {
      console.warn("PUT /api/visits reschedule error:", e);
    }

    setReschedulingVisitId(null);
    showNotification(`Visit #${visitId.slice(0, 8)} rescheduled to ${newDate} (${newTimeSlot}) & saved to Database!`);
    onUpdate();
  };

  // 3. Save notes
  const handleSaveNotes = async (visitId: string) => {
    const v = visits.find(item => isMatchingId(item.id, visitId));
    if (!v) return;

    nagpurDb.updateVisitStatus(
      visitId,
      v.status,
      tempNotes,
      undefined,
      currentUserName
    );

    try {
      await fetch("/api/visits", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: visitId,
          status: v.status,
          agent_notes: tempNotes,
          author_name: currentUserName
        })
      });
    } catch (e) {
      console.warn("PUT /api/visits notes error:", e);
    }

    setEditingNotesId(null);
    showNotification(`Notes saved for Visit #${visitId.slice(0, 8)} and updated in Database!`);
    onUpdate();
  };

  // 4. Force sync with Supabase
  const handleSyncSupabase = async () => {
    setIsSyncing(true);
    try {
      const res = await nagpurDb.syncFromSupabase();
      showNotification(res.message || "Synced visits with Supabase Database!");
      onUpdate();
    } catch (e: any) {
      showNotification(`Sync failed: ${e.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 sm:p-5 animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* MODAL HEADER */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg text-white">Scheduled Property Visits</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-400 text-slate-950 shadow-xs">
                  {activeVisitsCount} Scheduled
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span>Live Database Sync: Updates directly persist to Supabase &amp; Audit Logs</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handleSyncSupabase}
              disabled={isSyncing}
              className="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border border-slate-700"
              title="Sync latest visits from Supabase"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isSyncing ? "animate-spin" : ""}`} />
              <span>{isSyncing ? "Syncing..." : "Sync DB"}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* FEEDBACK BANNER */}
        {actionSuccessMsg && (
          <div className="px-6 py-2.5 bg-emerald-600 text-white text-xs font-bold flex items-center justify-between animate-in slide-in-from-top duration-200 shrink-0">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              <span>{actionSuccessMsg}</span>
            </div>
            <button onClick={() => setActionSuccessMsg(null)} className="text-emerald-200 hover:text-white">
              ✕
            </button>
          </div>
        )}

        {/* CONTROLS & FILTER PILLS */}
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 space-y-3 shrink-0">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
              {[
                { id: "active", label: "Scheduled (Active)", count: activeVisitsCount, color: "text-blue-700 bg-blue-50 border-blue-200" },
                { id: "all", label: "All Visits", count: visits.length, color: "text-slate-700 bg-slate-100 border-slate-200" },
                { id: "pending", label: "Pending", count: pendingVisits.length, color: "text-amber-700 bg-amber-50 border-amber-200" },
                { id: "confirmed", label: "Confirmed", count: confirmedVisits.length, color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
                { id: "completed", label: "Completed", count: completedVisits.length, color: "text-purple-700 bg-purple-50 border-purple-200" },
                { id: "cancelled", label: "Cancelled", count: cancelledVisits.length, color: "text-rose-700 bg-rose-50 border-rose-200" }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilterStatus(f.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                    filterStatus === f.id
                      ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                      : "bg-white text-slate-600 hover:bg-slate-100 border-slate-200"
                  }`}
                >
                  <span>{f.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                    filterStatus === f.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                  }`}>
                    {f.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Quick Search */}
            <div className="w-full sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search visits (client, property, date)..."
                className="w-full px-3.5 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* VISITS LIST VIEW */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {filteredVisits.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
                <Calendar className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">No visits found matching filter</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {filterStatus === "active"
                  ? "There are currently no active pending or confirmed visits. Select 'All Visits' to view history."
                  : "Try clearing your search query or choosing another status tab."}
              </p>
            </div>
          ) : (
            filteredVisits.map((v) => {
              const prop = properties.find((p) => isMatchingId(p.id, v.property_id));
              const cust = customers.find((c) => isMatchingId(c.id, v.customer_id));
              const agent = agents.find((a) => isMatchingId(a.id, v.agent_id));
              const isRescheduling = reschedulingVisitId === v.id;
              const isEditingNotes = editingNotesId === v.id;

              return (
                <div
                  key={v.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition p-4 sm:p-5 space-y-4"
                >
                  {/* Top Bar: Property title & Status Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-slate-400 uppercase">#{v.id}</span>
                        <Link
                          href={`/properties/${v.property_id}`}
                          className="font-bold text-slate-900 text-sm hover:text-orange-600 transition flex items-center gap-1.5"
                        >
                          <Building2 className="w-4 h-4 text-orange-600 shrink-0" />
                          <span>{prop?.title || `Property #${v.property_id}`}</span>
                        </Link>
                      </div>
                      <p className="text-xs text-slate-500 ml-6">
                        {prop?.locality ? `${prop.locality}, Nagpur` : "Nagpur, Maharashtra"} • {prop?.address || ""}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                        v.status === "confirmed" ? "bg-emerald-100 text-emerald-800 border border-emerald-200" :
                        v.status === "pending" ? "bg-amber-100 text-amber-800 border border-amber-200" :
                        v.status === "completed" ? "bg-purple-100 text-purple-800 border border-purple-200" :
                        "bg-rose-100 text-rose-800 border border-rose-200"
                      }`}>
                        {v.status}
                      </span>
                    </div>
                  </div>

                  {/* Visit Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    {/* Schedule Date & Time */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-slate-700">
                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                        <span>Scheduled Date &amp; Time</span>
                      </div>
                      <p className="text-slate-900 font-extrabold text-sm">{formatDate(v.scheduled_date)}</p>
                      <p className="text-slate-500 font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{v.time_slot}</span>
                      </p>
                    </div>

                    {/* Customer Info */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-slate-700">
                        <User className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Client / Buyer</span>
                      </div>
                      <p className="text-slate-900 font-bold">{cust?.name || v.customer_id}</p>
                      <p className="text-slate-500 text-[11px] flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{cust?.phone || "Phone on file"}</span>
                      </p>
                    </div>

                    {/* Assigned Broker */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-slate-700">
                        <ShieldCheck className="w-3.5 h-3.5 text-orange-600" />
                        <span>Assigned Nagpur Broker</span>
                      </div>
                      <p className="text-slate-900 font-bold">{agent?.name || "Unassigned"}</p>
                      <p className="text-slate-500 text-[11px]">{agent?.agency || "Nagpur Realty"} ({agent?.phone || ""})</p>
                    </div>
                  </div>

                  {/* Notes Section */}
                  {(v.notes || v.agent_notes || isEditingNotes) && (
                    <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200/70 text-xs space-y-1.5">
                      {v.notes && (
                        <p className="text-amber-900">
                          <strong className="text-amber-950">Client Request:</strong> &ldquo;{v.notes}&rdquo;
                        </p>
                      )}
                      {v.agent_notes && !isEditingNotes && (
                        <p className="text-slate-700">
                          <strong className="text-slate-900">Broker Notes:</strong> {v.agent_notes}
                        </p>
                      )}
                      {isEditingNotes && (
                        <div className="space-y-2 pt-1">
                          <label className="block text-[11px] font-bold text-slate-700">Edit Broker Notes:</label>
                          <textarea
                            rows={2}
                            value={tempNotes}
                            onChange={(e) => setTempNotes(e.target.value)}
                            placeholder="Add visit instructions, meeting spot, or feedback..."
                            className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                          />
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleSaveNotes(v.id)}
                              className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs cursor-pointer"
                            >
                              Save Notes
                            </button>
                            <button
                              onClick={() => setEditingNotesId(null)}
                              className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg text-xs cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* RESCHEDULE INLINE FORM */}
                  {isRescheduling && (
                    <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-xl space-y-3 text-xs animate-in fade-in">
                      <div className="flex items-center justify-between font-bold text-blue-900">
                        <span className="flex items-center gap-1.5">
                          <CalendarCheck className="w-4 h-4 text-blue-600" />
                          <span>Reschedule Visit to New Date &amp; Time Slot:</span>
                        </span>
                        <button onClick={() => setReschedulingVisitId(null)} className="text-slate-400 hover:text-slate-700">
                          ✕
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">New Preferred Date</label>
                          <input
                            type="date"
                            min={new Date().toISOString().split("T")[0]}
                            value={newDate}
                            onChange={(e) => setNewDate(e.target.value)}
                            className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Time Slot</label>
                          <select
                            value={newTimeSlot}
                            onChange={(e) => setNewTimeSlot(e.target.value)}
                            className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                          >
                            <option value="10:00 AM - 11:30 AM">Morning (10:00 AM - 11:30 AM)</option>
                            <option value="11:30 AM - 01:00 PM">Noon (11:30 AM - 01:00 PM)</option>
                            <option value="02:30 PM - 04:00 PM">Afternoon (02:30 PM - 04:00 PM)</option>
                            <option value="04:30 PM - 06:00 PM">Evening (04:30 PM - 06:00 PM)</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setReschedulingVisitId(null)}
                          className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg text-xs cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveReschedule(v.id)}
                          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" /> Save New Schedule
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ACTION BUTTONS (Update Database in Realtime) */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Confirm Visit Button */}
                      {v.status !== "confirmed" && v.status !== "completed" && (
                        <button
                          onClick={() => handleStatusChange(v.id, "confirmed")}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                          title="Confirm this visit schedule"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Confirm Visit
                        </button>
                      )}

                      {/* Reschedule Button */}
                      <button
                        onClick={() => {
                          setReschedulingVisitId(v.id);
                          setNewDate(v.scheduled_date);
                          setNewTimeSlot(v.time_slot);
                        }}
                        className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer border border-blue-200"
                        title="Change preferred date or time slot"
                      >
                        <CalendarCheck className="w-3.5 h-3.5" /> Reschedule Date
                      </button>

                      {/* Mark Completed */}
                      {v.status !== "completed" && (
                        <button
                          onClick={() => handleStatusChange(v.id, "completed")}
                          className="px-3.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer border border-purple-200"
                          title="Mark property showing as completed"
                        >
                          <Check className="w-3.5 h-3.5" /> Completed
                        </button>
                      )}

                      {/* Add/Edit Notes */}
                      {!isEditingNotes && (
                        <button
                          onClick={() => {
                            setEditingNotesId(v.id);
                            setTempNotes(v.agent_notes || "");
                          }}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-1 transition cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" /> Notes
                        </button>
                      )}
                    </div>

                    {/* Cancel Visit */}
                    {v.status !== "cancelled" && v.status !== "rejected" && (
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to cancel visit #${v.id}?`)) {
                            handleStatusChange(v.id, "cancelled");
                          }
                        }}
                        className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 font-bold text-xs rounded-xl transition cursor-pointer"
                      >
                        Cancel Visit
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Database Status: Changes automatically update in Supabase PostgreSQL &amp; record audit history.</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
