import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatINR(price: number, listingType: "buy" | "rent" = "buy"): string {
  if (listingType === "rent") {
    return `₹${price.toLocaleString("en-IN")}/mo`;
  }

  if (price >= 10000000) {
    const cr = (price / 10000000).toFixed(2);
    return `₹${cr.endsWith(".00") ? cr.slice(0, -3) : cr} Cr`;
  }

  if (price >= 100000) {
    const lk = (price / 100000).toFixed(2);
    return `₹${lk.endsWith(".00") ? lk.slice(0, -3) : lk} Lakh`;
  }

  return `₹${price.toLocaleString("en-IN")}`;
}

export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return dateString;
  }
}

export function isValidUuid(id?: string | null): boolean {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

export function toUuid(id?: string | null): string | undefined {
  if (!id) return undefined;
  if (isValidUuid(id)) return id;
  const m = id.match(/^(loc|agent|cust|prop|inq|visit)-(\d+)$/i);
  if (m) {
    const type = m[1].toLowerCase();
    const num = parseInt(m[2], 10);
    const padNum = num.toString().padStart(3, "0");
    switch (type) {
      case "loc": return `11111111-1111-1111-1111-111111111${padNum}`;
      case "agent": return `22222222-2222-2222-2222-222222222${padNum}`;
      case "cust": return `33333333-3333-3333-3333-333333333${padNum}`;
      case "prop": return `44444444-4444-4444-4444-444444444${padNum}`;
      case "inq": return `55555555-5555-5555-5555-555555555${padNum}`;
      case "visit": return `66666666-6666-6666-6666-666666666${padNum}`;
    }
  }
  return id;
}

export function fromUuid(uuid?: string | null): string | undefined {
  if (!uuid) return undefined;
  const m = uuid.match(/^([1-6])\1{7}-\1{4}-\1{4}-\1{4}-\1{9}(\d{3})$/);
  if (m) {
    const prefixNum = m[1];
    const itemNum = parseInt(m[2], 10);
    const prefixes: Record<string, string> = {
      "1": "loc-",
      "2": "agent-",
      "3": "cust-",
      "4": "prop-",
      "5": "inq-",
      "6": "visit-"
    };
    if (prefixes[prefixNum]) {
      return prefixes[prefixNum] + itemNum;
    }
  }
  return uuid;
}

export function isMatchingId(a?: string | null, b?: string | null): boolean {
  if (!a || !b) return false;
  if (a === b) return true;
  const aClean = a.trim().toLowerCase();
  const bClean = b.trim().toLowerCase();
  if (aClean === bClean) return true;

  const uuidA = toUuid(a);
  const uuidB = toUuid(b);
  if (uuidA && uuidB && uuidA.toLowerCase() === uuidB.toLowerCase()) return true;

  const mockA = fromUuid(a);
  const mockB = fromUuid(b);
  if (mockA && mockB && mockA.toLowerCase() === mockB.toLowerCase()) return true;

  if (uuidA && uuidA.toLowerCase() === bClean) return true;
  if (uuidB && aClean === uuidB.toLowerCase()) return true;

  return false;
}

