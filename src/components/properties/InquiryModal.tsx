"use client";

import React, { useState } from "react";
import { Property } from "@/lib/types/database";
import { nagpurDb } from "@/lib/data/nagpur-mock-db";
import { useAuth } from "@/context/AuthContext";
import { MessageSquare, X, CheckCircle2 } from "lucide-react";

interface InquiryModalProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function InquiryModal({ property, isOpen, onClose, onSuccess }: InquiryModalProps) {
  const { user } = useAuth();
  const agent = nagpurDb.getAgentById(property.agent_id);

  const [message, setMessage] = useState(
    `Hello ${agent?.name || "Agent"}, I am interested in "${property.title}" in ${property.locality}. Please share more details and best final pricing.`
  );
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const customer = nagpurDb.getCustomerById(user?.customerId || "cust-1");
    const authorName = user?.name || customer?.name || "Customer";
    nagpurDb.createInquiry({
      customer_id: user?.customerId || "cust-1",
      property_id: property.id,
      agent_id: property.agent_id,
      message,
      status: "new"
    }, authorName);

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onSuccess?.();
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-amber-400" />
            <h3 className="font-semibold text-base">Inquire About Property</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white rounded-lg p-1 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Inquiry Sent!</h4>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              The assigned local Nagpur broker and admin team have received your query. You will be notified when they reply.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Listing</span>
              <p className="font-semibold text-slate-900 text-sm mt-0.5 line-clamp-1">{property.title}</p>
              <p className="text-xs text-slate-500">{property.locality} • {property.price_range}</p>
            </div>

            {agent && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-slate-800">Assigned Broker: {agent.name}</p>
                  <p className="text-[11px] text-slate-500">{agent.agency}</p>
                </div>
                <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-medium">
                  Verified MahaRERA
                </span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Your Inquiry Message
              </label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 rounded-lg shadow-sm transition"
              >
                Send Inquiry
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
