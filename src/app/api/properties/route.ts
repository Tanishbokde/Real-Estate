import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";
import { nagpurDb } from "@/lib/data/nagpur-mock-db";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const locality = searchParams.get("locality");
    const listingType = searchParams.get("listing_type");

    let properties = [];

    if (isSupabaseConfigured) {
      const { data, error } = await supabaseService.getProperties();
      if (!error && data && data.length > 0) {
        properties = data;
      } else {
        properties = nagpurDb.getProperties();
      }
    } else {
      properties = nagpurDb.getProperties();
    }

    if (locality && locality !== "all") {
      properties = properties.filter(
        (p) => p.locality.toLowerCase() === locality.toLowerCase()
      );
    }
    if (listingType && listingType !== "all") {
      properties = properties.filter((p) => p.listing_type === listingType);
    }

    return NextResponse.json({
      success: true,
      count: properties.length,
      source: isSupabaseConfigured ? "supabase" : "local_store",
      data: properties
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
    if (!body.title || !body.price || !body.locality) {
      return NextResponse.json(
        { success: false, error: "Missing required property fields (title, price, locality)" },
        { status: 400 }
      );
    }

    const newProp = nagpurDb.createProperty(body);

    return NextResponse.json({
      success: true,
      message: "Property created successfully",
      data: newProp
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
    const { id, authorName, ...updates } = body;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing property ID for update" },
        { status: 400 }
      );
    }

    const updated = nagpurDb.updateProperty(id, updates, authorName || "Admin / Broker");
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Property not found" },
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

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const authorName = searchParams.get("author") || "Admin";

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing property ID for deletion" },
        { status: 400 }
      );
    }

    const deleted = nagpurDb.deleteProperty(id, authorName);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Property not found or deletion failed" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Property deleted successfully"
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

