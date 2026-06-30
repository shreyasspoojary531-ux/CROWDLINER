"use client";

import { useCrowdStore } from "@/store/useCrowdStore";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Dashboard from "@/components/Dashboard";
import Explore from "@/components/Explore";
import Toast from "@/components/ui/Toast";
import { motion, AnimatePresence } from "framer-motion";

const smoothEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

// Route-level lazy loading: PlaceDetails & AddReport pull in recharts, the
// heaviest dependency. Deferring them keeps the initial Dashboard/Explore
// compile light (recharts isn't compiled until those views actually open),
// which prevents the RAM spike that crashed the dev server.
const PlaceDetails = dynamic(() => import("@/components/PlaceDetails"), {
  loading: () => (
    <div className="flex items-center justify-center p-20">
      <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-slate-900 dark:border-slate-800 dark:border-t-white animate-spin" />
    </div>
  ),
});
const AddReport = dynamic(() => import("@/components/AddReport"), {
  loading: () => (
    <div className="flex items-center justify-center p-20">
      <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-slate-900 dark:border-slate-800 dark:border-t-white animate-spin" />
    </div>
  ),
});

export default function Home() {
  const { activeView } = useCrowdStore();

  // Background artwork: Image 1 (city) for the dashboard, Image 2 (circuit) elsewhere.
  const artworkClass =
    activeView === "dashboard" ? "bg-artwork-dashboard" : "bg-artwork-shared";

  const viewVariants = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: smoothEase } },
    exit: { opacity: 0, y: -6, transition: { duration: 0.18, ease: smoothEase } },
  };

  return (
    <div className="min-h-screen app-shell flex flex-col font-sans select-none antialiased">
      {/* Top Navbar */}
      <Navbar />

      {/* Sidebar + scrollable view panel */}
      <div className="flex flex-1 relative items-stretch">
        <Sidebar />

        <main
          className={`flex-1 overflow-y-auto h-[calc(100vh-61px)] pb-20 md:pb-0 app-main relative ${artworkClass}`}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial="initial"
              animate="animate"
              exit="exit"
              variants={viewVariants}
              className="h-full w-full"
            >
              {activeView === "dashboard" && <Dashboard />}
              {activeView === "explore" && <Explore />}
              {activeView === "details" && <PlaceDetails />}
              {activeView === "add-report" && <AddReport />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Floating notifications */}
      <Toast />
    </div>
  );
}
