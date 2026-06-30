"use client";

import { useState, useEffect } from "react";
import { Compass, Navigation, MapPin, Activity, ArrowRight } from "lucide-react";
import { useCrowdStore } from "@/store/useCrowdStore";
import { Place, getHourIndex, getCrowdStatus } from "@/utils/crowdData";
import { motion } from "framer-motion";
import ReportForm from "./ReportForm";
import React from "react";

// Sequential expanding radar ring
const RadarRing = ({ delay }: { delay: number }) => (
  <motion.div
    initial={{ scale: 0.8, opacity: 0.35 }}
    animate={{ scale: 2.4, opacity: 0 }}
    transition={{ duration: 2.4, repeat: Infinity, delay, ease: "easeOut" }}
    className="absolute w-24 h-24 rounded-full pointer-events-none"
    style={{ boxShadow: "inset 0 0 0 1px rgba(59,158,255,0.40)" }}
  />
);

export default function AddReport() {
  const { places, reportingPlaceId, setReportingPlaceId } = useCrowdStore();
  const [scanning, setScanning] = useState(true);
  const [scanText, setScanText] = useState("Acquiring GPS signal…");
  const [displayedText, setDisplayedText] = useState("");
  const [nearbyPlaces, setNearbyPlaces] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  const notifPlace = reportingPlaceId ? places.find((p) => p.id === reportingPlaceId) ?? null : null;

  // Scan sequence (logic preserved)
  useEffect(() => {
    if (!scanning || notifPlace) return;
    const t1 = setTimeout(() => setScanText("Pinging cellular towers…"), 800);
    const t2 = setTimeout(() => setScanText("Syncing Bengaluru traffic nodes…"), 1600);
    const t3 = setTimeout(() => {
      const shuffled = [...places].sort(() => 0.5 - Math.random());
      setNearbyPlaces(shuffled.slice(0, 4));
      setScanning(false);
    }, 2400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [scanning, places, notifPlace]);

  // Typewriter (logic preserved)
  useEffect(() => {
    let i = 0;
    setDisplayedText("");
    const interval = setInterval(() => {
      setDisplayedText((prev) => prev + scanText.charAt(i));
      i++;
      if (i >= scanText.length) clearInterval(interval);
    }, 25);
    return () => clearInterval(interval);
  }, [scanText]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
  };

  if (notifPlace) {
    return <ReportForm place={notifPlace} onBack={() => setReportingPlaceId(null)} />;
  }
  if (selectedPlace) {
    return <ReportForm place={selectedPlace} onBack={() => setSelectedPlace(null)} />;
  }

  return (
    <div className="flex flex-col gap-8 p-6 md:p-10 max-w-[1100px] mx-auto w-full min-h-[calc(100vh-61px)]">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <span className="mono-label flex items-center gap-2">
          <span className="inline-block w-5 h-px bg-[#3ad389]" />
          Live Signal
        </span>
        <h1 className="text-display brand-gradient text-[34px] md:text-[40px]">Add Report</h1>
        <p className="text-[14px] text-[#a1a4a5]">
          Share real-time crowd updates at your location to keep the predictive model accurate.
        </p>
      </div>

      {scanning ? (
        /* ---- GPS scanning experience ---- */
        <div className="flex-1 flex flex-col items-center justify-center gap-10 max-w-md w-full py-12 mx-auto">
          <div className="relative w-48 h-48 flex items-center justify-center">
            <RadarRing delay={0} />
            <RadarRing delay={0.8} />
            <RadarRing delay={1.6} />

            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
              className="w-20 h-20 rounded-full flex items-center justify-center relative z-10"
              style={{ backgroundColor: "rgba(59,158,255,0.08)", boxShadow: "inset 0 0 0 1px #3b9eff, 0 0 30px rgba(59,158,255,0.18)" }}
            >
              <Navigation className="w-7 h-7 text-[#3b9eff] rotate-45" strokeWidth={1.75} />
            </motion.div>

            {/* Rotating sweep */}
            <div
              className="absolute inset-0 rounded-full animate-sweep"
              style={{ background: "conic-gradient(from 0deg, transparent 0deg, rgba(59,158,255,0.10) 60deg, transparent 120deg)", maskImage: "radial-gradient(circle, #000 60%, transparent 100%)", WebkitMaskImage: "radial-gradient(circle, #000 60%, transparent 100%)" }}
            />
            {/* Fixed reticle ring */}
            <div className="absolute w-40 h-40 rounded-full border border-[#292d30]" />
          </div>

          <div className="flex flex-col gap-2.5 items-center text-center">
            <h2 className="mono-label">Acquiring crowd nodes</h2>
            <p className="text-[12px] text-[#a1a4a5] font-mono h-5">{displayedText}</p>
          </div>

          <div className="w-full flex flex-col gap-3.5 mt-4">
            <div className="h-2 rounded-full skeleton-shimmer w-2/3 mx-auto" />
            <div className="h-1.5 rounded-full skeleton-shimmer w-1/2 mx-auto" />
          </div>
        </div>
      ) : (
        /* ---- Nearby places results ---- */
        <div className="flex flex-col gap-8 w-full py-2">
          <div className="flex items-center justify-between border-b border-[#292d30] pb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center text-[#3ad389]"
                style={{ backgroundColor: "rgba(58,211,137,0.08)", boxShadow: "inset 0 0 0 1px rgba(58,211,137,0.30)" }}
              >
                <Compass className="w-[18px] h-[18px]" strokeWidth={1.75} />
              </div>
              <div className="flex flex-col">
                <h2 className="text-display text-[20px] text-frost leading-none">You are near these places</h2>
                <span className="mono-label mt-1.5">GPS-verified within 500m</span>
              </div>
            </div>
            <button onClick={() => setScanning(true)} className="text-[12px] font-medium text-[#3b9eff] hover:underline cursor-pointer">
              Rescan location
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {nearbyPlaces.map((place, i) => {
              const currentHour = new Date().getHours();
              const hourIdx = getHourIndex(currentHour);
              const crowdPct = place.crowdCurve[hourIdx];
              const { color, label } = getCrowdStatus(crowdPct);

              return (
                <motion.div
                  key={place.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: i * 0.08 }}
                  onMouseMove={handleMouseMove}
                  className="group relative layer-2 surface-sheen rounded-2xl p-5 flex flex-col justify-between glow-card min-h-[180px]"
                >
                  <div className="flex justify-between items-start gap-4 flex-1">
                    <div className="flex flex-col gap-1.5 w-[68%]">
                      <span className="mono-label !text-[10px] w-fit">{place.category}</span>
                      <h3 className="font-semibold text-frost text-[16px] leading-snug group-hover:text-[#3b9eff] transition-colors duration-200 truncate mt-1">
                        {place.name}
                      </h3>
                      <p className="text-[12px] text-[#6e727a] flex items-center gap-1 truncate">
                        <MapPin className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
                        {place.address}
                      </p>
                    </div>

                    <div className="text-right shrink-0 flex flex-col justify-center items-end">
                      <span className="font-serif text-[44px] leading-none tabular-nums" style={{ color, fontFamily: "var(--font-serif-display)" }}>
                        {crowdPct}%
                      </span>
                      <span style={{ color }} className="mono-label !text-[10px] mt-1.5">
                        {label}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5">
                    <button
                      onClick={() => setSelectedPlace(place)}
                      className="w-full text-[12px] font-medium py-2.5 px-4 rounded-md flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer active:scale-[0.99]"
                      style={{ backgroundColor: "rgba(59,158,255,0.10)", boxShadow: "inset 0 0 0 1px rgba(59,158,255,0.40)", color: "#3b9eff" }}
                    >
                      <Activity className="w-3.5 h-3.5" strokeWidth={1.75} />
                      Add live report
                      <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
