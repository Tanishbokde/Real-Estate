"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { nagpurDb } from "@/lib/data/nagpur-mock-db";
import { Property, PropertyLocation } from "@/lib/types/database";
import { PropertyCard } from "@/components/properties/PropertyCard";
import { PropertyMap } from "@/components/properties/PropertyMap";
import {
  Building2,
  MapPin,
  Search,
  ShieldCheck,
  TrendingUp,
  Award,
  Users,
  Compass,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Star,
  Map
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [localities, setLocalities] = useState<PropertyLocation[]>([]);

  // Hero search bar state
  const [searchLocality, setSearchLocality] = useState("all");
  const [searchListingType, setSearchListingType] = useState("all");
  const [searchCategory, setSearchCategory] = useState("all");

  // Filter tab for featured properties
  const [activeTab, setActiveTab] = useState<"all" | "buy" | "rent" | "commercial" | "plot">("all");

  const loadData = () => {
    setProperties(nagpurDb.getProperties());
    setLocalities(nagpurDb.getLocalities());
  };

  useEffect(() => {
    loadData();
    nagpurDb.syncFromSupabase().then(() => loadData()).catch(() => {});
    const handleUpdate = () => loadData();
    window.addEventListener("nagpur_db_updated", handleUpdate);
    return () => window.removeEventListener("nagpur_db_updated", handleUpdate);
  }, []);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchLocality !== "all") params.set("locality", searchLocality);
    if (searchListingType !== "all") params.set("listingType", searchListingType);
    if (searchCategory !== "all") params.set("category", searchCategory);
    router.push(`/properties?${params.toString()}`);
  };

  const filteredFeatured = properties.filter((p) => {
    if (activeTab === "all") return true;
    if (activeTab === "buy") return p.listing_type === "buy";
    if (activeTab === "rent") return p.listing_type === "rent";
    if (activeTab === "commercial") return p.type === "commercial";
    if (activeTab === "plot") return p.category === "plot" || p.category === "land";
    return true;
  });

  return (
    <div className="space-y-16 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-orange-50/70 via-white to-slate-50 pt-12 pb-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100 text-orange-800 text-xs font-semibold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-orange-600" />
              <span>Nagpur&apos;s Dedicated Real Estate &amp; Management Platform</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Find Your Perfect Home in{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600">
                Nagpur City
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Connecting local MahaRERA verified brokers with customers across all 21 Nagpur localities — from Dharampeth and Civil Lines to Wardha Road, Besa, and Sadar.
            </p>
          </div>

          {/* Hero Search Box */}
          <div className="mt-8 max-w-4xl mx-auto bg-white rounded-3xl p-4 sm:p-6 shadow-xl border border-slate-200">
            <form onSubmit={handleHeroSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Locality Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-orange-600" />
                  Locality in Nagpur
                </label>
                <select
                  value={searchLocality}
                  onChange={(e) => setSearchLocality(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                >
                  <option value="all">All 21 Localities</option>
                  {localities.map((loc) => (
                    <option key={loc.id} value={loc.name}>
                      {loc.name} ({loc.zone})
                    </option>
                  ))}
                </select>
              </div>

              {/* Buy vs Rent */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Listing Type
                </label>
                <select
                  value={searchListingType}
                  onChange={(e) => setSearchListingType(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                >
                  <option value="all">Buy &amp; Rent Both</option>
                  <option value="buy">Buy (For Sale)</option>
                  <option value="rent">Rent (Lease)</option>
                </select>
              </div>

              {/* Property Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Property Category
                </label>
                <select
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                >
                  <option value="all">All Categories</option>
                  <option value="apartment">Apartments / Flats</option>
                  <option value="villa">Bungalows / Villas</option>
                  <option value="plot">NIT Sanctioned Plots</option>
                  <option value="land">Commercial Land</option>
                </select>
              </div>

              {/* Submit Button */}
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  Search Properties
                </button>
              </div>
            </form>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto text-center">
            <div className="p-4 bg-white/70 backdrop-blur-xs rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-2xl font-black text-slate-900">21+</p>
              <p className="text-xs text-slate-500 font-medium">Nagpur Localities</p>
            </div>
            <div className="p-4 bg-white/70 backdrop-blur-xs rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-2xl font-black text-orange-600">100%</p>
              <p className="text-xs text-slate-500 font-medium">MahaRERA Compliant</p>
            </div>
            <div className="p-4 bg-white/70 backdrop-blur-xs rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-2xl font-black text-slate-900">4.9★</p>
              <p className="text-xs text-slate-500 font-medium">Broker Service Rating</p>
            </div>
            <div className="p-4 bg-white/70 backdrop-blur-xs rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-2xl font-black text-emerald-600">48h</p>
              <p className="text-xs text-slate-500 font-medium">Automated Lead Response</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. EXPLORE NAGPUR LOCALITIES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-orange-600 uppercase tracking-wider">
              <Compass className="w-4 h-4" /> Micro-Markets
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Explore Nagpur Neighborhoods
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Select a prime locality to see verified homes, rental apartments, and commercial hubs.
            </p>
          </div>
          <Link
            href="/properties"
            className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 shrink-0"
          >
            View all 21 areas <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Dharampeth */}
          <Link
            href="/properties?locality=Dharampeth"
            className="group relative h-48 rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-lg transition-all duration-300"
          >
            <img
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80"
              alt="Dharampeth Nagpur"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent p-4 flex flex-col justify-end text-white">
              <span className="text-[10px] uppercase font-bold text-amber-400">West Nagpur</span>
              <h3 className="font-bold text-base">Dharampeth</h3>
              <p className="text-[11px] text-slate-300 line-clamp-1">
                Near Futala Lake, Gokulpeth Market &amp; WHC Road
              </p>
            </div>
          </Link>

          {/* Civil Lines */}
          <Link
            href="/properties?locality=Civil+Lines"
            className="group relative h-48 rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-lg transition-all duration-300"
          >
            <img
              src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=600&q=80"
              alt="Civil Lines Nagpur"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent p-4 flex flex-col justify-end text-white">
              <span className="text-[10px] uppercase font-bold text-emerald-400">Central VIP Belt</span>
              <h3 className="font-bold text-base">Civil Lines</h3>
              <p className="text-[11px] text-slate-300 line-clamp-1">
                High Court Bench, Vidhan Bhavan &amp; Green Enclaves
              </p>
            </div>
          </Link>

          {/* Wardha Road */}
          <Link
            href="/properties?locality=Wardha+Road"
            className="group relative h-48 rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-lg transition-all duration-300"
          >
            <img
              src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80"
              alt="Wardha Road Nagpur"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent p-4 flex flex-col justify-end text-white">
              <span className="text-[10px] uppercase font-bold text-blue-400">Growth Corridor</span>
              <h3 className="font-bold text-base">Wardha Road</h3>
              <p className="text-[11px] text-slate-300 line-clamp-1">
                Airport, MIHAN SEZ, Infosys, TCS &amp; Metro Aqua Line
              </p>
            </div>
          </Link>

          {/* Besa & Manish Nagar */}
          <Link
            href="/properties?locality=Besa"
            className="group relative h-48 rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-lg transition-all duration-300"
          >
            <img
              src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80"
              alt="Besa Nagpur"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent p-4 flex flex-col justify-end text-white">
              <span className="text-[10px] uppercase font-bold text-purple-400">Family &amp; High-ROI</span>
              <h3 className="font-bold text-base">Besa &amp; Manish Nagar</h3>
              <p className="text-[11px] text-slate-300 line-clamp-1">
                Modern gated societies, Podar School &amp; Link Roads
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* 3. FEATURED PROPERTIES GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-orange-600 uppercase tracking-wider">
              <Building2 className="w-4 h-4" /> Live Nagpur Inventory
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Featured Properties in Nagpur
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Hand-picked properties managed by verified brokers and monitored by platform admin.
            </p>
          </div>

          {/* Tab buttons */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold overflow-x-auto">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All Listings
            </button>
            <button
              onClick={() => setActiveTab("buy")}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === "buy" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              For Sale
            </button>
            <button
              onClick={() => setActiveTab("rent")}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === "rent" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Rentals
            </button>
            <button
              onClick={() => setActiveTab("commercial")}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === "commercial" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Commercial
            </button>
            <button
              onClick={() => setActiveTab("plot")}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === "plot" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Plots
            </button>
          </div>
        </div>

        {/* Property Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFeatured.slice(0, 6).map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition"
          >
            Browse All {properties.length} Nagpur Properties
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 4. INTERACTIVE NAGPUR CITY MAP SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex items-center gap-1.5 text-xs font-bold text-orange-600 uppercase tracking-wider">
            <Map className="w-4 h-4" /> City Geographic View
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Properties on Nagpur Map
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Explore listings plotted across Nagpur with live prices, landmark proximities, and quick navigation.
          </p>
        </div>

        <PropertyMap properties={properties} height="520px" />
      </section>

      {/* 5. WHY NAGPUR REALTY PLATFORM */}
      <section className="bg-slate-900 text-white py-16 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Why Home Buyers &amp; Brokers Trust Nagpur Realty
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Engineered with full administrative oversight so every transaction, inquiry, and visit is accountable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center sm:text-left">
            <div className="p-6 bg-slate-800/60 rounded-2xl border border-slate-700/60 space-y-3">
              <div className="w-12 h-12 bg-orange-500/20 text-orange-400 rounded-xl flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-white">Verified Admin Oversight</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Platform administration holds complete verified oversight over all listings, broker actions, and customer queries. No unapproved listings or unverified agents.
              </p>
            </div>

            <div className="p-6 bg-slate-800/60 rounded-2xl border border-slate-700/60 space-y-3">
              <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-white">Automated Follow-Up Engine</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Built-in scheduled scanners track views without action between 48–72 hours, auto-generating follow-ups and dual notifications to prevent lost leads.
              </p>
            </div>

            <div className="p-6 bg-slate-800/60 rounded-2xl border border-slate-700/60 space-y-3">
              <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-white">100% Nagpur City Focus</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Hyperlocal database tuned for Nagpur&apos;s real estate dynamics: Metro routes, MIHAN IT corridors, NIT sanctioned plots, and INR price brackets.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. VERIFIED TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-2xl font-extrabold text-slate-900">
            What Nagpur Residents Say
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real stories from buyers, tenants, and commercial investors in Nagpur.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="text-xs text-slate-700 italic leading-relaxed">
              &ldquo;We booked a 3 BHK site visit in Dharampeth directly through the platform. Broker Amit Sharma arrived promptly with complete sanctioned plans and loan approvals.&rdquo;
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-800 font-bold text-xs flex items-center justify-center">
                PD
              </div>
              <div>
                <p className="font-bold text-slate-900 text-xs">Priya Deshmukh</p>
                <p className="text-[10px] text-slate-400">Dharampeth Buyer</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="text-xs text-slate-700 italic leading-relaxed">
              &ldquo;As a software engineer at MIHAN, finding a ready flat on Wardha Road near the Aqua Line Metro was effortless. The map view with landmark distances made decision making easy.&rdquo;
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center">
                RJ
              </div>
              <div>
                <p className="font-bold text-slate-900 text-xs">Rahul Joshi</p>
                <p className="text-[10px] text-slate-400">Wardha Road Resident</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="text-xs text-slate-700 italic leading-relaxed">
              &ldquo;Secured a prime commercial retail space on Sadar Residency Road. The admin transparency and quick broker reassignment ensured no time was lost during negotiations.&rdquo;
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                MP
              </div>
              <div>
                <p className="font-bold text-slate-900 text-xs">Mahendra Patel</p>
                <p className="text-[10px] text-slate-400">Commercial Investor, Sadar</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
