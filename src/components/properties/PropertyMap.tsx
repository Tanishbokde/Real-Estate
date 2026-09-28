"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Property } from "@/lib/types/database";
import { formatINR } from "@/lib/utils";
import { MapPin, Navigation, Maximize2, ExternalLink } from "lucide-react";

interface PropertyMapProps {
  properties: Property[];
  selectedPropertyId?: string;
  onSelectProperty?: (property: Property) => void;
  height?: string;
}

export function PropertyMap({
  properties,
  selectedPropertyId,
  onSelectProperty,
  height = "520px"
}: PropertyMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  const [isMounted, setIsMounted] = useState(false);

  // Nagpur center coordinates
  const NAGPUR_CENTER: [number, number] = [21.1458, 79.0882];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !mapContainerRef.current) return;

    let isCleanedUp = false;

    // Dynamically import leaflet to avoid SSR issues
    import("leaflet").then((L) => {
      if (isCleanedUp || !mapContainerRef.current) return;

      // Fix leaflet default icon issue
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: NAGPUR_CENTER,
          zoom: 12,
          scrollWheelZoom: true,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 18,
        }).addTo(map);

        mapInstanceRef.current = map;
      }

      const map = mapInstanceRef.current;

      // Clear existing markers
      Object.values(markersRef.current).forEach((m: any) => map.removeLayer(m));
      markersRef.current = {};

      // Add markers for all properties
      properties.forEach((prop) => {
        if (!prop.latitude || !prop.longitude) return;

        const isBuy = prop.listing_type === "buy";
        const pinBgColor = isBuy ? "#2563eb" : "#9333ea";

        // Create custom HTML marker with price pill
        const priceLabel = formatINR(prop.price, prop.listing_type);
        const customIcon = L.divIcon({
          className: "custom-property-pin",
          html: `
            <div style="
              background: ${pinBgColor};
              color: white;
              font-weight: 700;
              font-size: 11px;
              padding: 4px 8px;
              border-radius: 20px;
              border: 2px solid white;
              box-shadow: 0 4px 10px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              gap: 4px;
              white-space: nowrap;
              cursor: pointer;
              transform: translate(-50%, -50%);
            ">
              <span>📍</span>
              <span>${priceLabel}</span>
            </div>
          `,
          iconSize: [80, 30],
          iconAnchor: [40, 15],
        });

        const marker = L.marker([prop.latitude, prop.longitude], { icon: customIcon }).addTo(map);

        const popupContent = document.createElement("div");
        popupContent.className = "w-64 overflow-hidden rounded-xl bg-white text-slate-800";
        popupContent.innerHTML = `
          <div style="position: relative; width: 100%; height: 120px; background: #e2e8f0;">
            <img src="${prop.images[0]}" alt="${prop.title}" style="width: 100%; height: 100%; object-fit: cover;" />
            <div style="position: absolute; top: 8px; left: 8px; background: ${pinBgColor}; color: white; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 6px;">
              ${prop.listing_type === 'buy' ? 'For Sale' : 'For Rent'}
            </div>
            <div style="position: absolute; bottom: 8px; right: 8px; background: rgba(15,23,42,0.85); color: #fbbf24; font-size: 12px; font-weight: 800; padding: 2px 6px; border-radius: 6px;">
              ${priceLabel}
            </div>
          </div>
          <div style="padding: 10px;">
            <div style="font-size: 10px; color: #ea580c; font-weight: 600; text-transform: uppercase;">
              ${prop.locality}, Nagpur
            </div>
            <div style="font-weight: 700; font-size: 12px; color: #0f172a; margin-top: 2px; line-height: 1.3; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
              ${prop.title}
            </div>
            <div style="display: flex; gap: 6px; font-size: 10px; color: #64748b; margin-top: 6px;">
              ${prop.bhk ? `<span>${prop.bhk} BHK</span> • ` : ''}
              <span>${prop.area_sqft} sqft</span> •
              <span style="text-transform: capitalize;">${prop.category}</span>
            </div>
            <div style="margin-top: 8px; pt: 6px; border-top: 1px solid #f1f5f9;">
              <a href="/properties/${prop.id}" style="display: block; text-align: center; background: #ea580c; color: white; font-weight: 600; font-size: 11px; padding: 6px 10px; border-radius: 8px; text-decoration: none;">
                View Details & Schedule Visit →
              </a>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent, { maxWidth: 280 });
        marker.on("click", () => {
          onSelectProperty?.(prop);
        });

        markersRef.current[prop.id] = marker;
      });

      // If specific property selected, pan to it
      if (selectedPropertyId && markersRef.current[selectedPropertyId]) {
        const selMarker = markersRef.current[selectedPropertyId];
        map.setView(selMarker.getLatLng(), 14, { animate: true });
        selMarker.openPopup();
      }
    });

    return () => {
      isCleanedUp = true;
    };
  }, [isMounted, properties, selectedPropertyId]);

  const jumpToLocality = (lat: number, lng: number, zoom: number = 14) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lng], zoom, { animate: true });
    }
  };

  return (
    <div className="relative bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Map Control Bar */}
      <div className="px-4 py-2.5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-orange-500" />
          <span className="font-bold">Nagpur Interactive Property Map</span>
          <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px]">
            {properties.length} Active Pins
          </span>
        </div>

        {/* Locality Quick Jump Shortcuts */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-[11px]">
          <span className="text-slate-400 mr-1 hidden sm:inline">Jump to:</span>
          <button
            onClick={() => jumpToLocality(NAGPUR_CENTER[0], NAGPUR_CENTER[1], 12)}
            className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-200 transition"
          >
            Zero Mile Center
          </button>
          <button
            onClick={() => jumpToLocality(21.1432, 79.0620, 14)}
            className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-200 transition"
          >
            Dharampeth
          </button>
          <button
            onClick={() => jumpToLocality(21.1578, 79.0725, 14)}
            className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-200 transition"
          >
            Civil Lines
          </button>
          <button
            onClick={() => jumpToLocality(21.0921, 79.0684, 14)}
            className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-200 transition"
          >
            Wardha Road
          </button>
          <button
            onClick={() => jumpToLocality(21.0845, 79.0882, 14)}
            className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-200 transition"
          >
            Besa
          </button>
        </div>
      </div>

      {/* Map Canvas Container */}
      <div
        ref={mapContainerRef}
        style={{ height, width: "100%" }}
        className="z-10 bg-slate-100"
      />

      {/* Map Legend */}
      <div className="absolute bottom-3 left-3 z-20 bg-white/90 backdrop-blur-md px-3 py-2 rounded-xl shadow-md border border-slate-200 text-xs flex items-center gap-3 pointer-events-auto">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-blue-600 inline-block border border-white"></span>
          <span className="text-slate-700 font-medium">Buy / Sale</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-purple-600 inline-block border border-white"></span>
          <span className="text-slate-700 font-medium">Rental Lease</span>
        </div>
      </div>
    </div>
  );
}
