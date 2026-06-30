"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Pin, PinOff, MapPin, Compass, Train, ShoppingBag, Briefcase, Trees, Activity } from "lucide-react";
import { useCrowdStore } from "@/store/useCrowdStore";
import { getHourIndex } from "@/utils/crowdData";
import CrowdBar from "./ui/CrowdBar";
import React from "react";

/**
 * Explore — large modern search bar spanning the width, compact category pills,
 * and a dense responsive grid of cards. Card reveal is a soft fade+rise (ease),
 * not a springy scale — the experience should feel quiet and expensive.
 */
export default function Explore() {
  const { places, togglePin, setView, searchQuery, setSearchQuery } = useCrowdStore();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const currentHour = new Date().getHours();
  const hourIdx = getHourIndex(currentHour);

  const categories = [
    { id: "all", label: "All Areas", icon: Compass },
    { id: "transit", label: "Transit", icon: Train },
    { id: "shopping", label: "Shopping", icon: ShoppingBag },
    { id: "office", label: "Office Parks", icon: Briefcase },
    { id: "park", label: "Parks", icon: Trees },
    { id: "leisure", label: "Leisure", icon: Activity },
  ];

  // Category accent dots — quiet, functional data colors (never decoration fills)
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "transit": return "#70b8ff";
      case "shopping": return "#9281f7";
      case "office": return "#a1a4a5";
      case "park": return "#3ad389";
      case "leisure": return "#baa7ff";
      default: return "#3b9eff";
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
  };

  const filteredPlaces = places.filter((place) => {
    const matchesSearch =
      place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || place.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col gap-8 p-6 md:p-10 max-w-[1200px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <span className="mono-label flex items-center gap-2">
          <span className="inline-block w-5 h-px bg-[#3b9eff]" />
          Discover
        </span>
        <h1 className="text-display text-[34px] md:text-[40px] text-frost">Explore Places</h1>
        <p className="text-[14px] text-[#a1a4a5]">
          Real-time crowd tracking and predictions for {places.length} locations across Bengaluru.
        </p>
      </div>

      {/* Large search bar */}
      <div className="relative w-full group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#6e727a] group-focus-within:text-[#3b9eff] transition-colors duration-200" strokeWidth={1.75} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by location name or area…"
          className="w-full pl-12 pr-4 py-3.5 bg-[#0b0e14] border border-[#292d30] focus:border-[#3b9eff]/50 text-frost placeholder:text-[#464a4d] text-[14px] font-medium rounded-xl outline-none transition-colors duration-200"
        />
      </div>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto w-full pb-1 no-scrollbar -mt-2">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-[12px] font-medium transition-colors duration-200 shrink-0 select-none cursor-pointer ${
                isSelected ? "text-frost" : "text-[#6e727a] hover:text-frost"
              }`}
              style={{ border: `1px solid ${isSelected ? "rgba(59,158,255,0.40)" : "#292d30"}` }}
            >
              {isSelected && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute inset-0 rounded-lg"
                  style={{ backgroundColor: "rgba(59,158,255,0.10)" }}
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <Icon className="w-3.5 h-3.5 relative z-10" strokeWidth={1.75} />
              <span className="relative z-10">{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div>
        {filteredPlaces.length === 0 ? (
          <EmptySearchState
            query={searchQuery}
            onClear={() => {
              setSearchQuery("");
              setSelectedCategory("all");
            }}
          />
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredPlaces.map((place, i) => {
                const crowdPct = place.crowdCurve[hourIdx];
                const categoryColor = getCategoryColor(place.category);
                return (
                  <motion.div
                    key={place.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: Math.min(i * 0.03, 0.2) } }}
                    exit={{ opacity: 0, transition: { duration: 0.2 } }}
                    onMouseMove={handleMouseMove}
                    onClick={() => setView("details", place.id)}
                    className="group relative layer-2 surface-sheen rounded-xl p-4 cursor-pointer glow-card flex flex-col gap-3"
                  >
                    {/* Category accent dot */}
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col gap-1 w-[80%]">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: categoryColor }} />
                          <span className="mono-label !text-[10px]">{place.category}</span>
                        </div>
                        <h3 className="font-semibold text-frost group-hover:text-[#3b9eff] transition-colors duration-200 text-[14px] leading-snug truncate">
                          {place.name}
                        </h3>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePin(place.id);
                        }}
                        className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all duration-200 shrink-0 ${
                          place.isPinned
                            ? "opacity-100 bg-[#3b9eff]/10 border-[#3b9eff]/30 text-[#3b9eff]"
                            : "opacity-0 group-hover:opacity-100 border-[#292d30] text-[#6e727a] hover:text-frost hover:border-[#3a4046]"
                        }`}
                        title={place.isPinned ? "Unpin" : "Pin to Dashboard"}
                      >
                        {place.isPinned ? (
                          <Pin className="w-3 h-3 fill-[#3b9eff]" strokeWidth={1.75} />
                        ) : (
                          <PinOff className="w-3 h-3" strokeWidth={1.75} />
                        )}
                      </button>
                    </div>

                    <p className="text-[11px] text-[#6e727a] flex items-center gap-1 truncate -mt-1">
                      <MapPin className="w-3 h-3 shrink-0" strokeWidth={1.75} />
                      <span>{place.address}</span>
                    </p>

                    <div className="mt-auto">
                      <CrowdBar percentage={crowdPct} animate={false} height={4} />
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function EmptySearchState({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <div className="layer-1 border-dashed border-[#292d30] rounded-2xl p-12 flex flex-col items-center justify-center text-center gap-4">
      <div className="w-12 h-12 rounded-full border border-[#292d30] flex items-center justify-center text-[#6e727a]">
        <Search className="w-5 h-5" strokeWidth={1.75} />
      </div>
      <div className="flex flex-col gap-1.5">
        <p className="text-frost text-[14px] font-medium">No matching locations found</p>
        <p className="text-[#6e727a] text-[12px] max-w-sm leading-relaxed">
          We couldn&apos;t find any place matching &quot;{query}&quot; under the current filters.
          Check your spelling or clear the query.
        </p>
      </div>
      <button
        onClick={onClear}
        className="mt-1 px-4 py-2 text-[12px] font-medium rounded-md border border-[#292d30] text-frost hover:border-[#3a4046] transition-colors cursor-pointer"
      >
        Clear search &amp; filters
      </button>
    </div>
  );
}
