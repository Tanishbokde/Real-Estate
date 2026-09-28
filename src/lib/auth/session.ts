import { cookies } from "next/headers";
import { UserRole } from "@/lib/types/database";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  agency?: string;
  agentId?: string;
  customerId?: string;
  phone?: string;
}

export const SESSION_COOKIE_NAME = "nagpur_session";

export function encodeSession(user: SessionUser): string {
  const payload = {
    ...user,
    issuedAt: Date.now()
  };
  // Use URI-encoded JSON which is completely safe for HTTP cookies across all proxies, CDNs, and Edge runtimes
  return encodeURIComponent(JSON.stringify(payload));
}

export function decodeSession(token: string): SessionUser | null {
  if (!token) return null;
  try {
    let raw = token.trim();
    // 1. If cookie value was percent-encoded by browser or proxy (e.g. %7B or %3D%3D), decode it first
    if (raw.includes("%")) {
      try {
        raw = decodeURIComponent(raw);
      } catch (_) {}
    }

    let parsed: any = null;

    // 2. Direct JSON check
    if (raw.startsWith("{") && raw.endsWith("}")) {
      try {
        parsed = JSON.parse(raw);
      } catch (_) {}
    }

    // 3. Base64 / Base64URL fallback for backward compatibility
    if (!parsed) {
      let json = "";
      if (typeof Buffer !== "undefined") {
        try {
          json = Buffer.from(raw, "base64").toString("utf-8");
        } catch (_) {}
      }
      if (!json || !json.trim().startsWith("{")) {
        try {
          json = atob(raw);
        } catch (_) {}
      }
      if (json && json.trim().startsWith("{")) {
        try {
          parsed = JSON.parse(json);
        } catch (_) {}
      }
    }

    if (parsed && parsed.id && parsed.role && parsed.email) {
      return {
        id: parsed.id,
        email: parsed.email,
        name: parsed.name,
        role: parsed.role,
        agency: parsed.agency,
        agentId: parsed.agentId,
        customerId: parsed.customerId,
        phone: parsed.phone
      };
    }
    return null;
  } catch (err) {
    console.error("Session decode error:", err);
    return null;
  }
}

export async function getServerSessionUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (!sessionCookie?.value) return null;
    return decodeSession(sessionCookie.value);
  } catch {
    return null;
  }
}
