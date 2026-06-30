"use client";

import { motion } from "framer-motion";
import { getCrowdStatus } from "@/utils/crowdData";
import { useState, useRef } from "react";

interface CrowdBarProps {
  percentage: number;
  animate?: boolean;
  height?: number;
}

/**
 * Elegant crowd meter — a thin graphite rail with a fluid status-colored fill,
 * a soft endpoint glow, and a mono hover tooltip. Pure black surface language:
 * depth comes from the 1px rail and the accent, never from a drop shadow.
 */
export default function CrowdBar({ percentage, animate = true, height = 5 }: CrowdBarProps) {
  const { color, label } = getCrowdStatus(percentage);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const displayWidth = `${percentage}%`;
  const railHeight = Math.max(height, 4);

  return (
    <div
      ref={containerRef}
      className="w-full relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="mono-label">Crowd Level</span>
        <span
          style={{ color }}
          className="font-sans text-[12px] font-medium tracking-tight transition-colors duration-300"
        >
          {label}
        </span>
      </div>

      {/* Rail */}
      <div
        className="w-full rounded-full overflow-visible relative cursor-help"
        style={{
          height: `${railHeight}px`,
          backgroundColor: "rgba(41, 45, 48, 0.55)",
          boxShadow: "inset 0 0 0 1px rgba(41, 45, 48, 0.9)",
        }}
      >
        {/* Fluid fill */}
        {animate ? (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: displayWidth }}
            transition={{ type: "spring", stiffness: 90, damping: 18, mass: 0.8 }}
            className="relative h-full rounded-full"
            style={{
              backgroundColor: color,
              boxShadow: `0 0 14px ${color}55`,
            }}
          >
            {/* trailing sheen at the fill edge */}
            <span
              className="absolute right-0 top-1/2 -translate-y-1/2 h-[140%] w-px"
              style={{ backgroundColor: "#ffffff", opacity: 0.55 }}
            />
          </motion.div>
        ) : (
          <div
            className="relative h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: displayWidth, backgroundColor: color, boxShadow: `0 0 12px ${color}40` }}
          >
            <span
              className="absolute right-0 top-1/2 -translate-y-1/2 h-[140%] w-px"
              style={{ backgroundColor: "#ffffff", opacity: 0.5 }}
            />
          </div>
        )}

        {/* Hover tooltip following the fill endpoint */}
        <div
          className="absolute bottom-full mb-2 -translate-x-1/2 pointer-events-none transition-all duration-200 z-30"
          style={{
            left: displayWidth,
            opacity: isHovered ? 1 : 0,
            transform: `translate(-50%, ${isHovered ? "-4px" : "4px"})`,
          }}
        >
          <div className="layer-glass font-mono text-[10px] font-medium text-frost px-2 py-1 rounded-md whitespace-nowrap flex items-center gap-1.5">
            <span style={{ color }}>●</span>
            <span>{percentage}% Occupancy</span>
          </div>
          <div className="w-1.5 h-1.5 rotate-45 bg-black mx-auto -mt-[4px] relative z-20" style={{ boxShadow: "1px 1px 0 0 rgba(41,45,48,0.9)" }} />
        </div>
      </div>
    </div>
  );
}
