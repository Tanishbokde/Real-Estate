import { NextResponse } from "next/server";
import { nagpurDb } from "@/lib/data/nagpur-mock-db";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

export async function GET(request: Request) {
  try {
    let resultCount = 0;

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.rpc("process_unattended_views_to_followups");
      if (error) throw error;
      resultCount = data || 0;
    } else {
      const result = nagpurDb.runFollowUpAutomation();
      resultCount = result.generatedCount;
    }

    return NextResponse.json({
      success: true,
      message: `Follow-up scanner completed. Generated ${resultCount} follow-up lead records.`,
      generated_count: resultCount,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return GET(request);
}
