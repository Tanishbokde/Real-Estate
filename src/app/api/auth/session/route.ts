import { NextResponse } from "next/server";
import { getServerSessionUser } from "@/lib/auth/session";

export async function GET() {
  try {
    const user = await getServerSessionUser();
    if (!user) {
      return NextResponse.json({
        success: false,
        authenticated: false,
        user: null
      });
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      user
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, authenticated: false, error: err.message },
      { status: 500 }
    );
  }
}
