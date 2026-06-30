"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Pin, PinOff, Clock, AlertCircle, Sparkles, MapPin, Calendar } from "lucide-react";
import { useCrowdStore } from "@/store/useCrowdStore";
import {
  getHourIndex,
  getHourLabel,
  getCrowdStatus,
  getEstimatedWaitingTime,
  getBestTimeRecommendation,
  OPERATING_HOURS,
} from "@/utils/crowdData";
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  ReferenceLine,
} from "recharts";
import CrowdBar from "./ui/CrowdBar";

/**
 * Place Details — a professional analytics surface. Thin-line curve on a faint
 * grid, a spotlight column for the selected hour, a NOW marker, and a clean
 * planning card with forecast + queue delay + smart recommendation.
 */
export default function PlaceDetails() {
  const { selectedPlaceId, places, togglePin, setView } = useCrowdStore();
  const [mounted, setMounted] = useState(false);

  const currentHour = new Date().getHours();
  const defaultHourIndex = getHourIndex(currentHour);
  const [selectedHourIdx, setSelectedHourIdx] = useState<number>(defaultHourIndex);

  useEffect(() => {
    setMounted(true);
  }, []);

  const place = places.find((p) => p.id === selectedPlaceId);

  useEffect(() => {
    setSelectedHourIdx(defaultHourIndex);
  }, [selectedPlaceId, defaultHourIndex]);

  if (!place) {
    return (
      <div className="p-10 flex flex-col items-center justify-center text-center gap-4">
        <AlertCircle className="w-10 h-10 text-[#ff9592]" strokeWidth={1.5} />
        <p className="text-[#a1a4a5]">Place not found.</p>
        <button
          onClick={() => setView("explore")}
          className="px-4 py-2 bg-[#0b0e14] text-frost rounded-md border border-[#292d30] cursor-pointer"
        >
          Back to Explore
        </button>
      </div>
    );
  }

  const currentPercentage = place.crowdCurve[defaultHourIndex];
  const { color, label, badgeBg, badgeText } = getCrowdStatus(currentPercentage);

  const selectedPercentage = place.crowdCurve[selectedHourIdx];
  const selectedStatus = getCrowdStatus(selectedPercentage);
  const waitTime = getEstimatedWaitingTime(selectedPercentage, place.category);
  const { bestHour, recommendationText } = getBestTimeRecommendation(place, selectedHourIdx);

  const chartData = place.crowdCurve.map((val, idx) => ({
    hour: getHourLabel(idx),
    level: val,
    rawHourIdx: idx,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const status = getCrowdStatus(data.level);
      const estWait = getEstimatedWaitingTime(data.level, place.category);
      return (
        <div className="layer-glass p-3 rounded-lg flex flex-col gap-1">
          <p className="font-mono text-[11px] text-frost leading-none mb-1">{data.hour}</p>
          <p className="text-[11px] font-medium" style={{ color: status.color }}>
            {data.level}% · {status.label}
          </p>
          <p className="text-[10px] text-[#a1a4a5]">Est. wait ~{estWait} mins</p>
        </div>
      );
    }
    return null;
  };

  const selectedHourLabel = getHourLabel(selectedHourIdx);
  const currentHourLabel = getHourLabel(defaultHourIndex);

  return (
    <div className="flex flex-col gap-7 p-6 md:p-10 max-w-[1200px] mx-auto w-full">
      {/* Back */}
      <button
        onClick={() => setView("explore")}
        className="flex items-center gap-2 text-[12px] font-medium text-[#a1a4a5] hover:text-frost transition-colors group w-fit"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" strokeWidth={1.75} />
        Back to Explore
      </button>

      {/* Title block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 layer-2 surface-sheen rounded-2xl p-6">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-display text-[26px] md:text-[30px] text-frost leading-tight">{place.name}</h1>
            <span
              className="px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-wide"
              style={{ backgroundColor: badgeBg, color }}
            >
              {label} load
            </span>
          </div>
          <p className="text-[12px] text-[#a1a4a5] flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
            {place.address}
          </p>
        </div>

        <button
          onClick={() => togglePin(place.id)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-md text-[12px] font-medium transition-all duration-200 shrink-0 cursor-pointer"
          style={
            place.isPinned
              ? { backgroundColor: "rgba(59,158,255,0.10)", boxShadow: "inset 0 0 0 1px rgba(59,158,255,0.35)", color: "#3b9eff" }
              : { border: "1px solid #292d30", color: "#a1a4a5" }
          }
        >
          {place.isPinned ? (
            <>
              <Pin className="w-3.5 h-3.5 fill-[#3b9eff]" strokeWidth={1.75} />
              Pinned
            </>
          ) : (
            <>
              <PinOff className="w-3.5 h-3.5" strokeWidth={1.75} />
              Pin to dashboard
            </>
          )}
        </button>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Graph */}
        <div className="lg:col-span-2 layer-2 surface-sheen rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="mono-label !text-[#a1a4a5]">Crowd Density Trend · IST</h2>
            <span className="mono-label !text-[10px]">6 AM — 11 PM</span>
          </div>

          <div className="w-full h-[320px] flex items-center justify-center mt-2 relative">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 18, right: 15, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorLevel" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={color} stopOpacity={0.14} />
                      <stop offset="95%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 6" stroke="rgba(41, 45, 48, 0.6)" vertical={false} />

                  {/* Faint load-zone bands */}
                  <ReferenceArea y1={0} y2={35} fill="#3ad389" fillOpacity={0.012} />
                  <ReferenceArea y1={36} y2={65} fill="#ffca16" fillOpacity={0.012} />
                  <ReferenceArea y1={66} y2={100} fill="#ff9592" fillOpacity={0.012} />

                  {/* Spotlight column for selected hour */}
                  <ReferenceArea x1={selectedHourLabel} x2={selectedHourLabel} fill={color} fillOpacity={0.06} />

                  {/* NOW marker */}
                  <ReferenceLine
                    x={currentHourLabel}
                    stroke="#3b9eff"
                    strokeDasharray="3 3"
                    label={{ value: "NOW", fill: "#3b9eff", fontSize: 9, fontWeight: 600, position: "top", offset: 6 }}
                  />

                  <XAxis dataKey="hour" stroke="#464a4d" fontSize={10} tickLine={false} axisLine={false} dy={8} />
                  <YAxis stroke="#464a4d" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} dx={-8} tickFormatter={() => ""} />

                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(59,158,255,0.18)", strokeWidth: 1.5 }} />

                  <Area type="monotone" dataKey="level" stroke="none" fillOpacity={1} fill="url(#colorLevel)" animationDuration={900} />
                  <Line
                    type="monotone"
                    dataKey="level"
                    stroke={color}
                    strokeWidth={2}
                    dot={{ r: 2, stroke: color, strokeWidth: 1.5, fill: "#0b0e14" }}
                    activeDot={{ r: 4, stroke: "#ffffff", strokeWidth: 1.5, fill: color }}
                    animationDuration={800}
                    animationEasing="ease-out"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full rounded skeleton-shimmer" />
            )}
          </div>

          <div className="flex justify-between items-center border-t border-[#292d30] pt-3 px-1">
            <span className="mono-label flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" strokeWidth={1.75} />
              Today&apos;s crowd curve
            </span>
            <span className="font-mono text-[10px] text-[#6e727a]">{place.lastUpdated}</span>
          </div>
        </div>

        {/* Planning card */}
        <div className="layer-2 surface-sheen rounded-2xl p-5 flex flex-col gap-6 justify-between">
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-2 border-b border-[#292d30] pb-3">
              <Clock className="w-[18px] h-[18px] text-[#3b9eff]" strokeWidth={1.75} />
              <h2 className="mono-label !text-[#a1a4a5]">Planning to visit?</h2>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="mono-label">Select target time</label>
              <select
                value={selectedHourIdx}
                onChange={(e) => setSelectedHourIdx(parseInt(e.target.value, 10))}
                className="w-full bg-[#0b0e14] border border-[#292d30] text-frost text-[13px] font-medium rounded-lg py-2.5 px-3.5 outline-none focus:border-[#3b9eff]/50 cursor-pointer transition-colors"
              >
                {OPERATING_HOURS.map((hr, idx) => (
                  <option key={hr} value={idx} className="bg-[#0b0e14]">
                    {hr} {idx === defaultHourIndex ? "(now)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="h-px bg-[#292d30]" />

            <div className="flex flex-col gap-2.5 rounded-lg border border-[#292d30] p-4">
              <span className="mono-label">Forecasted crowd · {getHourLabel(selectedHourIdx)}</span>
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-[30px] text-frost leading-none tabular-nums" style={{ fontFamily: "var(--font-serif-display)" }}>
                  {selectedPercentage}%
                </span>
                <span className="text-[12px] font-medium" style={{ color: selectedStatus.color }}>
                  {selectedStatus.label} load
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full overflow-hidden mt-1" style={{ backgroundColor: "rgba(41,45,48,0.6)" }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${selectedPercentage}%`, backgroundColor: selectedStatus.color }}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1 px-1">
              <span className="mono-label">Est. queue delay</span>
              <p className="font-mono text-[18px] text-frost mt-1">
                ~{waitTime} {waitTime === 1 ? "min" : "mins"}
              </p>
              <p className="text-[11px] text-[#6e727a] leading-relaxed mt-1">
                Dynamic checkout-queue delay for category{" "}
                <span className="font-mono text-[10px] uppercase text-[#a1a4a5]">{place.category}</span>.
              </p>
            </div>
          </div>

          {/* Smart recommendation */}
          <div className="rounded-lg p-4 flex gap-3" style={{ backgroundColor: "rgba(59,158,255,0.05)", boxShadow: "inset 0 0 0 1px rgba(59,158,255,0.18)" }}>
            <Sparkles className="w-[18px] h-[18px] text-[#3b9eff] shrink-0 mt-0.5" strokeWidth={1.75} />
            <div className="flex flex-col gap-1">
              <span className="mono-label !text-[#3b9eff]">Smart recommendation</span>
              <p className="text-[12px] text-frost leading-relaxed font-medium">{recommendationText}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
