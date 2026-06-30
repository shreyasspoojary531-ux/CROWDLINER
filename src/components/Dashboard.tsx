"use client";

import { motion } from "framer-motion";
import { Pin, ArrowRight, Activity, TrendingUp, Users, MapPin } from "lucide-react";
import { useCrowdStore } from "@/store/useCrowdStore";
import { getHourIndex, getCrowdStatus } from "@/utils/crowdData";
import CrowdBar from "./ui/CrowdBar";
import React from "react";

const smoothEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

/**
 * Dashboard — premium SaaS command surface with glass metrics and a clean
 * three-card pinned preview.
 */
export default function Dashboard() {
  const { places, togglePin, setView } = useCrowdStore();

  const currentHour = new Date().getHours();
  const hourIdx = getHourIndex(currentHour);

  const pinnedPlaces = places.filter((place) => place.isPinned);
  const pinnedPreview = pinnedPlaces.slice(0, 3);

  const totalPlaces = places.length;
  const pinnedCount = pinnedPlaces.length;
  const avgCrowd = Math.round(places.reduce((acc, p) => acc + p.crowdCurve[hourIdx], 0) / totalPlaces);
  const cityStatus = getCrowdStatus(avgCrowd);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
  };

  const containerVariants = {
    initial: {},
    animate: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
  };
  const itemVariants = {
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: smoothEase } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="flex flex-col gap-8 p-5 md:p-8 lg:p-10 max-w-[1220px] mx-auto w-full"
    >
      {/* Hero */}
      <motion.div variants={itemVariants} className="flex flex-col gap-4 max-w-4xl pt-2">
        <span className="mono-label flex items-center gap-2">
          <span className="inline-block w-6 h-px bg-slate-400 dark:bg-slate-500" />
          Live operations dashboard
        </span>
        <h1 className="text-display brand-gradient text-[40px] md:text-[56px] max-w-3xl">
          Real-Time Crowd Intelligence Network
        </h1>
        <p className="text-[15px] md:text-[16px] text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
          Track crowd density, monitor commute windows, and make planning decisions from
          live Bengaluru location signals.
        </p>
      </motion.div>

      {/* Statistics — three quiet metric tiles */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatTile
          label="City Density Index"
          value={`${avgCrowd}%`}
          sub={`Overall ${cityStatus.label} load`}
          icon={<TrendingUp className="w-4 h-4" strokeWidth={1.75} />}
        />
        <StatTile
          label="Pinned Locations"
          value={`${pinnedCount}`}
          sub="Favourites in focus"
          icon={<Pin className="w-4 h-4 rotate-45" strokeWidth={1.75} />}
        />
        <StatTile
          label="Monitored Zones"
          value={`${totalPlaces}`}
          sub="Active tracking nodes"
          icon={<Users className="w-4 h-4" strokeWidth={1.75} />}
        />
      </motion.div>

      {/* Pinned places — three primary pinned cards */}
      <motion.div variants={itemVariants} className="flex flex-col gap-5">
        <div className="flex items-end justify-between">
          <div className="flex items-center gap-2.5">
            <Pin className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 rotate-45" strokeWidth={2} />
            <h2 className="mono-label">Pinned Places</h2>
          </div>
          {pinnedCount > 3 && (
            <button
              onClick={() => setView("explore")}
              className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white transition-colors"
              aria-label="View all pinned places"
            >
              View All
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} />
            </button>
          )}
        </div>

        {pinnedCount === 0 ? (
          <EmptyPinState onExplore={() => setView("explore")} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {pinnedPreview.map((place) => {
              const crowdPct = place.crowdCurve[hourIdx];
              return (
                <motion.div
                  key={place.id}
                  variants={itemVariants}
                  onMouseMove={handleMouseMove}
                  onClick={() => setView("details", place.id)}
                  className="group relative premium-glass-card rounded-lg p-5 cursor-pointer flex flex-col justify-between min-h-[202px]"
                >
                  <div className="absolute top-0 left-5 right-5 h-px bg-slate-300/80 dark:bg-white/15 transition-opacity duration-300 group-hover:opacity-100" />

                  {/* Header */}
                  <div className="flex justify-between items-start pt-1">
                    <div className="flex flex-col gap-1.5 w-[82%]">
                      <h3 className="font-semibold text-slate-950 dark:text-white transition-colors duration-200 text-[15px] leading-snug truncate">
                        {place.name}
                      </h3>
                      <p className="text-[12px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
                        <span>{place.address}</span>
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePin(place.id);
                      }}
                      className="w-7 h-7 rounded-full border border-slate-200 bg-white/40 hover:border-slate-400 dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-white/25 flex items-center justify-center text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white transition-all duration-200 shrink-0"
                      title="Unpin"
                    >
                      <Pin className="w-3 h-3 rotate-45 fill-current" />
                    </button>
                  </div>

                  {/* Crowd meter */}
                  <div className="mt-4">
                    <CrowdBar percentage={crowdPct} height={5} />
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between text-[11px] border-t border-slate-200/80 dark:border-white/10 pt-3 mt-4">
                    <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <Activity className="w-3.5 h-3.5 text-slate-500 dark:text-slate-300" strokeWidth={1.75} />
                      <span className="uppercase tracking-wide font-mono text-[10px]">{place.category}</span>
                    </span>
                    <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
                      {place.lastUpdated.includes("min") ? place.lastUpdated : `Sync: ${place.lastUpdated}`}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ---- Local sub-components ---- */

function StatTile({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
}) {
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className="relative premium-glass-card rounded-lg p-5 flex flex-col justify-between min-h-[124px]"
    >
      <div className="flex items-center justify-between">
        <span className="mono-label">{label}</span>
        <span className="text-slate-400 dark:text-slate-500">{icon}</span>
      </div>
      <div className="mt-3">
        <span className="metric-gradient font-sans text-[36px] leading-none font-semibold tracking-normal">
          {value}
        </span>
        <span className="block mt-2 text-[12px] font-medium text-slate-500 dark:text-slate-400">
          {sub}
        </span>
      </div>
    </div>
  );
}

function EmptyPinState({ onExplore }: { onExplore: () => void }) {
  return (
    <div className="premium-glass-card rounded-lg p-12 flex flex-col items-center justify-center text-center gap-4">
      <div className="w-12 h-12 rounded-lg border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400">
        <Pin className="w-5 h-5 rotate-45" strokeWidth={1.75} />
      </div>
      <div className="flex flex-col gap-1.5">
        <p className="text-slate-950 dark:text-white text-[14px] font-semibold">No locations pinned to your dashboard</p>
        <p className="text-slate-500 dark:text-slate-400 text-[12px] max-w-sm leading-relaxed">
          Add places from the Explore view to monitor their crowd metrics immediately.
        </p>
      </div>
      <button
        onClick={onExplore}
        className="mt-1 px-5 py-2.5 text-[12px] font-semibold rounded-md border border-slate-300 bg-slate-950 text-white dark:border-white/15 dark:bg-white dark:text-slate-950 transition-all duration-200 active:scale-[0.98] cursor-pointer"
      >
        Find places to pin
      </button>
    </div>
  );
}
