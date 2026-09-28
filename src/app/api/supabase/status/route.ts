import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";
import { nagpurDb } from "@/lib/data/nagpur-mock-db";

export async function GET() {
  try {
    const health = await supabaseService.checkHealth();
    const localProps = nagpurDb.getProperties();
    const localAgents = nagpurDb.getAgents();

    return NextResponse.json({
      success: true,
      configured: health.isConfigured,
      connected: health.isConnected,
      message: health.message,
      tableCounts: health.tableCounts || {
        properties: localProps.length,
        agents: localAgents.length,
        customers: nagpurDb.getCustomers().length,
        inquiries: nagpurDb.getInquiries().length,
        visits: nagpurDb.getVisitRequests().length,
        localities: nagpurDb.getLocalities().length
      },
      source: health.isConnected ? "supabase_live" : "local_storage_active",
      timestamp: new Date().toISOString(),
      error: health.error
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
