import { NextResponse } from "next/server";
import { nagpurDb } from "@/lib/data/nagpur-mock-db";
import { supabaseService } from "@/lib/supabase/service";
import { isSupabaseConfigured } from "@/lib/supabase/client";

async function performSync() {
  if (!isSupabaseConfigured) {
    return {
      success: true,
      message: "Supabase not configured in .env.local, using local mock store.",
      data: {
        properties: nagpurDb.getProperties(),
        agents: nagpurDb.getAgents(),
        customers: nagpurDb.getCustomers(),
        visits: nagpurDb.getVisitRequests(),
        inquiries: nagpurDb.getInquiries(),
        auditLogs: nagpurDb.getAuditLogs(),
        localities: nagpurDb.getLocalities()
      }
    };
  }

  // Fetch all Supabase tables using service role key (bypasses RLS)
  const [propsRes, agentsRes, custsRes, visitsRes, inqsRes, auditRes, locsRes] = await Promise.all([
    supabaseService.getProperties(),
    supabaseService.getAgents(),
    supabaseService.getCustomers(),
    supabaseService.getVisitRequests(),
    supabaseService.getInquiries(),
    supabaseService.getAuditLogs(),
    supabaseService.getLocalities()
  ]);

  const properties = (propsRes.data && propsRes.data.length > 0) ? propsRes.data : nagpurDb.getProperties();
  const agents = (agentsRes.data && agentsRes.data.length > 0) ? agentsRes.data : nagpurDb.getAgents();
  
  // For customers, merge Supabase customers with any registered local accounts
  const supabaseCusts = custsRes.data || [];
  const localCusts = nagpurDb.getCustomers();
  const custMap = new Map();
  localCusts.forEach(c => custMap.set(c.email.toLowerCase(), c));
  supabaseCusts.forEach(c => custMap.set(c.email.toLowerCase(), c));
  const customers = Array.from(custMap.values());

  const visits = (visitsRes.data && visitsRes.data.length > 0) ? visitsRes.data : nagpurDb.getVisitRequests();
  const inquiries = (inqsRes.data && inqsRes.data.length > 0) ? inqsRes.data : nagpurDb.getInquiries();
  const auditLogs = (auditRes.data && auditRes.data.length > 0) ? auditRes.data : nagpurDb.getAuditLogs();
  const localities = (locsRes.data && locsRes.data.length > 0) ? locsRes.data : nagpurDb.getLocalities();

  return {
    success: true,
    message: `Synchronized ${properties.length} properties, ${agents.length} brokers, ${customers.length} customers, ${visits.length} scheduled visits, and ${inquiries.length} inquiries with Supabase!`,
    data: {
      properties,
      agents,
      customers,
      visits,
      inquiries,
      auditLogs,
      localities
    }
  };
}

export async function GET() {
  try {
    const result = await performSync();
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("GET /api/supabase/sync error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const result = await performSync();
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("POST /api/supabase/sync error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
