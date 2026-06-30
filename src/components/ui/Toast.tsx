"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertTriangle, XCircle, X } from "lucide-react";
import { useCrowdStore } from "@/store/useCrowdStore";

/**
 * Frosted-glass toast — flush on black, hairline rail, single accent edge.
 * Status colors are used functionally (data/event context) per design.md.
 */
export default function Toast() {
  const { activeToast, clearToast } = useCrowdStore();

  useEffect(() => {
    if (activeToast) {
      const timer = setTimeout(() => {
        clearToast();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [activeToast, clearToast]);

  const config = (type: string) => {
    switch (type) {
      case "success":
        return { icon: "text-[#3ad389]", edge: "#3ad389" };
      case "info":
        return { icon: "text-[#ffca16]", edge: "#ffca16" };
      case "error":
        return { icon: "text-[#ff9592]", edge: "#ff9592" };
      default:
        return { icon: "text-[#3b9eff]", edge: "#3b9eff" };
    }
  };

  const c = activeToast ? config(activeToast.type) : config("info");

  return (
    <AnimatePresence>
      {activeToast && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3.5 layer-glass pl-5 pr-4 py-3.5 rounded-xl max-w-sm pointer-events-auto"
          style={{ borderLeft: `2px solid ${c.edge}` }}
        >
          {activeToast.type === "success" && <CheckCircle2 className={`w-[18px] h-[18px] shrink-0 ${c.icon}`} />}
          {activeToast.type === "info" && <AlertTriangle className={`w-[18px] h-[18px] shrink-0 ${c.icon}`} />}
          {activeToast.type === "error" && <XCircle className={`w-[18px] h-[18px] shrink-0 ${c.icon}`} />}

          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-frost leading-normal">{activeToast.message}</p>
          </div>

          <button
            onClick={clearToast}
            className="text-[#6e727a] hover:text-frost transition-colors duration-150 ml-1 shrink-0"
            aria-label="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
