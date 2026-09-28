"use client";

import React from "react";
import { PropertyLocation, PropertyType, PropertyCategory, ListingType, PropertyStatus } from "@/lib/types/database";
import { Search, MapPin, SlidersHorizontal, RotateCcw, Home, Building2 } from "lucide-react";

export interface FilterState {
  search: string;
  locality: string;
  listingType: string; // "all", "buy", "rent"
  propertyType: string; // "all", "residential", "commercial"
  category: string; // "all", "apartment", "villa", "plot", "land"
  bhk: string; // "all", "1", "2", "3", "4"
  maxPrice: number;
  status: string; // "all", "available", "pending", "rented", "sold"
}

interface PropertyFiltersProps {
  filters: FilterState;
  onChange: (newFilters: FilterState) => void;
  localities: PropertyLocation[];
  totalResults: number;
}

export function PropertyFilters({
  filters,
  onChange,
  localities,
  totalResults
}: PropertyFiltersProps) {
  const updateField = (field: keyof FilterState, value: any) => {
    onChange({ ...filters, [field]: value });
  };

  const handleReset = () => {
    onChange({
      search: "",
      locality: "all",
      listingType: "all",
      propertyType: "all",
      category: "all",
      bhk: "all",
      maxPrice: 50000000,
      status: "all"
    });
  };

  const activeCount = [
    filters.search !== "",
    filters.locality !== "all",
    filters.listingType !== "all",
    filters.propertyType !== "all",
    filters.category !== "all",
    filters.bhk !== "all",
    filters.status !== "all",
    filters.maxPrice < 50000000
  ].filter(Boolean).length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
      {/* Top Search Bar & Buy/Rent Segmented Control */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by property title, landmarks (Futala, Metro, Airport), or address..."
            value={filters.search}
            onChange={(e) => updateField("search", e.target.value)}
            className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-hidden transition"
          />
        </div>

        {/* Buy / Rent Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold shrink-0">
          <button
            onClick={() => updateField("listingType", "all")}
            className={`px-3 py-1.5 rounded-lg transition ${
              filters.listingType === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All Listings
          </button>
          <button
            onClick={() => updateField("listingType", "buy")}
            className={`px-3 py-1.5 rounded-lg transition ${
              filters.listingType === "buy" ? "bg-blue-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Buy (Sale)
          </button>
          <button
            onClick={() => updateField("listingType", "rent")}
            className={`px-3 py-1.5 rounded-lg transition ${
              filters.listingType === "rent" ? "bg-purple-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Rent (Lease)
          </button>
        </div>
      </div>

      {/* Filter Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2 border-t border-slate-100 text-xs">
        {/* 1. Nagpur Locality Dropdown (21 real Nagpur localities) */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-orange-600" />
            Nagpur Locality
          </label>
          <select
            value={filters.locality}
            onChange={(e) => updateField("locality", e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
          >
            <option value="all">All 21 Nagpur Areas</option>
            {localities.map((loc) => (
              <option key={loc.id} value={loc.name}>
                {loc.name} ({loc.zone})
              </option>
            ))}
          </select>
        </div>

        {/* 2. Residential vs Commercial */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Property Type
          </label>
          <select
            value={filters.propertyType}
            onChange={(e) => updateField("propertyType", e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
          >
            <option value="all">All Types</option>
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
          </select>
        </div>

        {/* 3. Property Category */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => updateField("category", e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
          >
            <option value="all">All Categories</option>
            <option value="apartment">Apartment / Flat</option>
            <option value="villa">House / Villa / Bungalow</option>
            <option value="plot">Residential / NIT Plot</option>
            <option value="land">Commercial Land</option>
          </select>
        </div>

        {/* 4. BHK Count */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            BHK / Bedrooms
          </label>
          <select
            value={filters.bhk}
            onChange={(e) => updateField("bhk", e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
          >
            <option value="all">Any BHK</option>
            <option value="1">1 BHK</option>
            <option value="2">2 BHK</option>
            <option value="3">3 BHK</option>
            <option value="4">4+ BHK / Villa</option>
          </select>
        </div>

        {/* 5. Listing Status */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Listing Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => updateField("status", e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
          >
            <option value="all">All Statuses</option>
            <option value="available">Available</option>
            <option value="pending">Pending</option>
            <option value="sold">Sold</option>
            <option value="rented">Rented</option>
          </select>
        </div>
      </div>

      {/* Footer bar with summary and reset */}
      <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500 gap-2">
        <div className="flex items-center gap-2">
          <span>
            Showing <strong className="text-slate-900">{totalResults}</strong> properties in Nagpur
          </span>
          {activeCount > 0 && (
            <span className="px-2 py-0.5 bg-orange-100 text-orange-800 font-bold rounded-full text-[10px]">
              {activeCount} active filter{activeCount > 1 ? "s" : ""}
            </span>
          )}
        </div>

        {activeCount > 0 && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-orange-600 hover:text-orange-700 font-semibold transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset all filters
          </button>
        )}
      </div>
    </div>
  );
}
