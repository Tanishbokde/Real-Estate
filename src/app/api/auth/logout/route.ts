import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session";

export async function POST() {
  try {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      maxAge: 0,
      path: "/"
    };

    try {
      const cookieStore = await cookies();
      cookieStore.set(SESSION_COOKIE_NAME, "", cookieOptions);
    } catch (_) {}

    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully"
    });

    // Invalidate the session cookie on the server side completely
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: "",
      ...cookieOptions
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
