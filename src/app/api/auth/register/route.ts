import { NextResponse } from "next/server";
import { nagpurDb } from "@/lib/data/nagpur-mock-db";
import { encodeSession, SESSION_COOKIE_NAME, SessionUser } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, password, preferences } = body;

    if (!name || !email || !phone) {
      return NextResponse.json(
        { success: false, error: "Name, email, and phone are required" },
        { status: 400 }
      );
    }

    const regResult = nagpurDb.createCustomerWithAuth({
      name,
      email,
      phone,
      password: password || "customer123",
      preferences
    });

    if (!regResult.success || !regResult.user) {
      return NextResponse.json(
        { success: false, error: regResult.message || "Registration failed" },
        { status: 400 }
      );
    }

    const sessionUser: SessionUser = regResult.user;
    const token = encodeSession(sessionUser);

    const response = NextResponse.json({
      success: true,
      message: "Customer account created successfully",
      user: sessionUser
    });

    // Set secure HTTP-only cookie
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
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
