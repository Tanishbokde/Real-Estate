import React from "react";
import { redirect } from "next/navigation";
import { getServerSessionUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getServerSessionUser();

  // If no user or role is not admin, redirect immediately on the server
  if (!user || user.role !== "admin") {
    redirect("/login/admin?redirect=%2Fadmin");
  }

  return <>{children}</>;
}
