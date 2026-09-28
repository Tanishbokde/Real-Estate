"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { nagpurDb } from "@/lib/data/nagpur-mock-db";
import { useAuth } from "@/context/AuthContext";
import { Property, PropertyLocation, Inquiry, VisitRequest, AppNotification } from "@/lib/types/database";
import { formatINR, formatDate, formatDateTime, isMatchingId } from "@/lib/utils";
import { PropertyCard } from "@/components/properties/PropertyCard";
import {
  Heart,
  Calendar,
  MessageSquare,
  Bell,
  CheckCircle2,
  Clock,
  MapPin,
  Send,
  User,
  ExternalLink,
  Building2,
  Search,
  Filter,
  Layers,
  Sparkles,
  Phone,
  LogOut
} from "lucide-react";

export default function CustomerDashboardPage() {
  const router = useRouter();
  const { user, role, isAuthenticated, isLoading, logout, switchUser } = useAuth();
  const customerId = user?.customerId || user?.id || "";

  // Active sub-tab (Defaults to browse_properties so customers immediately see available properties & locations)
  const [activeTab, setActiveTab] = useState<
    "browse_properties" | "visits" | "inquiries" | "favorites" | "messages" | "notifications"
  >("browse_properties");

  const [properties, setProperties] = useState<Property[]>([]);
  const [localities, setLocalities] = useState<PropertyLocation[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [visits, setVisits] = useState<VisitRequest[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [chatMessage, setChatMessage] = useState("");

  // Customer in-dashboard property search & locality filter
  const [selectedLocality, setSelectedLocality] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("all");

  // Redirect unauthorized users immediately
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || role !== "customer")) {
      router.push("/login/customer");
    }
  }, [isLoading, isAuthenticated, role, router]);

  // Back button cache security: Force re-validation when returning via back button
  useEffect(() => {
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        window.location.reload();
      }
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  const loadData = () => {
    if (!customerId && !user) return;
    const allCusts = nagpurDb.getCustomers();
    const currentCust = allCusts.find(c =>
      isMatchingId(c.id, customerId) ||
      (user?.email && c.email.toLowerCase() === user.email.toLowerCase())
    );
    const activeCustId = currentCust?.id || customerId;

    setProperties(nagpurDb.getProperties());
    setLocalities(nagpurDb.getLocalities());
    setFavoriteIds(nagpurDb.getFavorites(activeCustId));
    setInquiries(nagpurDb.getInquiries().filter((i) => 
      isMatchingId(i.customer_id, activeCustId) || isMatchingId(i.customer_id, customerId)
    ));
    setVisits(nagpurDb.getVisitRequests().filter((v) => 
      isMatchingId(v.customer_id, activeCustId) || isMatchingId(v.customer_id, customerId)
    ));
    setNotifications(nagpurDb.getNotifications(user?.id || ""));
  };

  useEffect(() => {
    if (customerId || user) {
      loadData();
      nagpurDb.syncFromSupabase().then(() => loadData()).catch(() => {});
      const handleUpdate = () => loadData();
      window.addEventListener("nagpur_db_updated", handleUpdate);
      return () => window.removeEventListener("nagpur_db_updated", handleUpdate);
    }
  }, [customerId, user?.id]);

  const favoriteProperties = properties.filter((p) => favoriteIds.includes(p.id));

  // Count available properties per location (User requirement: "how many properties are available in each location")
  const locationCounts: { [localityName: string]: number } = {};
  properties.forEach((p) => {
    if (p.status === "available") {
      locationCounts[p.locality] = (locationCounts[p.locality] || 0) + 1;
    }
  });

  // Filtered available properties for customer view
  const availableProperties = properties.filter((p) => {
    if (p.status !== "available" && p.status !== "pending") return false;
    if (selectedLocality !== "all" && p.locality.toLowerCase() !== selectedLocality.toLowerCase()) return false;
    if (filterType !== "all" && p.listing_type !== filterType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.locality.toLowerCase().includes(q) ||
        p.features.some((f) => f.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleCancelVisit = async (visitId: string) => {
    if (confirm("Are you sure you want to cancel this property visit?")) {
      nagpurDb.updateVisitStatus(visitId, "cancelled", "Cancelled by customer", undefined, user?.name || "Customer");
      try {
        await fetch("/api/visits", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: visitId,
            status: "cancelled",
            agent_notes: "Cancelled by customer",
            author_name: user?.name || "Customer"
          })
        });
      } catch (e) {
        console.warn("PUT /api/visits cancel error:", e);
      }
      loadData();
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    nagpurDb.createNotification({
      user_id: "usr-admin",
      type: "inquiry",
      message: `Message from ${user?.name || "Customer"}: "${chatMessage}"`,
      read_status: false,
      link: "/admin"
    });

    setChatMessage("");
    alert("Message sent to assigned Nagpur broker!");
    loadData();
  };

  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-600">Verifying customer authentication session...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. CUSTOMER WELCOME BANNER */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-[11px] font-bold uppercase tracking-wider backdrop-blur-xs">
              Customer Home Hub
            </span>
            <span className="text-xs text-orange-100">• Verified Account: {customerId}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Namaste, {user?.name || "Customer"}!
          </h1>
          <p className="text-xs sm:text-sm text-orange-100 max-w-xl">
            Email: <span className="font-semibold text-white">{user?.email}</span> {user?.phone && <>• Phone: <span className="font-semibold text-white">{user?.phone}</span></>}
          </p>
        </div>

        {/* Visible, working Logout Action button */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={async () => {
              await logout();
              router.push("/login/customer");
            }}
            className="px-4 py-2.5 bg-slate-950/40 hover:bg-slate-950/70 border border-white/30 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition cursor-pointer shadow-md"
            title="Log out from customer session"
          >
            <LogOut className="w-4 h-4 text-rose-300" />
            Sign Out
          </button>
        </div>
      </div>

      {/* 2. LOCATIONS AVAILABILITY BREAKDOWN (Direct user requirement) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-600" />
              Nagpur Locality Inventory Breakdown
            </h2>
            <p className="text-xs text-slate-500">
              Shows how many properties are currently available across Nagpur&apos;s 21 micro-markets. Click any area to filter.
            </p>
          </div>
          {selectedLocality !== "all" && (
            <button
              onClick={() => setSelectedLocality("all")}
              className="text-xs font-semibold text-orange-600 hover:text-orange-700 self-start sm:self-auto cursor-pointer"
            >
              Clear Filter (Show All)
            </button>
          )}
        </div>

        {/* Location Count Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
          <button
            onClick={() => setSelectedLocality("all")}
            className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
              selectedLocality === "all"
                ? "bg-orange-600 text-white border-orange-600 shadow-sm"
                : "bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100"
            }`}
          >
            <span className="text-[11px] font-bold">All Nagpur Areas</span>
            <span className="text-lg font-black mt-1">
              {properties.filter((p) => p.status === "available").length} <span className="text-xs font-normal">Available</span>
            </span>
          </button>

          {localities.slice(0, 11).map((loc) => {
            const count = locationCounts[loc.name] || 0;
            const isSelected = selectedLocality.toLowerCase() === loc.name.toLowerCase();

            return (
              <button
                key={loc.id}
                onClick={() => setSelectedLocality(loc.name)}
                className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "bg-orange-600 text-white border-orange-600 shadow-sm"
                    : "bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100"
                }`}
              >
                <div className="truncate">
                  <span className="text-[11px] font-bold truncate block">{loc.name}</span>
                  <span className={`text-[10px] ${isSelected ? "text-orange-100" : "text-slate-400"}`}>
                    {loc.zone}
                  </span>
                </div>
                <span className="text-lg font-black mt-1">
                  {count} <span className="text-[11px] font-normal">avail</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. CUSTOMER KPI CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveTab("browse_properties")}
          className={`p-5 rounded-2xl border transition cursor-pointer ${
            activeTab === "browse_properties" ? "bg-orange-50 border-orange-300 ring-2 ring-orange-500" : "bg-white border-slate-200 hover:shadow-md"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Available Properties</span>
            <Building2 className="w-4 h-4 text-orange-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {properties.filter((p) => p.status === "available").length}
          </p>
        </div>

        <div
          onClick={() => setActiveTab("visits")}
          className={`p-5 rounded-2xl border transition cursor-pointer ${
            activeTab === "visits" ? "bg-orange-50 border-orange-300 ring-2 ring-orange-500" : "bg-white border-slate-200 hover:shadow-md"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">My Scheduled Visits</span>
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{visits.length}</p>
        </div>

        <div
          onClick={() => setActiveTab("inquiries")}
          className={`p-5 rounded-2xl border transition cursor-pointer ${
            activeTab === "inquiries" ? "bg-orange-50 border-orange-300 ring-2 ring-orange-500" : "bg-white border-slate-200 hover:shadow-md"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">My Inquiries</span>
            <MessageSquare className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{inquiries.length}</p>
        </div>

        <div
          onClick={() => setActiveTab("favorites")}
          className={`p-5 rounded-2xl border transition cursor-pointer ${
            activeTab === "favorites" ? "bg-orange-50 border-orange-300 ring-2 ring-orange-500" : "bg-white border-slate-200 hover:shadow-md"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Saved Favorites</span>
            <Heart className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{favoriteIds.length}</p>
        </div>
      </div>

      {/* 4. TABS NAVIGATION */}
      <div className="border-b border-slate-200">
        <div className="flex items-center gap-2 sm:gap-6 overflow-x-auto text-xs sm:text-sm font-semibold">
          <button
            onClick={() => setActiveTab("browse_properties")}
            className={`py-3 border-b-2 transition whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === "browse_properties"
                ? "border-orange-600 text-orange-600 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Building2 className="w-4 h-4" />
            Available Properties ({availableProperties.length})
          </button>

          <button
            onClick={() => setActiveTab("visits")}
            className={`py-3 border-b-2 transition whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === "visits"
                ? "border-orange-600 text-orange-600 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Calendar className="w-4 h-4" />
            My Site Visits ({visits.length})
          </button>

          <button
            onClick={() => setActiveTab("inquiries")}
            className={`py-3 border-b-2 transition whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === "inquiries"
                ? "border-orange-600 text-orange-600 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            My Inquiries ({inquiries.length})
          </button>

          <button
            onClick={() => setActiveTab("favorites")}
            className={`py-3 border-b-2 transition whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === "favorites"
                ? "border-orange-600 text-orange-600 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Heart className="w-4 h-4" />
            Saved Favorites ({favoriteIds.length})
          </button>

          <button
            onClick={() => setActiveTab("messages")}
            className={`py-3 border-b-2 transition whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === "messages"
                ? "border-orange-600 text-orange-600 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <User className="w-4 h-4" />
            Message Broker
          </button>

          <button
            onClick={() => setActiveTab("notifications")}
            className={`py-3 border-b-2 transition whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === "notifications"
                ? "border-orange-600 text-orange-600 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Bell className="w-4 h-4" />
            Notifications ({notifications.length})
          </button>
        </div>
      </div>

      {/* 5. TAB CONTENT */}

      {/* TAB 1: BROWSE AVAILABLE PROPERTIES */}
      {activeTab === "browse_properties" && (
        <div className="space-y-6">
          {/* Quick Inline Search & Type Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search available properties in Nagpur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setFilterType("all")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  filterType === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType("buy")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  filterType === "buy" ? "bg-blue-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                For Sale
              </button>
              <button
                onClick={() => setFilterType("rent")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  filterType === "rent" ? "bg-purple-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                For Rent
              </button>
            </div>
          </div>

          {availableProperties.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-xs text-slate-500">
              No available properties match your current filter. Try selecting &ldquo;All Nagpur Areas&rdquo;.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableProperties.map((prop) => (
                <PropertyCard
                  key={prop.id}
                  property={prop}
                  onFavoriteToggle={() => loadData()}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY SITE VISITS */}
      {activeTab === "visits" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Your Scheduled Property Walkthroughs</h2>
            <button
              onClick={() => setActiveTab("browse_properties")}
              className="text-xs text-orange-600 hover:text-orange-700 font-semibold"
            >
              + Book Another Visit
            </button>
          </div>

          {visits.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-xs text-slate-500 space-y-3">
              <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
              <p>You have not scheduled any property visits yet.</p>
              <button
                onClick={() => setActiveTab("browse_properties")}
                className="px-4 py-2 bg-orange-600 text-white font-bold rounded-xl text-xs"
              >
                Browse Available Properties
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {visits.map((visit) => {
                const prop = nagpurDb.getPropertyById(visit.property_id);
                const agent = prop?.agent_id ? nagpurDb.getAgentById(prop.agent_id) : null;

                const statusColor = {
                  pending: "bg-amber-100 text-amber-800 border-amber-200",
                  confirmed: "bg-emerald-100 text-emerald-800 border-emerald-200",
                  completed: "bg-blue-100 text-blue-800 border-blue-200",
                  cancelled: "bg-rose-100 text-rose-800 border-rose-200",
                  rejected: "bg-slate-200 text-slate-700 border-slate-300",
                }[visit.status];

                return (
                  <div
                    key={visit.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusColor} capitalize`}>
                          {visit.status}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Scheduled: {visit.scheduled_date}
                        </span>
                      </div>

                      {prop && (
                        <div className="flex items-start gap-3 pt-1">
                          <img
                            src={prop.images[0]}
                            alt={prop.title}
                            className="w-14 h-14 rounded-xl object-cover shrink-0"
                          />
                          <div>
                            <Link
                              href={`/properties/${prop.id}`}
                              className="font-bold text-slate-900 text-xs hover:text-orange-600 line-clamp-1"
                            >
                              {prop.title}
                            </Link>
                            <p className="text-[11px] text-slate-500">{prop.locality} • {formatINR(prop.price, prop.listing_type)}</p>
                          </div>
                        </div>
                      )}

                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1">
                        <p className="text-slate-700">
                          <strong>Slot:</strong> {visit.time_slot}
                        </p>
                        {agent && (
                          <p className="text-slate-700">
                            <strong>Assigned Broker:</strong> {agent.name} ({agent.phone})
                          </p>
                        )}
                        {visit.notes && (
                          <p className="text-[11px] text-slate-500 italic">
                            &ldquo;{visit.notes}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>

                    {(visit.status === "pending" || visit.status === "confirmed") && (
                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => handleCancelVisit(visit.id)}
                          className="px-3 py-1 text-xs text-rose-600 hover:bg-rose-50 rounded-lg font-medium transition"
                        >
                          Cancel Visit
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MY INQUIRIES */}
      {activeTab === "inquiries" && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900">Your Property Inquiries</h2>

          {inquiries.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-xs text-slate-500">
              No inquiries submitted yet.
            </div>
          ) : (
            <div className="space-y-4">
              {inquiries.map((inq) => {
                const prop = nagpurDb.getPropertyById(inq.property_id);
                const agent = inq.agent_id ? nagpurDb.getAgentById(inq.agent_id) : null;

                return (
                  <div key={inq.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs sm:text-sm">
                        {prop?.title || "Property Details"}
                      </span>
                      <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded capitalize font-semibold">
                        Status: {inq.status}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700">
                      <span className="font-semibold text-slate-900 block mb-0.5">Your Question:</span>
                      {inq.message}
                    </div>

                    {inq.agent_reply ? (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-1">
                        <span className="font-bold block">Broker Reply ({agent?.name || "Nagpur Premier Realty"}):</span>
                        <p>{inq.agent_reply}</p>
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 italic">
                        Awaiting response from broker. You will receive a notification when replied.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SAVED FAVORITES */}
      {activeTab === "favorites" && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900">Saved Favorites ({favoriteIds.length})</h2>
          {favoriteProperties.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-xs text-slate-500">
              You haven&apos;t saved any properties yet. Click the heart icon on any listing card to save it here.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteProperties.map((prop) => (
                <PropertyCard
                  key={prop.id}
                  property={prop}
                  onFavoriteToggle={() => loadData()}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: MESSAGE BROKER */}
      {activeTab === "messages" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-2xl space-y-4">
          <h2 className="text-base font-bold text-slate-900">Direct Broker Message</h2>
          <p className="text-xs text-slate-500">
            Send a query directly to our local Nagpur agents regarding negotiations, documents, or site visits.
          </p>
          <form onSubmit={handleSendMessage} className="space-y-3">
            <textarea
              rows={4}
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Type your message here..."
              required
              className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" /> Send Message
            </button>
          </form>
        </div>
      )}

      {/* TAB 6: NOTIFICATIONS */}
      {activeTab === "notifications" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 max-w-3xl">
          <h2 className="text-base font-bold text-slate-900">Notification Alerts</h2>
          {notifications.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">No notifications currently.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map((notif) => (
                <div key={notif.id} className="py-3 flex items-start gap-3 text-xs">
                  <div className="mt-0.5 shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-800 leading-snug">{notif.message}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {formatDateTime(notif.created_at)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
