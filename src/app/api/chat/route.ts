import { NextResponse } from "next/server";
import { nagpurDb } from "@/lib/data/nagpur-mock-db";

export async function POST(request: Request) {
  try {
    const { query } = await request.json();
    if (!query) {
      return NextResponse.json({ error: "Missing query" }, { status: 400 });
    }

    const q = query.toLowerCase();
    const allProps = nagpurDb.getProperties().filter((p) => p.status === "available");

    // Match properties based on query keywords
    let matches = allProps;
    if (q.includes("dharampeth")) matches = matches.filter((p) => p.locality.toLowerCase().includes("dharampeth"));
    else if (q.includes("civil lines")) matches = matches.filter((p) => p.locality.toLowerCase().includes("civil"));
    else if (q.includes("wardha")) matches = matches.filter((p) => p.locality.toLowerCase().includes("wardha"));
    else if (q.includes("besa")) matches = matches.filter((p) => p.locality.toLowerCase().includes("besa"));
    else if (q.includes("sadar")) matches = matches.filter((p) => p.locality.toLowerCase().includes("sadar"));
    else if (q.includes("commercial")) matches = matches.filter((p) => p.type === "commercial");
    else if (q.includes("rent")) matches = matches.filter((p) => p.listing_type === "rent");

    return NextResponse.json({
      success: true,
      matches: matches.slice(0, 3),
      answer: `Here are available options in Nagpur matching your request:`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
