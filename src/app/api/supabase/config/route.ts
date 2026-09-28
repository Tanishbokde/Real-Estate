import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import {
  setRuntimeSupabaseConfig,
  getSupabaseUrl,
  getSupabaseAnonKey,
  getSupabaseServiceRoleKey,
  isSupabaseConfigured
} from "@/lib/supabase/client";
import { supabaseService } from "@/lib/supabase/service";
import { nagpurDb } from "@/lib/data/nagpur-mock-db";

export async function GET() {
  try {
    const url = getSupabaseUrl() || "";
    const anonKey = getSupabaseAnonKey() || "";
    const serviceKey = getSupabaseServiceRoleKey() || "";

    const health = await supabaseService.checkHealth();

    return NextResponse.json({
      configured: isSupabaseConfigured,
      connected: health.isConnected,
      message: health.message,
      url: url.includes("placeholder") ? "" : url,
      anonKeyMasked: anonKey.length > 10 ? `${anonKey.slice(0, 6)}...${anonKey.slice(-4)}` : "",
      hasServiceKey: Boolean(serviceKey && !serviceKey.includes("placeholder")),
      tableCounts: health.tableCounts || {
        properties: nagpurDb.getProperties().length,
        agents: nagpurDb.getAgents().length,
        customers: nagpurDb.getCustomers().length,
        inquiries: nagpurDb.getInquiries().length,
        visits: nagpurDb.getVisitRequests().length,
        auditLogs: nagpurDb.getAuditLogs().length
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url, anonKey, serviceKey } = body;

    if (!url || !anonKey) {
      return NextResponse.json(
        { success: false, message: "Both Supabase Project URL and Anon API Key are required." },
        { status: 400 }
      );
    }

    const cleanUrl = url.trim();
    const cleanAnon = anonKey.trim();
    const cleanService = (serviceKey || "").trim();

    // 1. Update runtime configuration in memory
    setRuntimeSupabaseConfig(cleanUrl, cleanAnon, cleanService || undefined);

    // 2. Persist to .env.local file
    try {
      const envPath = path.resolve(process.cwd(), ".env.local");
      const envContent = [
        `# Supabase Configuration for Nagpur Real Estate Platform`,
        `NEXT_PUBLIC_SUPABASE_URL=${cleanUrl}`,
        `NEXT_PUBLIC_SUPABASE_ANON_KEY=${cleanAnon}`,
        `SUPABASE_SERVICE_ROLE_KEY=${cleanService || "placeholder-service-role-key"}`,
        ``
      ].join("\n");
      fs.writeFileSync(envPath, envContent, "utf-8");
    } catch (fsErr: any) {
      console.warn("Failed to write to .env.local:", fsErr.message);
    }

    // 3. Test connection
    const health = await supabaseService.checkHealth();

    // 4. If connected, trigger initial sync
    if (health.isConnected) {
      await nagpurDb.syncFromSupabase();
    }

    return NextResponse.json({
      success: health.isConnected,
      connected: health.isConnected,
      message: health.isConnected
        ? "Successfully connected to Supabase and synchronized tables!"
        : `Credentials saved, but connection test reported: ${health.message}`,
      tableCounts: health.tableCounts
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
