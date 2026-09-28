import { NextResponse } from "next/server";
import { nagpurDb } from "@/lib/data/nagpur-mock-db";
import { supabaseService } from "@/lib/supabase/service";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { isMatchingId } from "@/lib/utils";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const email = searchParams.get("email");

    let customers = [];

    if (isSupabaseConfigured) {
      const { data, error } = await supabaseService.getCustomers();
      if (!error && data && data.length > 0) {
        // Merge with local accounts
        const local = nagpurDb.getCustomers();
        const map = new Map();
        local.forEach(c => map.set(c.email.toLowerCase(), c));
        data.forEach(c => map.set(c.email.toLowerCase(), c));
        customers = Array.from(map.values());
      } else {
        customers = nagpurDb.getCustomers();
      }
    } else {
      customers = nagpurDb.getCustomers();
    }

    if (id) {
      customers = customers.filter(c => isMatchingId(c.id, id) || c.user_id === id);
    }
    if (email) {
      customers = customers.filter(c => c.email.toLowerCase() === email.toLowerCase());
    }

    return NextResponse.json({
      success: true,
      count: customers.length,
      data: customers
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
    const { name, email, phone, password, preferences, status } = body;

    if (!name || !email || !phone) {
      return NextResponse.json(
        { success: false, error: "Customer name, email, and phone number are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();
    const finalPassword = password || "customer123";

    // 1. Create in Supabase if configured
    let supabaseCust = null;
    if (isSupabaseConfigured) {
      const supRes = await supabaseService.createCustomer({
        name: name.trim(),
        email: cleanEmail,
        phone: cleanPhone,
        preferences: preferences || {
          budget_min: 2500000,
          budget_max: 9500000,
          preferred_localities: ["Dharampeth", "Civil Lines"],
          bhk: [2, 3],
          listing_type: "buy"
        },
        status: status || "active"
      });
      if (supRes.data) {
        supabaseCust = supRes.data;
      }
    }

    // 2. Create in local store and register auth account
    const localResult = nagpurDb.createCustomerWithAuth(
      {
        name: name.trim(),
        email: cleanEmail,
        phone: cleanPhone,
        password: finalPassword,
        preferences: preferences || {
          budget_min: 2500000,
          budget_max: 9500000,
          preferred_localities: ["Dharampeth", "Civil Lines"],
          bhk: [2, 3],
          listing_type: "buy"
        }
      },
      finalPassword
    );

    const createdCustomer = supabaseCust || localResult.customer;

    // Log admin action in audit logs
    nagpurDb.addAuditLog(
      "Rajesh Agrawal (Admin)",
      "admin",
      "Created Customer Account",
      `Onboarded customer ${name} (${cleanEmail}) from Admin Panel with active login credentials`
    );

    return NextResponse.json({
      success: true,
      message: `Customer ${name} successfully added and registered!`,
      customer: createdCustomer,
      credentials: {
        email: cleanEmail,
        password: finalPassword
      }
    });
  } catch (err: any) {
    console.error("POST /api/customers error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
