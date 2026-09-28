import { NextResponse } from "next/server";
import { cookies } from "next/headers";
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

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/"
    };

    // Set cookie on server cookies() store
    try {
      const cookieStore = await cookies();
      cookieStore.set(SESSION_COOKIE_NAME, token, cookieOptions);
    } catch (_) {}

    const response = NextResponse.json({
      success: true,
      message: "Authenticated successfully",
      user: sessionUser
    });

    // Also set on response Set-Cookie header
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      ...cookieOptions
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
