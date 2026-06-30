"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Clock, Calendar, ShieldCheck, HelpCircle, ChevronRight, Activity } from "lucide-react";
import { useCrowdStore } from "@/store/useCrowdStore";
import { Place, getHourIndex, getHourLabel, getCrowdStatus } from "@/utils/crowdData";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, ResponsiveContainer } from "recharts";

interface ReportFormProps {
  place: Place;
  onBack: () => void;
}

export default function ReportForm({ place, onBack }: ReportFormProps) {
  const { submitReport, lastReportTime, setView } = useCrowdStore();
  const [selectedLevel, setSelectedLevel] = useState<"Low" | "Medium" | "High" | "Very High">("Medium");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [truthScoreResult, setTruthScoreResult] = useState<number | null>(null);

  const [istTimeStr, setIstTimeStr] = useState("");
  const [istDateStr, setIstDateStr] = useState("");
  const [originalCurve, setOriginalCurve] = useState<number[]>([]);

  // SSR-safe: capture current time/hour only after mount so server+client HTML match
  const [mounted, setMounted] = useState(false);
  const [nowMs, setNowMs] = useState(0);
  const [currentHour, setCurrentHour] = useState(12); // neutral default

  const [progressOffset, setProgressOffset] = useState(2 * Math.PI * 64);
  const [liveCounter, setLiveCounter] = useState(0);

  useEffect(() => {
    const now = new Date();
    setNowMs(Date.now());
    setCurrentHour(now.getHours());
    setMounted(true);
    setIstTimeStr(now.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: true }));
    setIstDateStr(now.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", weekday: "short", day: "numeric", month: "short", year: "numeric" }));
  }, []);

  useEffect(() => {
    if (place) setOriginalCurve([...place.crowdCurve]);
  }, [place]);

  // Radial score + counter animation (logic preserved)
  useEffect(() => {
    if (truthScoreResult !== null) {
      const radius = 64;
      const circumference = 2 * Math.PI * radius;
      let startValue = 0;
      const duration = 1200;
      const steps = 60;
      const stepValue = truthScoreResult / steps;
      const intervalTime = duration / steps;
      const timer = setInterval(() => {
        startValue += stepValue;
        if (startValue >= truthScoreResult) {
          startValue = truthScoreResult;
          clearInterval(timer);
        }
        setLiveCounter(Math.round(startValue));
        setProgressOffset(circumference - (startValue / 100) * circumference);
      }, intervalTime);
      return () => clearInterval(timer);
    }
  }, [truthScoreResult]);

  const handleSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      const result = submitReport(place.id, selectedLevel);
      setIsSubmitting(false);
      if (result.success && result.truthScore !== undefined) {
        setTruthScoreResult(result.truthScore);
      }
    }, 1000);
  };

  const cooldownPeriod = 30 * 60 * 1000;
  // Use mounted-state nowMs so SSR renders the same "not in cooldown" HTML as client first paint
  const isCooldownActive = mounted && lastReportTime != null && nowMs - lastReportTime < cooldownPeriod;
  const remainingMinutes = (mounted && lastReportTime) ? Math.ceil((cooldownPeriod - (nowMs - lastReportTime)) / 60000) : 0;

  const hourIdx = getHourIndex(currentHour);
  const currentPrediction = originalCurve[hourIdx] || place.crowdCurve[hourIdx];

  const startIdx = Math.max(0, Math.min(13, hourIdx - 2));
  const endIdx = startIdx + 4;
  const miniGraphData = [];
  for (let i = startIdx; i <= endIdx; i++) {
    miniGraphData.push({ hour: getHourLabel(i), before: originalCurve[i] || place.crowdCurve[i], after: place.crowdCurve[i] });
  }

  const crowdOptions = [
    { level: "Low" as const, glyph: "●", desc: "Sparse / quiet. Easy seat or queue.", color: "#3ad389" },
    { level: "Medium" as const, glyph: "●", desc: "Moderate traffic. Short queues.", color: "#ffca16" },
    { level: "High" as const, glyph: "●", desc: "Heavy rush. Long billing queues.", color: "#3b9eff" },
    { level: "Very High" as const, glyph: "●", desc: "Peak capacity. Blocked entry.", color: "#ff9592" },
  ];

  const scoreColor = truthScoreResult !== null && truthScoreResult >= 70 ? "#3ad389" : "#ffca16";

  return (
    <div className="flex flex-col gap-6 p-6 md:p-10 max-w-xl mx-auto w-full">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-[12px] font-medium text-[#a1a4a5] hover:text-frost transition-colors group w-fit"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" strokeWidth={1.75} />
        Back to scan list
      </button>

      {truthScoreResult !== null ? (
        /* ---- Truth score result ---- */
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="premium-glass-card surface-sheen rounded-2xl p-7 flex flex-col gap-6 items-center text-center"
          style={{
            backdropFilter: "blur(32px) saturate(180%)",
            WebkitBackdropFilter: "blur(32px) saturate(180%)",
          }}
        >
          {/* Radial score */}
          <div className="relative w-36 h-36 flex items-center justify-center">
            <div className="absolute inset-4 rounded-full blur-xl opacity-20 transition-all duration-500" style={{ backgroundColor: scoreColor }} />

            {truthScoreResult >= 70 &&
              Array.from({ length: 8 }).map((_, i) => {
                const angle = (i * 360) / 8;
                const rad = (angle * Math.PI) / 180;
                const x = Math.cos(rad) * 85;
                const y = Math.sin(rad) * 85;
                return (
                  <motion.div
                    key={i}
                    initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                    animate={{ x, y, scale: 0, opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 1.2 }}
                    className="absolute w-2 h-2 rounded-full z-20 pointer-events-none"
                    style={{ backgroundColor: scoreColor }}
                  />
                );
              })}

            <svg className="w-full h-full -rotate-90">
              <circle cx="72" cy="72" r="64" className="fill-transparent stroke-[#1b1e22]" strokeWidth="7" />
              <circle
                cx="72"
                cy="72"
                r="64"
                className="fill-transparent transition-all duration-75"
                stroke={scoreColor}
                strokeWidth="7"
                strokeDasharray={`${2 * Math.PI * 64}`}
                strokeDashoffset={progressOffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="font-mono text-[30px] text-frost leading-none tabular-nums">{liveCounter}%</span>
              <span className="mono-label mt-1.5">Truth Score</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <motion.h2
              variants={{ shake: { x: [0, -3, 3, -3, 3, 0], transition: { duration: 0.25 } } }}
              animate={truthScoreResult < 70 ? "shake" : undefined}
              className="text-[17px] font-semibold text-frost flex items-center justify-center gap-2"
            >
              {truthScoreResult >= 70 ? (
                <>
                  <ShieldCheck className="w-5 h-5" style={{ color: scoreColor }} strokeWidth={1.75} />
                  Report approved &amp; blended
                </>
              ) : (
                <>
                  <HelpCircle className="w-5 h-5" style={{ color: scoreColor }} strokeWidth={1.75} />
                  Variance shift registered
                </>
              )}
            </motion.h2>
            <p className="text-[12px] text-[#a1a4a5] max-w-sm leading-relaxed px-2">
              {truthScoreResult >= 70
                ? "Your observation matches recent crowd sensors. Live forecasting curves updated."
                : "A difference was recorded. Your report has been blended to shift local expectations."}
            </p>
          </div>

          {/* Before / after mini graph */}
          <div className="w-full flex flex-col gap-3 rounded-lg border border-[#292d30] p-4">
            <span className="mono-label text-left">Blended shift · 5-hour window</span>
            <div className="w-full h-20 mt-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={miniGraphData}>
                  <XAxis dataKey="hour" stroke="#464a4d" fontSize={8} tickLine={false} axisLine={false} dy={5} />
                  <Line type="monotone" dataKey="before" stroke="#3b9eff" strokeWidth={1.5} strokeDasharray="3 3" opacity={0.35} dot={false} animationDuration={0} />
                  <Line type="monotone" dataKey="after" stroke="#3b9eff" strokeWidth={2} dot={false} animationDuration={1200} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-between text-[8px] font-mono tracking-wider text-[#6e727a] mt-1">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-[1.5px] border-t border-dashed border-[#3b9eff] opacity-50" />
                PREVIOUS ESTIMATE
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-[1.5px] bg-[#3b9eff]" />
                NEW BLENDED TREND
              </span>
            </div>
          </div>

          {/* Sync stats */}
          <div className="w-full grid grid-cols-2 gap-4 rounded-lg border border-[#292d30] p-4">
            <div className="flex flex-col items-center gap-1 border-r border-[#292d30]">
              <span className="mono-label">Forecast load</span>
              <span className="font-mono text-[14px] text-frost">{currentPrediction}%</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="mono-label">Your report</span>
              <span className="font-mono text-[14px] text-[#3b9eff]">{selectedLevel}</span>
            </div>
          </div>

          <button
            onClick={() => setView("details", place.id)}
            className="w-full text-[12px] font-medium py-3 px-4 rounded-md flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer"
            style={{ backgroundColor: "rgba(59,158,255,0.10)", boxShadow: "inset 0 0 0 1px rgba(59,158,255,0.40)", color: "#3b9eff" }}
          >
            Proceed to place trends
            <ChevronRight className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </motion.div>
      ) : (
        /* ---- Report form ---- */
        <form onSubmit={handleSubmission} className="layer-2 surface-sheen rounded-2xl p-6 md:p-7 flex flex-col gap-6">
          <div className="flex flex-col gap-1.5 border-b border-[#292d30] pb-4">
            <span className="mono-label !text-[#3b9eff]">Submit live data</span>
            <h2 className="text-display text-[22px] text-frost leading-tight">
              Report crowd level for <span className="text-[#3b9eff]">{place.name}</span>
            </h2>
          </div>

          {/* Locked metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-[#292d30] p-3.5 flex items-center gap-3">
              <Clock className="w-[18px] h-[18px] text-[#6e727a] shrink-0" strokeWidth={1.75} />
              <div className="flex flex-col">
                <span className="mono-label">IST time</span>
                <span className="font-mono text-[12px] text-frost mt-0.5">{istTimeStr || "…"}</span>
              </div>
            </div>
            <div className="rounded-lg border border-[#292d30] p-3.5 flex items-center gap-3">
              <Calendar className="w-[18px] h-[18px] text-[#6e727a] shrink-0" strokeWidth={1.75} />
              <div className="flex flex-col">
                <span className="mono-label">Date</span>
                <span className="text-[12px] text-frost mt-0.5">{istDateStr || "…"}</span>
              </div>
            </div>
          </div>

          {/* Crowd-level choices */}
          <div className="flex flex-col gap-3">
            <label className="mono-label">What is the current crowd size?</label>
            <div className="grid grid-cols-1 gap-2.5">
              {crowdOptions.map((opt) => {
                const isSelected = selectedLevel === opt.level;
                return (
                  <div
                    key={opt.level}
                    onClick={() => setSelectedLevel(opt.level)}
                    className="flex items-center justify-between p-4 rounded-xl cursor-pointer select-none transition-all duration-200"
                    style={{
                      border: `1px solid ${isSelected ? opt.color : "#292d30"}`,
                      backgroundColor: isSelected ? `${opt.color}12` : "transparent",
                      boxShadow: isSelected ? `inset 0 0 0 1px ${opt.color}66` : undefined,
                    }}
                  >
                    <div className="flex items-center gap-3.5">
                      <span className="text-lg shrink-0" style={{ color: opt.color }}>
                        {opt.glyph}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-[13px] font-semibold text-frost">{opt.level}</span>
                        <span className="text-[11px] text-[#6e727a] mt-0.5">{opt.desc}</span>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: opt.color }}>
                        <div className="w-1.5 h-1.5 rounded-full bg-black" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit / cooldown */}
          <div className="mt-1 flex flex-col gap-3.5">
            {isCooldownActive ? (
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  disabled
                  className="w-full text-[12px] font-medium py-3.5 rounded-md cursor-not-allowed text-[#464a4d]"
                  style={{ border: "1px solid #292d30" }}
                >
                  Submit live report
                </button>
                <p className="text-[10px] text-[#ff9592] font-medium text-center leading-normal">
                  You recently submitted a report. Please wait {remainingMinutes} {remainingMinutes === 1 ? "minute" : "minutes"}.
                </p>
              </div>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full text-[12px] font-medium py-3.5 rounded-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                style={{ backgroundColor: "rgba(59,158,255,0.10)", boxShadow: "inset 0 0 0 1px rgba(59,158,255,0.45)", color: "#3b9eff" }}
              >
                {isSubmitting ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin" strokeWidth={2} />
                    Analyzing crowd patterns…
                  </>
                ) : (
                  "Submit live report"
                )}
              </button>
            )}

            <p className="text-[10px] text-[#6e727a] text-center leading-relaxed max-w-sm mx-auto">
              Submitted reports alter prediction datasets using weighted historical blending. Please only report truthful values.
            </p>
          </div>
        </form>
      )}
    </div>
  );
}
