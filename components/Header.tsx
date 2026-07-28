"use client";

import { useEffect, useState } from "react";

export default function Header() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header
      className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/95 px-4 py-3 backdrop-blur supports-backdrop-filter:bg-white/80"
      style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Swap for <img src="/logo.png" alt="Lite-Intel" className="h-8" /> once you have a logo file */}
          <span className="text-lg font-bold tracking-tight text-black">
            Lite-Intel{" "}
            <span style={{ color: "var(--color-primary)" }}>Attendance</span>
          </span>
        </div>

        <div className="text-right">
          <p className="hidden text-xs text-gray-500 sm:block">Today</p>
          <span
            className="rounded px-2 py-1 text-xs font-medium text-white sm:text-sm"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            <span className="sm:hidden">
              {now.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </span>
            <span className="hidden sm:inline">
              {now.toLocaleDateString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </span>
        </div>
      </div>
    </header>
  );
}
