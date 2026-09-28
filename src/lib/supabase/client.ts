import { createClient, SupabaseClient } from "@supabase/supabase-js";

let runtimeUrl: string | null = null;
let runtimeAnonKey: string | null = null;
let runtimeServiceKey: string | null = null;

export function setRuntimeSupabaseConfig(url: string, anonKey: string, serviceKey?: string) {
  runtimeUrl = url;
  runtimeAnonKey = anonKey;
  if (serviceKey) runtimeServiceKey = serviceKey;
}

export function getSupabaseUrl(): string | undefined {
  const url = runtimeUrl || process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return undefined;
  return url.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
}

export function getSupabaseAnonKey(): string | undefined {
  return runtimeAnonKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

export function getSupabaseServiceRoleKey(): string | undefined {
  return runtimeServiceKey || process.env.SUPABASE_SERVICE_ROLE_KEY;
}

export const isSupabaseConfigured = Boolean(
  (getSupabaseUrl() && getSupabaseAnonKey()) &&
  !getSupabaseUrl()?.includes("your-project") &&
  !getSupabaseUrl()?.includes("placeholder") &&
  !getSupabaseAnonKey()?.includes("placeholder")
);

export function getSupabaseClient(): SupabaseClient | null {
  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();
  if (!url || !anonKey || url.includes("your-project") || url.includes("placeholder") || anonKey.includes("placeholder")) {
    return null;
  }
  return createClient(url, anonKey);
}

export function getSupabaseAdminClient(): SupabaseClient | null {
  const url = getSupabaseUrl();
  const serviceKey = getSupabaseServiceRoleKey();
  const anonKey = getSupabaseAnonKey();

  if (!url || url.includes("your-project") || url.includes("placeholder")) {
    return null;
  }

  // Use service role key if valid (bypasses RLS on server)
  if (serviceKey && !serviceKey.includes("placeholder")) {
    return createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
  }

  // Fallback to anon key
  if (anonKey && !anonKey.includes("placeholder")) {
    return createClient(url, anonKey);
  }

  return null;
}

export const supabase = getSupabaseClient();

export function getSupabaseDashboardUrl(): string {
  const url = getSupabaseUrl();
  if (!url || !isSupabaseConfigured) {
    return "https://supabase.com/dashboard";
  }
  try {
    const parsed = new URL(url);
    const parts = parsed.hostname.split(".");
    if (parts.length >= 3 && parts[1] === "supabase" && parts[2] === "co") {
      return `https://supabase.com/dashboard/project/${parts[0]}/editor`;
    }
  } catch {}
  return "https://supabase.com/dashboard";
}


