import { NextResponse } from "next/server";
import { nagpurDb } from "@/lib/data/nagpur-mock-db";
import { encodeSession, SESSION_COOKIE_NAME, SessionUser } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { role, email, password } = body;

    if (!role || !email) {
      return NextResponse.json(
        { success: false, error: "Role and email are required" },
        { status: 400 }
      );
    }

    const authResult = nagpurDb.authenticateUser(role, email, password);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: authResult.message || "Invalid credentials" },
        { status: 401 }
      );
    }

    const sessionUser: SessionUser = authResult.user;
    const token = encodeSession(sessionUser);

    const response = NextResponse.json({
      success: true,
      message: "Authenticated successfully",
      user: sessionUser
    });

    // Set secure HTTP-only cookie
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/"
    });

    return response;
  } catch (err: any) {
    console.error("Login route error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
