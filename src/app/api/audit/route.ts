import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";
import { nagpurDb } from "@/lib/data/nagpur-mock-db";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "100", 10);

    let logs = [];

    if (isSupabaseConfigured) {
      const { data, error } = await supabaseService.getAuditLogs(limit);
      if (!error && data && data.length > 0) {
        logs = data;
      } else {
        logs = nagpurDb.getAuditLogs();
      }
    } else {
      logs = nagpurDb.getAuditLogs();
    }

    return NextResponse.json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.user_name || !body.role || !body.action || !body.details) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (user_name, role, action, details)" },
        { status: 400 }
      );
    }

    nagpurDb.addAuditLog(body.user_name, body.role, body.action, body.details);

    return NextResponse.json({
      success: true,
      message: "Audit log recorded successfully"
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
