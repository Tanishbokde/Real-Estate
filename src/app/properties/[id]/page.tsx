"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { nagpurDb } from "@/lib/data/nagpur-mock-db";
import { supabaseService } from "@/lib/supabase/service";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { Property, AgentBroker } from "@/lib/types/database";
import { formatINR, formatDate } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { ScheduleVisitModal } from "@/components/properties/ScheduleVisitModal";
import { InquiryModal } from "@/components/properties/InquiryModal";
import {
  MapPin,
  Maximize2,
  Calendar,
  Heart,
  Share2,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Building,
  Calculator,
  Compass,
  ArrowLeft,
  Eye,
  Sparkles,
  Home,
  Clock
} from "lucide-react";

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.id as string;
  const { user } = useAuth();

  const [property, setProperty] = useState<Property | null>(null);
  const [agent, setAgent] = useState<AgentBroker | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // EMI Calculator state
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [interestRate, setInterestRate] = useState(8.5); // 8.5% annual
  const [loanTenureYears, setLoanTenureYears] = useState(20);

  useEffect(() => {
    if (!propertyId) return;

    const loadData = async () => {
      let prop = nagpurDb.getPropertyById(propertyId);
      if (!prop && isSupabaseConfigured) {
        const { data } = await supabaseService.getPropertyById(propertyId);
        if (data) prop = data;
      }

      if (prop) {
        setProperty(prop);
        nagpurDb.logPropertyView(user?.customerId || "cust-1", prop.id);

        if (prop.agent_id) {
          let ag = nagpurDb.getAgentById(prop.agent_id);
          if (!ag && isSupabaseConfigured) {
            const { data: agData } = await supabaseService.getAgents();
            ag = agData?.find((a) => a.id === prop!.agent_id);
          }
          if (ag) setAgent(ag);
        }

        const favs = nagpurDb.getFavorites(user?.customerId || "cust-1");
        setIsFavorite(favs.includes(prop.id));
      }
    };

    loadData();
  }, [propertyId, user?.customerId]);

  if (!property) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Property Not Found</h2>
        <p className="text-xs text-slate-500">The property you requested does not exist or has been removed.</p>
        <Link
          href="/properties"
          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Properties
        </Link>
      </div>
    );
  }

  const handleFavoriteToggle = () => {
    const nextState = nagpurDb.toggleFavorite(user?.customerId || "cust-1", property.id);
    setIsFavorite(nextState);
  };

  // EMI Calculation Formula
  const loanPrincipal = property.price * (1 - downPaymentPercent / 100);
  const monthlyRate = interestRate / 12 / 100;
  const totalMonths = loanTenureYears * 12;
  const emi =
    property.listing_type === "buy"
      ? (loanPrincipal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1)
      : 0;

  const totalAmountPayable = emi * totalMonths;
  const totalInterest = totalAmountPayable - loanPrincipal;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/properties"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-orange-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all Nagpur listings
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleFavoriteToggle}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
              isFavorite
                ? "bg-rose-50 text-rose-600 border-rose-200"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? "fill-current text-rose-500" : ""}`} />
            {isFavorite ? "Saved" : "Save"}
          </button>
          <button
            onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(window.location.href);
                alert("Link copied to clipboard!");
              }
            }}
            className="p-1.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition"
            title="Share listing"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Header Info */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className={`font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide ${
            property.listing_type === "buy" ? "bg-blue-600 text-white" : "bg-purple-600 text-white"
          }`}>
            {property.listing_type === "buy" ? "For Sale" : "For Rent"}
          </span>
          <span className="font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 capitalize">
            {property.type}
          </span>
          <span className="font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 capitalize">
            {property.category}
          </span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-500 flex items-center gap-1">
            <Eye className="w-3.5 h-3.5 text-slate-400" /> {property.views_count} views logged
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
          {property.title}
        </h1>

        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-600">
          <MapPin className="w-4 h-4 text-orange-600 shrink-0" />
          <span>{property.address}</span>
        </div>
      </div>

      {/* Photo Gallery Grid */}
      <div className="space-y-3">
        {/* Main Image View */}
        <div className="relative aspect-[16/9] sm:aspect-[21/9] rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 shadow-md">
          <Image
            src={property.images[activeImageIndex] || property.images[0]}
            alt={property.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute bottom-4 left-4 bg-slate-950/85 backdrop-blur-md text-white px-4 py-2 rounded-xl shadow-lg">
            <span className="text-xl sm:text-2xl font-black text-amber-400">
              {formatINR(property.price, property.listing_type)}
            </span>
            <span className="text-xs text-slate-300 ml-2">({property.price_range})</span>
          </div>
        </div>

        {/* Thumbnail Selector */}
        {property.images.length > 1 && (
          <div className="flex items-center gap-3 overflow-x-auto pb-1">
            {property.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`relative w-20 sm:w-24 h-14 sm:h-16 rounded-xl overflow-hidden shrink-0 border-2 transition ${
                  activeImageIndex === idx ? "border-orange-600 scale-95" : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <Image src={img} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2-Column Main Layout: Specs + Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Details, Features, Landmark Proximities, EMI (8 Cols) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Key Quick Highlights Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-white rounded-2xl border border-slate-200 shadow-xs text-center">
            {property.bhk && (
              <div className="p-2 border-r border-slate-100 last:border-0">
                <p className="text-[11px] text-slate-400 uppercase font-semibold">Configuration</p>
                <p className="text-base font-extrabold text-slate-900 mt-0.5">{property.bhk} BHK</p>
              </div>
            )}
            <div className="p-2 border-r border-slate-100 last:border-0">
              <p className="text-[11px] text-slate-400 uppercase font-semibold">Super Built-up</p>
              <p className="text-base font-extrabold text-slate-900 mt-0.5">{property.area_sqft} sqft</p>
            </div>
            <div className="p-2 border-r border-slate-100 last:border-0">
              <p className="text-[11px] text-slate-400 uppercase font-semibold">Property Status</p>
              <p className="text-base font-extrabold text-emerald-600 mt-0.5 capitalize">{property.status}</p>
            </div>
            <div className="p-2">
              <p className="text-[11px] text-slate-400 uppercase font-semibold">City / Zone</p>
              <p className="text-base font-extrabold text-slate-900 mt-0.5">{property.locality}</p>
            </div>
          </div>

          {/* Detailed Description */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-base font-bold text-slate-900">About this Property</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {property.description}
            </p>
          </div>

          {/* Amenities and Features */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">Key Features &amp; Amenities</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {property.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Nagpur Landmark Distances */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Nagpur Landmark Proximities</h3>
              <span className="text-xs text-orange-600 font-semibold">Centrally Located</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <span className="text-slate-600">Nagpur Metro Aqua / Orange Line</span>
                <span className="font-bold text-slate-900">800 m</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <span className="text-slate-600">Dr. Babasaheb Ambedkar Airport</span>
                <span className="font-bold text-slate-900">5.5 km</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <span className="text-slate-600">Zero Mile Stone &amp; Sitabuldi Hub</span>
                <span className="font-bold text-slate-900">3.2 km</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <span className="text-slate-600">MIHAN SEZ (Infosys / TCS / HCL)</span>
                <span className="font-bold text-slate-900">9.0 km</span>
              </div>
            </div>
          </div>

          {/* EMI Mortgage Calculator (For Buy Properties) */}
          {property.listing_type === "buy" && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-orange-600" />
                <h3 className="text-base font-bold text-slate-900">Home Loan EMI Calculator (INR)</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                {/* Down payment */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Down Payment: {downPaymentPercent}%
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    step="5"
                    value={downPaymentPercent}
                    onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                    className="w-full accent-orange-600"
                  />
                  <span className="text-[11px] text-slate-500">
                    Down Payment: {formatINR(property.price * (downPaymentPercent / 100))}
                  </span>
                </div>

                {/* Interest rate */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Interest Rate: {interestRate}%
                  </label>
                  <input
                    type="range"
                    min="7.5"
                    max="12.0"
                    step="0.1"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="w-full accent-orange-600"
                  />
                  <span className="text-[11px] text-slate-500">Benchmark SBI/HDFC rate</span>
                </div>

                {/* Tenure */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tenure: {loanTenureYears} Years
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    step="5"
                    value={loanTenureYears}
                    onChange={(e) => setLoanTenureYears(Number(e.target.value))}
                    className="w-full accent-orange-600"
                  />
                  <span className="text-[11px] text-slate-500">{loanTenureYears * 12} installments</span>
                </div>
              </div>

              {/* Calculated EMI Display */}
              <div className="p-4 bg-orange-50/70 border border-orange-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                <div>
                  <p className="text-xs text-orange-800 font-semibold">Estimated Monthly EMI</p>
                  <p className="text-2xl font-black text-orange-600">
                    ₹{Math.round(emi).toLocaleString("en-IN")}{" "}
                    <span className="text-xs font-normal text-slate-600">/ month</span>
                  </p>
                </div>
                <div className="text-xs text-slate-600 space-y-0.5">
                  <p>
                    Loan Amount: <strong className="text-slate-800">{formatINR(loanPrincipal)}</strong>
                  </p>
                  <p>
                    Total Interest: <strong className="text-slate-800">{formatINR(totalInterest)}</strong>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Broker Card & Actions (4 Cols Sticky) */}
        <div className="lg:col-span-4 space-y-6 sticky top-24">
          {/* Action Box */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md space-y-4">
            <div>
              <span className="text-xs text-slate-500 font-semibold uppercase">Pricing</span>
              <p className="text-2xl font-extrabold text-slate-900 mt-0.5">
                {formatINR(property.price, property.listing_type)}
              </p>
              <p className="text-xs text-slate-500">{property.price_range} • Ready possession</p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => setIsScheduleOpen(true)}
                className="w-full py-3 px-4 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                Schedule a Site Visit
              </button>

              <button
                onClick={() => setIsInquiryOpen(true)}
                className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                Send Inquiry to Broker
              </button>
            </div>

            <p className="text-[11px] text-slate-400 text-center pt-2 border-t border-slate-100">
              ⚡ Site visits are accompanied by verified MahaRERA brokers with zero platform fees.
            </p>
          </div>

          {/* Assigned Agent Profile Card */}
          {agent && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Assigned Broker
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  MahaRERA Verified
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white font-bold text-base flex items-center justify-center shadow-sm">
                  {agent.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{agent.name}</h4>
                  <p className="text-xs text-slate-500">{agent.agency}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-bold text-amber-600">★ {agent.rating}</span>
                    <span className="text-[11px] text-slate-400">({agent.total_deals} deals closed)</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                {agent.bio || agent.area_specialization}
              </p>

              <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-orange-600" />
                  <span className="font-medium text-slate-800">{agent.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-orange-600" />
                  <span className="truncate">{agent.email}</span>
                </div>
                {agent.license_no && (
                  <p className="text-[10px] text-slate-400 pt-1">
                    Reg No: <strong className="text-slate-600">{agent.license_no}</strong>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ScheduleVisitModal
        property={property}
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
      />

      <InquiryModal
        property={property}
        isOpen={isInquiryOpen}
        onClose={() => setIsInquiryOpen(false)}
      />
    </div>
  );
}
