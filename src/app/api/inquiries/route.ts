import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";
import { nagpurDb } from "@/lib/data/nagpur-mock-db";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId") || undefined;
    const agentId = searchParams.get("agentId") || undefined;

    let inquiries = [];

    if (isSupabaseConfigured) {
      const { data, error } = await supabaseService.getInquiries({ customerId, agentId });
      if (!error && data) {
        inquiries = data;
      } else {
        inquiries = nagpurDb.getInquiries();
      }
    } else {
      inquiries = nagpurDb.getInquiries();
    }

    if (customerId) {
      inquiries = inquiries.filter((i) => i.customer_id === customerId);
    }
    if (agentId) {
      inquiries = inquiries.filter((i) => i.agent_id === agentId);
    }

    return NextResponse.json({
      success: true,
      count: inquiries.length,
      data: inquiries
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
    if (!body.customer_id || !body.property_id || !body.message) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (customer_id, property_id, message)" },
        { status: 400 }
      );
    }

    const newInq = nagpurDb.createInquiry(body);

    return NextResponse.json({
      success: true,
      message: "Inquiry submitted successfully",
      data: newInq
    });
  } catch (err: any) {
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

    const updated = nagpurDb.updateInquiryStatus(body.id, body.status, body.agent_reply);

    return NextResponse.json({
      success: true,
      message: "Inquiry updated successfully",
      data: updated
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
