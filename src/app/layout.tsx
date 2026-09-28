import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { NagpurAiChatbot } from "@/components/chatbot/NagpurAiChatbot";

export const metadata: Metadata = {
  title: "Nagpur Realty | Premier Real Estate & Property Management Platform",
  description:
    "Nagpur's trusted property marketplace and management system. Discover flats, villas, commercial showrooms, and NIT plots across Dharampeth, Civil Lines, Besa, and Wardha Road with full admin oversight.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-orange-500 selection:text-white">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <NagpurAiChatbot />
        </AuthProvider>
      </body>
    </html>
  );
}
