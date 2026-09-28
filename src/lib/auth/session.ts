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
  return Buffer.from(JSON.stringify(payload), "utf-8").toString("base64");
}

export function decodeSession(token: string): SessionUser | null {
  try {
    const json = Buffer.from(token, "base64").toString("utf-8");
    const parsed = JSON.parse(json);
    if (parsed.id && parsed.role && parsed.email) {
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
  } catch {
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
