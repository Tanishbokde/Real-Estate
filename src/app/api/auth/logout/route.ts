import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session";

export async function POST() {
  try {
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully"
    });

    // Invalidate the session cookie on the server side completely
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/"
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
