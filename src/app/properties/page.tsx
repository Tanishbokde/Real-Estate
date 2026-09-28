"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { nagpurDb } from "@/lib/data/nagpur-mock-db";
import { Property, PropertyLocation } from "@/lib/types/database";
import { PropertyCard } from "@/components/properties/PropertyCard";
import { PropertyFilters, FilterState } from "@/components/properties/PropertyFilters";
import { PropertyMap } from "@/components/properties/PropertyMap";
import { LayoutGrid, Map as MapIcon, ArrowUpDown, Building2 } from "lucide-react";

function PropertiesCatalogContent() {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [localities, setLocalities] = useState<PropertyLocation[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "split">("grid");
  const [sortBy, setSortBy] = useState<"newest" | "price_asc" | "price_desc" | "views">("newest");
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | undefined>();

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    search: searchParams.get("search") || "",
    locality: searchParams.get("locality") || "all",
    listingType: searchParams.get("listingType") || "all",
    propertyType: searchParams.get("propertyType") || "all",
    category: searchParams.get("category") || "all",
    bhk: searchParams.get("bhk") || "all",
    maxPrice: 50000000,
    status: searchParams.get("status") || "all"
  });

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

  // Filter matching
  const filteredProperties = properties.filter((p) => {
    // Search query
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchLoc = p.locality.toLowerCase().includes(q);
      const matchAddr = p.address.toLowerCase().includes(q);
      const matchFeat = p.features.some((f) => f.toLowerCase().includes(q));
      if (!matchTitle && !matchLoc && !matchAddr && !matchFeat) return false;
    }

    // Locality
    if (filters.locality !== "all" && p.locality.toLowerCase() !== filters.locality.toLowerCase()) {
      return false;
    }

    // Listing Type (buy/rent)
    if (filters.listingType !== "all" && p.listing_type !== filters.listingType) {
      return false;
    }

    // Property Type (residential/commercial)
    if (filters.propertyType !== "all" && p.type !== filters.propertyType) {
      return false;
    }

    // Category
    if (filters.category !== "all" && p.category !== filters.category) {
      return false;
    }

    // BHK
    if (filters.bhk !== "all") {
      const bhkNum = parseInt(filters.bhk);
      if (bhkNum === 4) {
        if (!p.bhk || p.bhk < 4) return false;
      } else {
        if (p.bhk !== bhkNum) return false;
      }
    }

    // Status
    if (filters.status !== "all" && p.status !== filters.status) {
      return false;
    }

    // Max Price
    if (p.price > filters.maxPrice) {
      return false;
    }

    return true;
  });

  // Sorting
  const sortedProperties = [...filteredProperties].sort((a, b) => {
    if (sortBy === "price_asc") return a.price - b.price;
    if (sortBy === "price_desc") return b.price - a.price;
    if (sortBy === "views") return b.views_count - a.views_count;
    // default newest
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Properties in Nagpur
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse verified apartments, independent villas, commercial spaces, and plots in Maharashtra&apos;s second capital.
          </p>
        </div>

        {/* View Toggle & Sorting Controls */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs shadow-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 font-medium hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="views">Most Popular</option>
            </select>
          </div>

          {/* Grid / Map View Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg flex items-center gap-1.5 font-semibold transition ${
                viewMode === "grid" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => setViewMode("split")}
              className={`p-1.5 rounded-lg flex items-center gap-1.5 font-semibold transition ${
                viewMode === "split" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
              title="Map & List Split View"
            >
              <MapIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Map View</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Component */}
      <PropertyFilters
        filters={filters}
        onChange={setFilters}
        localities={localities}
        totalResults={sortedProperties.length}
      />

      {/* Main Display: Grid vs Split View */}
      {viewMode === "grid" ? (
        <>
          {sortedProperties.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No properties found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No active listings match your current filters. Try resetting your search or expanding locality criteria.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </>
      ) : (
        /* Split Map & List View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Scrollable Property List (5 Cols) */}
          <div className="lg:col-span-5 space-y-4 max-h-[780px] overflow-y-auto pr-1">
            {sortedProperties.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
                No matching properties to display on map.
              </div>
            ) : (
              sortedProperties.map((property) => (
                <div
                  key={property.id}
                  onClick={() => setSelectedPropertyId(property.id)}
                  className={`cursor-pointer rounded-2xl transition ${
                    selectedPropertyId === property.id ? "ring-2 ring-orange-500" : ""
                  }`}
                >
                  <PropertyCard property={property} />
                </div>
              ))
            )}
          </div>

          {/* Right: Sticky Interactive Map (7 Cols) */}
          <div className="lg:col-span-7 sticky top-24">
            <PropertyMap
              properties={sortedProperties}
              selectedPropertyId={selectedPropertyId}
              onSelectProperty={(p) => setSelectedPropertyId(p.id)}
              height="750px"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-xs text-slate-400">
          Loading Nagpur property catalog...
        </div>
      }
    >
      <PropertiesCatalogContent />
    </Suspense>
  );
}
