export default function Header() {
  const today = new Date();

  return (
    <header className="w-full px-4 py-3 flex items-center justify-between bg-white border-b border-gray-200">
      <div className="flex items-center gap-2">
        {/* Swap for <img src="/logo.png" alt="Lite-Intel" className="h-8" /> once you have a logo file */}
        <span className="text-black font-bold text-lg tracking-tight">
          Lite-Intel{" "}
          <span style={{ color: "var(--color-primary)" }}>Attendance</span>
        </span>
      </div>

      <div className="text-right">
        <p className="text-xs text-gray-500">Today</p>
        <span
          className="text-xs sm:text-sm font-medium px-2 py-1 rounded text-white"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          {today.toLocaleDateString(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      </div>
    </header>
  );
}
