import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";
import { nagpurDb } from "@/lib/data/nagpur-mock-db";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let property = null;

    if (isSupabaseConfigured) {
      const { data } = await supabaseService.getPropertyById(id);
      property = data;
    }

    if (!property) {
      property = nagpurDb.getPropertyById(id);
    }

    if (!property) {
      return NextResponse.json(
        { success: false, error: "Property not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: property
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = nagpurDb.updateProperty(id, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Property not found or update failed" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Property updated successfully",
      data: updated
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = nagpurDb.deleteProperty(id);

    return NextResponse.json({
      success,
      message: success ? "Property deleted successfully" : "Deletion failed"
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
