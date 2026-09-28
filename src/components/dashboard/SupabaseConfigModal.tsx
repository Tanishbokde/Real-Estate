"use client";

import React, { useState, useEffect } from "react";
import { Database, CheckCircle2, AlertCircle, X, ExternalLink, RefreshCw, Key, ShieldCheck, Copy, Check } from "lucide-react";
import { getSupabaseDashboardUrl } from "@/lib/supabase/client";

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function SupabaseConfigModal({ isOpen, onClose, onSuccess }: SupabaseConfigModalProps) {
  const [url, setUrl] = useState("");
  const [anonKey, setAnonKey] = useState("");
  const [serviceKey, setServiceKey] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
  const [sqlCopied, setSqlCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch("/api/supabase/config")
        .then(res => res.json())
        .then(data => {
          if (data.url) setUrl(data.url);
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !anonKey.trim()) {
      setStatusMsg({ type: "error", text: "Please provide both Project URL and Anon API Key." });
      return;
    }

    setIsSaving(true);
    setStatusMsg({ type: "info", text: "Connecting to Supabase and testing table queries..." });

    try {
      const res = await fetch("/api/supabase/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url.trim(),
          anonKey: anonKey.trim(),
          serviceKey: serviceKey.trim() || undefined
        })
      });

      const data = await res.json();

      if (data.success) {
        setStatusMsg({ type: "success", text: "Successfully connected to Supabase and verified tables!" });
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      } else {
        setStatusMsg({ type: "error", text: data.message || "Failed to connect to Supabase. Check credentials." });
      }
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message || "Network error while saving credentials." });
    } finally {
      setIsSaving(false);
    }
  };

  const sqlSetupSnippet = `-- 1. Create audit_logs table for platform history
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  user_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  action TEXT NOT NULL,
  details TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public and anon can insert audit logs" ON public.audit_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read access for audit logs" ON public.audit_logs FOR SELECT USING (true);
CREATE POLICY "Public can update visit requests" ON public.visit_requests FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public can update inquiries" ON public.inquiries FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public can update properties" ON public.properties FOR UPDATE USING (true) WITH CHECK (true);`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 sm:p-5 animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200">
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Connect Supabase PostgreSQL</h3>
              <p className="text-xs text-slate-300">Live database sync for properties, visits, inquiries &amp; audit history</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {statusMsg && (
          <div className={`px-6 py-2.5 text-xs font-semibold flex items-center gap-2 ${
            statusMsg.type === "success" ? "bg-emerald-600 text-white" :
            statusMsg.type === "error" ? "bg-rose-600 text-white" : "bg-blue-600 text-white"
          }`}>
            {statusMsg.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Project URL <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://xyzcompany.supabase.co"
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono text-xs"
            />
            <p className="text-[11px] text-slate-400 mt-1">Found under Supabase Settings &rarr; API &rarr; Project URL</p>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Anon Public API Key <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              required
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono text-xs"
            />
            <p className="text-[11px] text-slate-400 mt-1">Found under Supabase Settings &rarr; API &rarr; Project API keys (anon public)</p>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Service Role Key (Optional, Recommended for Admin RLS Bypass)
            </label>
            <input
              type="password"
              value={serviceKey}
              onChange={(e) => setServiceKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono text-xs"
            />
            <p className="text-[11px] text-slate-400 mt-1">Allows server API to write audit logs and update visits without RLS restrictions</p>
          </div>

          {/* Quick SQL Helper Box */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Supabase SQL Setup for Audit Logs &amp; RLS</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(sqlSetupSnippet);
                  setSqlCopied(true);
                  setTimeout(() => setSqlCopied(false), 2000);
                }}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
              >
                {sqlCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{sqlCopied ? "Copied SQL!" : "Copy SQL"}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Paste this in your Supabase SQL Editor to make sure the <code>public.audit_logs</code> table and update policies exist.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-emerald-600 hover:underline flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Open Supabase Dashboard</span>
            </a>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm disabled:opacity-50"
              >
                {isSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{isSaving ? "Connecting..." : "Save & Connect"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
