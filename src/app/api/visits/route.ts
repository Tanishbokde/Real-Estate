import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";
import { nagpurDb } from "@/lib/data/nagpur-mock-db";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { isMatchingId, toUuid } from "@/lib/utils";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId") || undefined;
    const agentId = searchParams.get("agentId") || undefined;

    let visits = [];

    if (isSupabaseConfigured) {
      const { data, error } = await supabaseService.getVisitRequests();
      if (!error && data && data.length > 0) {
        visits = data;
      } else {
        visits = nagpurDb.getVisitRequests();
      }
    } else {
      visits = nagpurDb.getVisitRequests();
    }

    if (customerId) {
      visits = visits.filter((v) => isMatchingId(v.customer_id, customerId));
    }
    if (agentId) {
      visits = visits.filter((v) => isMatchingId(v.agent_id, agentId));
    }

    return NextResponse.json({
      success: true,
      count: visits.length,
      data: visits
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
    const { customer_id, property_id, agent_id, scheduled_date, time_slot, notes, author_name } = body;

    // Requirement 6: Specific Request Notes MUST be mandatory and cannot be empty
    if (!notes || !notes.trim()) {
      return NextResponse.json(
        { success: false, error: "Specific Request Notes is mandatory. Please provide visit details before confirming." },
        { status: 400 }
      );
    }

    if (!customer_id || !property_id || !scheduled_date || !time_slot) {
      return NextResponse.json(
        { success: false, error: "Missing required visit booking fields (customer_id, property_id, scheduled_date, time_slot)" },
        { status: 400 }
      );
    }

    // 1. Save to Supabase using service role key (bypasses RLS)
    let supabaseVisit = null;
    if (isSupabaseConfigured) {
      const supRes = await supabaseService.createVisitRequest({
        customer_id,
        property_id,
        agent_id: agent_id || undefined,
        scheduled_date,
        time_slot,
        status: "pending",
        notes: notes.trim(),
        agent_notes: undefined
      });

      if (supRes.data) {
        supabaseVisit = supRes.data;
      }
    }

    // 2. Save to local in-memory store & log audit
    const visitPayload = {
      customer_id: supabaseVisit?.customer_id || customer_id,
      property_id: supabaseVisit?.property_id || property_id,
      agent_id: supabaseVisit?.agent_id || agent_id,
      scheduled_date,
      time_slot,
      status: "pending" as const,
      notes: notes.trim()
    };

    const newVisit = nagpurDb.createVisitRequest(visitPayload, author_name || "Customer");
    if (supabaseVisit?.id) {
      newVisit.id = supabaseVisit.id;
    }

    return NextResponse.json({
      success: true,
      message: "Property visit request submitted and saved to database successfully",
      data: supabaseVisit || newVisit
    });
  } catch (err: any) {
    console.error("POST /api/visits error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    if (!body.id || !body.status) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (id, status)" },
        { status: 400 }
      );
    }

    const reschedule = (body.scheduled_date || body.time_slot) ? {
      scheduled_date: body.scheduled_date,
      time_slot: body.time_slot
    } : undefined;

    // 1. Update in Supabase if configured
    if (isSupabaseConfigured) {
      await supabaseService.updateVisitStatus(
        body.id,
        body.status,
        body.agent_notes,
        reschedule
      );
    }

    // 2. Update in nagpurDb
    const updated = nagpurDb.updateVisitStatus(
      body.id,
      body.status,
      body.agent_notes,
      reschedule,
      body.author_name
    );

    return NextResponse.json({
      success: true,
      message: reschedule
        ? "Visit rescheduled and updated in database successfully"
        : "Visit status updated in database successfully",
      data: updated
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
