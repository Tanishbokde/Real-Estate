"use client";

import React, { useState } from "react";
import { Property, AgentBroker } from "@/lib/types/database";
import { nagpurDb } from "@/lib/data/nagpur-mock-db";
import { useAuth } from "@/context/AuthContext";
import { Calendar, Clock, X, CheckCircle2, User, Phone, AlertCircle } from "lucide-react";

interface ScheduleVisitModalProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ScheduleVisitModal({ property, isOpen, onClose, onSuccess }: ScheduleVisitModalProps) {
  const { user } = useAuth();
  const agent = nagpurDb.getAgentById(property.agent_id);

  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  const [scheduledDate, setScheduledDate] = useState(tomorrow);
  const [timeSlot, setTimeSlot] = useState("11:00 AM - 12:30 PM");
  const [notes, setNotes] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Requirement 6: Specific Request Notes is MANDATORY and cannot be empty
    if (!notes.trim()) {
      setError("Specific Request Notes is mandatory. Please enter your request or inspection details before confirming.");
      return;
    }

    setLoading(true);
    try {
      const customerId = user?.customerId || "cust-1";
      const customer = nagpurDb.getCustomerById(customerId);
      const authorName = user?.name || customer?.name || "Customer";

      const res = await fetch("/api/visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: customerId,
          property_id: property.id,
          agent_id: property.agent_id,
          scheduled_date: scheduledDate,
          time_slot: timeSlot,
          notes: notes.trim(),
          author_name: authorName
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Trigger instant update across tabs and dashboards
        nagpurDb.syncFromSupabase().catch(() => {});
        window.dispatchEvent(new Event("nagpur_db_updated"));

        setIsSubmitted(true);
        setTimeout(() => {
          setIsSubmitted(false);
          onSuccess?.();
          onClose();
        }, 1800);
      } else {
        setError(data.error || "Failed to submit visit request. Please try again.");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to contact server to schedule visit.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            <h3 className="font-semibold text-base">Schedule Property Visit</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white rounded-lg p-1 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Visit Request Submitted!</h4>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              Agent {agent?.name || "assigned broker"} and Admin have been notified. The visit is saved in the database and active on your dashboard.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Property</span>
              <p className="font-semibold text-slate-900 text-sm mt-0.5 line-clamp-1">{property.title}</p>
              <p className="text-xs text-slate-500">{property.locality}, Nagpur</p>
            </div>

            {agent && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 font-bold flex items-center justify-center">
                    {agent.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{agent.name}</p>
                    <p className="text-[11px] text-slate-500">{agent.agency}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-amber-600 font-medium">★ {agent.rating}</span>
                  <p className="text-[10px] text-slate-400">{agent.phone}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Preferred Date
                </label>
                <input
                  type="date"
                  min={tomorrow}
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  required
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Preferred Time Slot
                </label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                >
                  <option value="10:00 AM - 11:30 AM">Morning (10:00 AM - 11:30 AM)</option>
                  <option value="11:30 AM - 01:00 PM">Noon (11:30 AM - 01:00 PM)</option>
                  <option value="02:30 PM - 04:00 PM">Afternoon (02:30 PM - 04:00 PM)</option>
                  <option value="04:30 PM - 06:00 PM">Evening (04:30 PM - 06:00 PM)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span>
                  Specific Request Notes <span className="text-rose-500 font-bold">*</span>
                </span>
                <span className="text-[11px] text-slate-400 font-normal">Mandatory</span>
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => {
                  setNotes(e.target.value);
                  if (error) setError(null);
                }}
                required
                placeholder="Please enter your specific requirements (e.g. visiting with family, need to inspect covered parking space, loan guidance needed)..."
                className={`w-full text-xs p-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-hidden ${
                  error && !notes.trim() ? "border-rose-400 bg-rose-50/50" : "border-slate-300"
                }`}
              />
              <p className="text-[10px] text-slate-400 mt-1">
                A note is required for the agent to prepare the site visit inspection for you.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 rounded-lg shadow-sm transition cursor-pointer disabled:opacity-60"
              >
                {loading ? "Scheduling..." : "Confirm Visit Request"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
