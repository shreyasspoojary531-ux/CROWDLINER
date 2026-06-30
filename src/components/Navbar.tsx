"use client";

import { useEffect, useState, useCallback } from "react";
import { Compass, MapPin, Moon, Sun, X, Vote, Navigation } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCrowdStore } from "@/store/useCrowdStore";

/**
 * Premium product header: monochrome wordmark, live context, and theme control.
 * Mobile: wordmark + dark-mode toggle only.
 * Desktop: wordmark + city badge + IST clock + dark-mode toggle.
 */
export default function Navbar() {
  const { setView, places, setReportingPlaceId } = useCrowdStore();
  const [timeStr, setTimeStr] = useState<string>("");
  // Safe SSR init: always start false, sync from localStorage client-side in useEffect
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [notifPlace, setNotifPlace] = useState<{ id: string; name: string } | null>(null);
  const [notifVisible, setNotifVisible] = useState(false);
  const [notifDismissed, setNotifDismissed] = useState(false);

  useEffect(() => {
    // On first mount, read persisted preference and apply it
    const saved = window.localStorage.getItem("crowdliner-theme") === "dark";
    setIsDark(saved);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.style.colorScheme = isDark ? "dark" : "light";
    window.localStorage.setItem("crowdliner-theme", isDark ? "dark" : "light");
  }, [isDark, mounted]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      };
      setTimeStr(now.toLocaleTimeString("en-IN", options));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Simulated proximity notification — fires once after 5s
  useEffect(() => {
    if (notifDismissed) return;
    const timer = setTimeout(() => {
      const randomIdx = Math.floor(Math.random() * places.length);
      const picked = places[randomIdx];
      setNotifPlace({ id: picked.id, name: picked.name });
      setNotifVisible(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, [places, notifDismissed]);

  useEffect(() => {
    if (!notifVisible) return;
    const autoDismiss = setTimeout(() => setNotifVisible(false), 12000);
    return () => clearTimeout(autoDismiss);
  }, [notifVisible]);

  const handleVoteNow = useCallback(() => {
    if (!notifPlace) return;
    setNotifVisible(false);
    setNotifDismissed(true);
    setReportingPlaceId(notifPlace.id);
  }, [notifPlace, setReportingPlaceId]);

  const handleDismiss = useCallback(() => {
    setNotifVisible(false);
    setNotifDismissed(true);
  }, []);

  return (
    <>
      <header
        className="topbar sticky top-0 z-40 w-full px-4 md:px-7 py-3 flex items-center justify-between relative"
        style={{ minHeight: "61px" }}
      >
        {/* Wordmark */}
        <div
          onClick={() => setView("dashboard")}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div
            className="relative w-9 h-9 rounded-lg border border-slate-300/80 bg-white/70 dark:border-white/10 dark:bg-white/[0.06] flex items-center justify-center transition-all duration-300 group-hover:border-slate-900 dark:group-hover:border-white/40"
          >
            <Compass className="w-[18px] h-[18px] text-slate-950 dark:text-white" strokeWidth={1.9} />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="professional-wordmark brand-gradient text-[13px] leading-none">
              CrowdLiner
            </span>
            <span className="hidden sm:inline font-mono text-[9px] uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
              Predictive Tracking
            </span>
          </div>
        </div>

        {/* Right cluster */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* City badge — hidden on mobile */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-white/70 text-slate-800 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-100">
            <MapPin className="w-3.5 h-3.5 text-slate-500 dark:text-slate-300" strokeWidth={1.75} />
            <span className="text-[12px] font-medium">Bengaluru</span>
            <span className="relative flex h-1.5 w-1.5 ml-0.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3ad389] opacity-60" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#3ad389]" />
            </span>
          </div>

          {/* Live IST clock — hidden on mobile */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white/70 dark:border-white/10 dark:bg-white/[0.05]">
            <span className="font-mono text-[10px] font-medium text-slate-500 dark:text-slate-400 tracking-wider">IST</span>
            <span className="font-mono text-[12px] font-semibold text-slate-950 dark:text-white tabular-nums">
              {timeStr || "—"}
            </span>
          </div>

          {/* Dark mode toggle — always visible */}
          <button
            onClick={() => setIsDark((current) => !current)}
            className="relative h-8 w-14 rounded-full border border-slate-200 bg-white/80 p-1 text-slate-600 hover:border-slate-400 dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-300 dark:hover:border-white/20 transition-all ml-1 sm:ml-2 cursor-pointer shrink-0"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            aria-pressed={isDark}
          >
            <span
              className={`absolute left-1 top-1 h-6 w-6 rounded-full bg-slate-950 dark:bg-white transition-transform duration-300 ${
                isDark ? "translate-x-6" : "translate-x-0"
              }`}
            />
            <span className="relative z-10 flex h-full items-center justify-between px-0.5">
              <Sun className={`h-3.5 w-3.5 ${isDark ? "text-slate-500" : "text-white"}`} strokeWidth={2} />
              <Moon className={`h-3.5 w-3.5 ${isDark ? "text-slate-950" : "text-slate-500"}`} strokeWidth={2} />
            </span>
          </button>
        </div>

        {/* Horizontal border glow stroke along navbar bottom separator */}
        <div className="absolute bottom-0 left-0 right-0 h-px overflow-hidden pointer-events-none">
          <div className="w-1/4 h-full bg-gradient-to-r from-transparent via-[#3b9eff]/50 to-transparent animate-border-glow-h" />
        </div>
      </header>

      {/* Floating proximity notification */}
      {/* On mobile: centered at top with smaller padding. On desktop: top-right corner */}
      <div className="fixed top-4 left-4 right-4 md:top-[76px] md:left-auto md:right-5 md:w-auto z-50 pointer-events-none flex flex-col items-center md:items-end">
        <AnimatePresence>
          {notifVisible && notifPlace && (
            <motion.div
              initial={{ y: -24, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{
                y: -16,
                opacity: 0,
                scale: 0.96,
                transition: { duration: 0.2, ease: "easeIn" },
              }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              className="pointer-events-auto w-full md:w-[380px] overflow-hidden rounded-xl bg-white/75 dark:bg-slate-900/75 border border-slate-200/80 dark:border-white/10 shadow-lg shadow-slate-900/10 dark:shadow-black/30"
              style={{
                backdropFilter: "blur(20px) saturate(160%)",
                WebkitBackdropFilter: "blur(20px) saturate(160%)",
                boxShadow: "inset 2px 0 0 rgba(100,116,139,0.5), 0 8px 32px rgba(15,23,42,0.10)",
              }}
            >
                <div className="p-3 md:p-4 flex items-start gap-3">
                  {/* Radar ping */}
                  <div className="relative shrink-0 w-7 h-7 flex items-center justify-center mt-0.5">
                    <span className="absolute inset-0 rounded-full bg-slate-400/10 animate-ping opacity-30" />
                    <span
                      className="absolute inset-1 rounded-full bg-slate-400/15 animate-ping opacity-50"
                      style={{ animationDelay: "0.3s" }}
                    />
                    <div className="relative w-5 h-5 rounded-full bg-slate-500/10 border border-slate-400/30 flex items-center justify-center">
                      <Navigation className="w-3 h-3 text-slate-700 dark:text-slate-200 rotate-45" strokeWidth={2} />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                    <span className="mono-label text-slate-500 dark:text-slate-400">Proximity Alert</span>
                    <p className="text-[12px] md:text-[13px] font-semibold text-slate-950 dark:text-white truncate mt-0.5">
                      You are near <span className="text-slate-700 dark:text-slate-200">{notifPlace.name}</span>
                    </p>
                    <p className="text-[10px] md:text-[11px] text-slate-500 dark:text-slate-400 leading-normal mt-0.5">
                      Help others — report the live crowd level right now.
                    </p>

                    <div className="mt-2.5 flex items-center gap-2">
                      <button
                        onClick={handleVoteNow}
                        className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-md border border-slate-300 bg-slate-950 text-white dark:border-white/15 dark:bg-white dark:text-slate-950 cursor-pointer"
                      >
                        <Vote className="w-3 h-3" strokeWidth={2} />
                        <span>Vote Now</span>
                      </button>
                      <button
                        onClick={handleDismiss}
                        className="text-[11px] font-medium text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white px-2 py-1 rounded-md transition-colors"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleDismiss}
                    className="shrink-0 w-6 h-6 rounded-full hover:bg-slate-900/5 dark:hover:bg-white/10 flex items-center justify-center text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white transition-all duration-150"
                    aria-label="Dismiss"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>

                {/* Draining countdown */}
                <div className="relative h-[2px] bg-slate-900/5 dark:bg-white/[0.06]">
                  <motion.div
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: 12, ease: "linear" }}
                    className="h-full bg-slate-400 dark:bg-slate-300"
                  />
                </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
