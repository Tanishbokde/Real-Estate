"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Property } from "@/lib/types/database";
import { nagpurDb } from "@/lib/data/nagpur-mock-db";
import { formatINR } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { ScheduleVisitModal } from "./ScheduleVisitModal";
import {
  Heart,
  MapPin,
  Maximize2,
  Calendar,
  Eye,
  ShieldCheck,
  Building,
  CheckCircle2,
  Clock,
  Sparkles
} from "lucide-react";

interface PropertyCardProps {
  property: Property;
  onFavoriteToggle?: (isFav: boolean) => void;
}

export function PropertyCard({ property, onFavoriteToggle }: PropertyCardProps) {
  const { user } = useAuth();
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(() => {
    const favs = nagpurDb.getFavorites(user?.customerId || "cust-1");
    return favs.includes(property.id);
  });

  const agent = nagpurDb.getAgentById(property.agent_id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nextState = nagpurDb.toggleFavorite(user?.customerId || "cust-1", property.id);
    setIsFavorite(nextState);
    onFavoriteToggle?.(nextState);
  };

  const handleCardClick = () => {
    // Log view audit
    nagpurDb.logPropertyView(user?.customerId || "cust-1", property.id);
  };

  const statusBadgeColor = {
    available: "bg-emerald-100 text-emerald-800 border-emerald-200",
    pending: "bg-amber-100 text-amber-800 border-amber-200",
    sold: "bg-rose-100 text-rose-800 border-rose-200",
    rented: "bg-slate-200 text-slate-700 border-slate-300",
  }[property.status];

  return (
    <>
      <div
        onClick={handleCardClick}
        className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
      >
        {/* Top Image Section */}
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
          <Image
            src={property.images[0] || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"}
            alt={property.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* Badges on Image */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
            {/* Buy / Rent Tag */}
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs uppercase tracking-wide ${
              property.listing_type === "buy"
                ? "bg-blue-600 text-white"
                : "bg-purple-600 text-white"
            }`}>
              {property.listing_type === "buy" ? "For Sale" : "For Rent"}
            </span>

            {/* Residential / Commercial Tag */}
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shadow-xs capitalize ${
              property.type === "residential"
                ? "bg-emerald-600 text-white"
                : "bg-amber-600 text-white"
            }`}>
              {property.type}
            </span>

            {/* Category Tag */}
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-xs text-white capitalize">
              {property.category}
            </span>
          </div>

          {/* Top Right: Status Badge & Favorite */}
          <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
            <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border shadow-xs capitalize ${statusBadgeColor}`}>
              {property.status}
            </span>
            <button
              onClick={handleFavoriteClick}
              className={`p-2 rounded-full backdrop-blur-md transition shadow-md ${
                isFavorite
                  ? "bg-rose-50 text-rose-600"
                  : "bg-white/80 text-slate-700 hover:text-rose-600 hover:bg-white"
              }`}
              title={isFavorite ? "Remove from saved" : "Save property"}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? "fill-current text-rose-500" : ""}`} />
            </button>
          </div>

          {/* Price Tag Overlay on Bottom Image */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
            <div className="bg-slate-950/85 backdrop-blur-md text-white px-3 py-1 rounded-lg shadow-md pointer-events-auto">
              <span className="text-base font-extrabold text-amber-400">
                {formatINR(property.price, property.listing_type)}
              </span>
              <span className="text-[10px] text-slate-300 ml-1.5">
                ({property.price_range})
              </span>
            </div>
            {property.is_featured && (
              <span className="bg-amber-500 text-slate-950 text-[10px] font-bold px-2 py-1 rounded-md shadow-md flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Featured
              </span>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
          <div>
            {/* Locality & Area Details */}
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <div className="flex items-center gap-1 text-orange-600 font-medium">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{property.locality}, Nagpur</span>
              </div>
              <div className="flex items-center gap-1 text-slate-600">
                <Maximize2 className="w-3.5 h-3.5" />
                <span>{property.area_sqft} sqft</span>
              </div>
            </div>

            {/* Title */}
            <Link href={`/properties/${property.id}`} className="block group-hover:text-orange-600 transition">
              <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                {property.title}
              </h3>
            </Link>

            {/* Key Specs Pills */}
            <div className="flex items-center gap-2 mt-2 text-xs">
              {property.bhk && (
                <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded-md font-semibold">
                  {property.bhk} BHK
                </span>
              )}
              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[11px] capitalize">
                {property.category}
              </span>
              <span className="text-[11px] text-slate-400 ml-auto flex items-center gap-1">
                <Eye className="w-3 h-3" /> {property.views_count} views
              </span>
            </div>
          </div>

          {/* Agent Info & Action Buttons */}
          <div className="pt-3 border-t border-slate-100 space-y-2.5">
            {agent && (
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center">
                    {agent.name.charAt(0)}
                  </div>
                  <div className="truncate max-w-[140px]">
                    <p className="font-semibold text-slate-800 truncate text-[11px]">{agent.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{agent.agency}</p>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-1.5 py-0.5 rounded border border-emerald-200">
                  ★ {agent.rating}
                </span>
              </div>
            )}

            {/* Action Buttons: View Details & Schedule Visit */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link
                href={`/properties/${property.id}`}
                className="w-full text-center px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                View Details
              </Link>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsScheduleOpen(true);
                }}
                className="w-full text-center px-3 py-2 text-xs font-semibold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 rounded-xl shadow-xs transition flex items-center justify-center gap-1"
              >
                <Calendar className="w-3.5 h-3.5" />
                Schedule Visit
              </button>
            </div>
          </div>
        </div>
      </div>

      <ScheduleVisitModal
        property={property}
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
      />
    </>
  );
}
