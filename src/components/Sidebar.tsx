"use client";

import { motion } from "framer-motion";
import { LayoutDashboard, Compass, PlusCircle } from "lucide-react";
import { useCrowdStore, ViewType } from "@/store/useCrowdStore";

/**
 * Minimal SaaS navigation rail with theme-aware monochrome active states.
 * Desktop: wider sidebar at 260px with full labels.
 * Tablet (md): 68px icon-only rail with tooltips.
 * Mobile: bottom tab bar.
 */
export default function Sidebar() {
  const { activeView, setView } = useCrowdStore();

  const menuItems = [
    { id: "dashboard" as ViewType, label: "Dashboard", icon: LayoutDashboard },
    { id: "explore" as ViewType, label: "Explore Places", icon: Compass },
    { id: "add-report" as ViewType, label: "Add Report", icon: PlusCircle },
  ];

  const isActive = (id: ViewType) =>
    activeView === id || (id === "explore" && activeView === "details");

  return (
    <>
      {/* Desktop (>=1024px) and Tablet (768–1023px) floating sidebar */}
      <aside className="sidebar-shell hidden md:flex flex-col justify-between p-3 lg:p-4 sticky top-[61px] h-[calc(100vh-61px)] shrink-0 transition-all duration-300 w-[68px] lg:w-[260px] relative">
        <div className="flex flex-col gap-1">
          {/* Section label (desktop only) */}
          <span className="hidden lg:inline mono-label px-3 pt-2 pb-3">Navigate</span>

          <nav className="flex flex-col gap-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.id);
              return (
                <div
                  key={item.id}
                  className="relative group"
                >
                  {/* Sliding selection pill */}
                  {active && (
                    <motion.div
                      layoutId="active-pill-nav"
                      className="absolute inset-0 rounded-lg"
                      style={{
                        backgroundColor: "var(--color-surface-lift)",
                        boxShadow: "inset 0 0 0 1px var(--border-light)",
                      }}
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}

                  <button
                    onClick={() => setView(item.id)}
                    className={`relative w-full flex items-center justify-center lg:justify-start gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium tracking-tight transition-colors duration-200 text-left outline-none cursor-pointer ${
                      active
                        ? "text-slate-950 dark:text-white"
                        : "text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
                    }`}
                  >
                    {/* Left accent tick on the active rail */}
                    {active && (
                      <motion.span
                        layoutId="active-tick-nav"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 rounded-full bg-slate-950 dark:bg-white"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}

                    <div className="relative flex items-center justify-center w-[18px] h-[18px] shrink-0">
                      <Icon
                        className={`w-[18px] h-[18px] transition-all duration-200 group-hover:scale-[1.08] ${
                          active ? "text-slate-950 dark:text-white" : "text-slate-500 group-hover:text-slate-950 dark:text-slate-400 dark:group-hover:text-white"
                        }`}
                        strokeWidth={1.75}
                      />
                    </div>

                    <span className="hidden lg:inline flex-1 truncate">{item.label}</span>
                  </button>

                  {/* Tablet hover tooltip */}
                  <div className="lg:hidden absolute left-[60px] top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-md layer-glass text-[11px] font-medium text-slate-950 dark:text-white opacity-0 translate-x-2 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 z-50 whitespace-nowrap">
                    {item.label}
                  </div>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Footer status card (desktop only) */}
        <div className="hidden lg:flex flex-col gap-2 p-3.5 rounded-lg premium-glass-card">
          <div className="flex items-center justify-between">
            <span className="mono-label">Network</span>
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3ad389] opacity-60" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#3ad389]" />
              </span>
              <span className="text-[10px] font-mono text-slate-700 dark:text-slate-200">LIVE</span>
            </span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
            Real-time crowd density models powered by Bengaluru reports.
          </p>
        </div>

        {/* Vertical border glow stroke along sidebar right separator */}
        <div className="absolute top-0 bottom-0 right-0 w-px overflow-hidden pointer-events-none">
          <div className="w-full h-1/3 bg-gradient-to-b from-transparent via-[#3b9eff]/50 to-transparent animate-border-glow-v" />
        </div>
      </aside>

      {/* Mobile bottom tab bar (<768px) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 layer-glass z-40 px-4 flex items-center justify-around">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.id);
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className="relative flex flex-col items-center justify-center gap-1 py-1 px-4 min-w-[72px] outline-none cursor-pointer"
            >
              <div className="relative flex items-center justify-center">
                {active && (
                  <span className="absolute inset-0 w-8 h-8 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 rounded-full bg-slate-500/10 blur-md" />
                )}
                <Icon
                  className={`w-[20px] h-[20px] transition-colors duration-200 ${
                    active ? "text-slate-950 dark:text-white" : "text-slate-500 dark:text-slate-400"
                  }`}
                  strokeWidth={1.75}
                />
              </div>
              <span
                className={`text-[10px] font-medium tracking-tight ${
                  active ? "text-slate-950 dark:text-white" : "text-slate-500 dark:text-slate-400"
                }`}
              >
                {item.label.split(" ")[0]}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}
