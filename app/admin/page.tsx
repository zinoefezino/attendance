"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Loading03Icon,
  Logout03Icon,
  RefreshIcon,
  SearchList01Icon,
  UserGroupIcon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons";

interface Person {
  _id: string;
  name: string;
  email: string;
  role: "student" | "staff" | "admin";
  group?: string;
}

interface AttendanceRecord {
  _id: string;
  person: Person;
  date: string;
  signInTime?: string;
  signOutTime?: string;
  isLate?: boolean;
}

function toISODate(d: Date) {
  return d.toISOString().split("T")[0];
}

function addDays(dateStr: string, delta: number) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + delta);
  return toISODate(d);
}

function getWeekStart(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  const day = d.getDay(); // 0 = Sun
  const diffToMonday = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diffToMonday);
  return toISODate(d);
}

function formatDay(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default function AdminPage() {
  const router = useRouter();
  const today = toISODate(new Date());

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [viewMode, setViewMode] = useState<"day" | "week">("day");
  const [date, setDate] = useState(today);
  const [weekStart, setWeekStart] = useState(getWeekStart(today));
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function checkAdminAuth() {
      try {
        const res = await fetch("/api/admin/check-auth");
        if (res.ok) setIsAuthenticated(true);
        else router.push("/admin/login");
      } catch {
        router.push("/admin/login");
      }
    }
    checkAdminAuth();
  }, [router]);

  function loadRecords() {
    setLoadingRecords(true);
    const url =
      viewMode === "day"
        ? `/api/attendance?date=${date}`
        : `/api/attendance?startDate=${weekStart}&endDate=${addDays(weekStart, 6)}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => setRecords(Array.isArray(data) ? data : []))
      .catch(() => setRecords([]))
      .finally(() => setLoadingRecords(false));
  }

  useEffect(() => {
    if (isAuthenticated) loadRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, weekStart, viewMode, isAuthenticated]);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  function goToday() {
    setViewMode("day");
    setDate(today);
  }
  function goYesterday() {
    setViewMode("day");
    setDate(addDays(today, -1));
  }
  function goThisWeek() {
    setViewMode("week");
    setWeekStart(getWeekStart(today));
  }
  function stepDay(delta: number) {
    setDate((d) => addDays(d, delta));
  }
  function stepWeek(delta: number) {
    setWeekStart((w) => addDays(w, delta * 7));
  }

  const filteredRecords = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q
      ? records.filter((r) => r.person?.name?.toLowerCase().includes(q))
      : records;
  }, [records, search]);

  const totalSignedIn = records.filter(
    (r) => r.signInTime && !r.signOutTime,
  ).length;
  const totalSignedOut = records.filter((r) => r.signOutTime).length;

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );

  if (isAuthenticated === null) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2">
        <HugeiconsIcon
          icon={Loading03Icon}
          size={20}
          className="animate-spin text-slate-700"
        />
        <p className="text-xs font-medium text-slate-500">
          Verifying access...
        </p>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-4xl p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Admin</h1>
          <p className="text-xs text-slate-500">Attendance records</p>
        </div>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-60"
        >
          {loggingOut ? (
            <HugeiconsIcon
              icon={Loading03Icon}
              size={14}
              className="animate-spin"
            />
          ) : (
            <HugeiconsIcon icon={Logout03Icon} size={14} />
          )}
          {loggingOut ? "Logging out..." : "Logout"}
        </button>
      </div>

      {/* Stat cards */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <StatCard label="Total" value={records.length} />
        <StatCard label="Signed in" value={totalSignedIn} tone="#f54800" />
        <StatCard label="Signed out" value={totalSignedOut} tone="#64748b" />
      </div>

      <AdminGuide />

      {/* Presets */}
      <div className="mb-3 flex flex-wrap gap-2">
        <PresetButton
          label="Today"
          active={viewMode === "day" && date === today}
          onClick={goToday}
        />
        <PresetButton
          label="Yesterday"
          active={viewMode === "day" && date === addDays(today, -1)}
          onClick={goYesterday}
        />
        <PresetButton
          label="This Week"
          active={viewMode === "week" && weekStart === getWeekStart(today)}
          onClick={goThisWeek}
        />
      </div>

      {/* View toggle + navigation */}
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1 rounded-lg border bg-slate-50 p-1 text-sm">
          <button
            onClick={() => setViewMode("day")}
            className="rounded px-3 py-1.5 font-medium transition-colors"
            style={{
              backgroundColor: viewMode === "day" ? "#fff" : "transparent",
              color: viewMode === "day" ? "#0f172a" : "#64748b",
              boxShadow:
                viewMode === "day" ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
            }}
          >
            Day
          </button>
          <button
            onClick={() => setViewMode("week")}
            className="rounded px-3 py-1.5 font-medium transition-colors"
            style={{
              backgroundColor: viewMode === "week" ? "#fff" : "transparent",
              color: viewMode === "week" ? "#0f172a" : "#64748b",
              boxShadow:
                viewMode === "week" ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
            }}
          >
            Week
          </button>
        </div>

        {viewMode === "day" ? (
          <div className="flex items-center gap-2">
            <IconButton onClick={() => stepDay(-1)} icon={ArrowLeft01Icon} />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded border bg-white p-2 text-sm"
            />
            <IconButton onClick={() => stepDay(1)} icon={ArrowRight01Icon} />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <IconButton onClick={() => stepWeek(-1)} icon={ArrowLeft01Icon} />
            <span className="whitespace-nowrap rounded border bg-white px-3 py-2 text-sm font-medium text-slate-700">
              {formatDay(weekStart)} – {formatDay(addDays(weekStart, 6))}
            </span>
            <IconButton onClick={() => stepWeek(1)} icon={ArrowRight01Icon} />
          </div>
        )}
      </div>

      {/* Search + refresh */}
      <div className="mb-4 flex items-center gap-2">
        <div className="relative flex-1">
          <HugeiconsIcon
            icon={SearchList01Icon}
            size={16}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded border bg-white py-2 pl-8 pr-3 text-sm"
          />
        </div>
        <IconButton
          onClick={loadRecords}
          icon={loadingRecords ? Loading03Icon : RefreshIcon}
          spin={loadingRecords}
        />
      </div>

      {/* Content */}
      {loadingRecords ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded border bg-white p-10">
          <HugeiconsIcon
            icon={Loading03Icon}
            size={20}
            className="animate-spin text-slate-400"
          />
          <p className="text-xs text-slate-400">Fetching records...</p>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded border bg-slate-50 p-10 text-center">
          <HugeiconsIcon
            icon={UserGroupIcon}
            size={22}
            className="text-slate-300"
          />
          <p className="text-sm text-slate-500">No attendance records found.</p>
        </div>
      ) : viewMode === "day" ? (
        <RoleSections records={filteredRecords} />
      ) : (
        <div className="space-y-4">
          {weekDays.map((d) => {
            const dayRecords = filteredRecords.filter((r) => r.date === d);
            return (
              <details
                key={d}
                open={dayRecords.length > 0}
                className="overflow-hidden rounded border bg-white shadow-sm"
              >
                <summary className="flex cursor-pointer items-center justify-between bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800">
                  <span>{formatDay(d)}</span>
                  <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-slate-500">
                    {dayRecords.length}
                  </span>
                </summary>
                {dayRecords.length === 0 ? (
                  <div className="p-4 text-sm text-slate-500">
                    No records for this day.
                  </div>
                ) : (
                  <div className="border-t">
                    <RoleSections records={dayRecords} flat />
                  </div>
                )}
              </details>
            );
          })}
        </div>
      )}
    </main>
  );
}

function AdminGuide() {
  return (
    <details className="mb-6 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
      <summary className="flex cursor-pointer items-center gap-2 px-4 py-3 text-sm font-semibold text-slate-700">
        <HugeiconsIcon
          icon={InformationCircleIcon}
          size={16}
          className="text-slate-500"
        />
        How to use this page
      </summary>
      <div className="border-t border-slate-200 bg-white px-4 py-4 text-xs leading-relaxed text-slate-600">
        <ul className="space-y-2">
          <li>
            <strong className="text-slate-800">Presets</strong> — Today,
            Yesterday, or This Week jump straight to that date range without
            using the calendar.
          </li>
          <li>
            <strong className="text-slate-800">Day / Week toggle</strong> — Day
            shows one date at a time. Week shows all 7 days, each collapsible —
            days with no records stay collapsed automatically.
          </li>
          <li>
            <strong className="text-slate-800">Arrows</strong> — step backward
            or forward one day (Day view) or one week (Week view) at a time.
          </li>
          <li>
            <strong className="text-slate-800">Search</strong> — filters the
            currently loaded records by name. It doesn&apos;t search other
            dates.
          </li>
          <li>
            <strong className="text-slate-800">Refresh</strong> — reloads
            records for the current view without changing the date.
          </li>
          <li>
            <strong className="text-slate-800">Status pill</strong> —{" "}
            <span className="font-semibold" style={{ color: "#f54800" }}>
              In
            </span>{" "}
            means signed in but not out yet,{" "}
            <span className="font-semibold text-slate-600">Out</span> means done
            for the day, and a red{" "}
            <span className="font-semibold text-red-600">Late</span> tag means
            they signed in after 9:10 AM.
          </li>
        </ul>
      </div>
    </details>
  );
}

function RoleSections({
  records,
  flat,
}: {
  records: AttendanceRecord[];
  flat?: boolean;
}) {
  const students = records.filter((r) => r.person?.role === "student");
  const staff = records.filter((r) => r.person?.role === "staff");

  const sections = [
    { title: "Students", records: students },
    { title: "Staff", records: staff },
  ];

  return (
    <div className={flat ? "" : "space-y-6"}>
      {sections.map((section) =>
        section.records.length === 0 ? null : (
          <section
            key={section.title}
            className={
              flat ? "" : "overflow-hidden rounded border bg-white shadow-sm"
            }
          >
            <div className="flex items-center justify-between border-b bg-slate-50 px-4 py-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                {section.title}
              </h3>
              <span className="text-xs text-slate-400">
                {section.records.length}
              </span>
            </div>

            <div className="hidden sm:block">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                    <th className="p-3">Name</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Sign In</th>
                    <th className="p-3">Sign Out</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {section.records.map((r) => (
                    <tr key={r._id} className="hover:bg-slate-50/60">
                      <td className="p-3 font-medium text-slate-900">
                        {r.person?.name || "Unknown"}
                      </td>
                      <td className="p-3">
                        <StatusPill record={r} />
                      </td>
                      <td className="p-3 text-slate-700">
                        {r.signInTime
                          ? new Date(r.signInTime).toLocaleTimeString()
                          : "-"}
                      </td>
                      <td className="p-3 text-slate-700">
                        {r.signOutTime
                          ? new Date(r.signOutTime).toLocaleTimeString()
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-slate-100 sm:hidden">
              {section.records.map((r) => (
                <div key={r._id} className="space-y-1.5 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-900">
                      {r.person?.name || "Unknown"}
                    </span>
                    <StatusPill record={r} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Sign In</span>
                    <span className="font-medium text-slate-700">
                      {r.signInTime
                        ? new Date(r.signInTime).toLocaleTimeString()
                        : "-"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Sign Out</span>
                    <span className="font-medium text-slate-700">
                      {r.signOutTime
                        ? new Date(r.signOutTime).toLocaleTimeString()
                        : "-"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ),
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: string;
}) {
  return (
    <div className="rounded-xl border bg-white p-3 text-center shadow-sm">
      <p className="text-xl font-bold" style={{ color: tone || "#0f172a" }}>
        {value}
      </p>
      <p className="mt-0.5 text-[11px] font-medium text-slate-400">{label}</p>
    </div>
  );
}

function StatusPill({ record }: { record: AttendanceRecord }) {
  const signedIn = !!record.signInTime && !record.signOutTime;
  const done = !!record.signOutTime;
  const label = signedIn ? "In" : done ? "Out" : "-";
  const style = signedIn
    ? { backgroundColor: "#fff7ed", color: "#f54800" }
    : done
      ? { backgroundColor: "#f1f5f9", color: "#475569" }
      : { backgroundColor: "#f8fafc", color: "#94a3b8" };

  return (
    <span className="inline-flex items-center gap-1">
      <span
        className="rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize"
        style={style}
      >
        {label}
      </span>
      {record.isLate && (
        <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-600">
          Late
        </span>
      )}
    </span>
  );
}

function PresetButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-full px-3 py-1.5 text-xs font-semibold transition-colors"
      style={{
        backgroundColor: active ? "var(--color-primary)" : "#f1f5f9",
        color: active ? "#fff" : "#475569",
      }}
    >
      {label}
    </button>
  );
}

function IconButton({
  onClick,
  icon,
  spin,
}: {
  onClick: () => void;
  icon: typeof ArrowLeft01Icon;
  spin?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center rounded border bg-white p-2 text-slate-600 hover:bg-slate-50"
    >
      <HugeiconsIcon
        icon={icon}
        size={16}
        className={spin ? "animate-spin" : ""}
      />
    </button>
  );
}
