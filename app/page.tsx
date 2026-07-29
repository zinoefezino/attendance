"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading03Icon, Logout03Icon } from "@hugeicons/core-free-icons";

interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  role?: "staff" | "student";
  group?: string;
  gender?: string;
}

interface AttendanceStatus {
  signedIn: boolean;
  signInTime?: string;
  signOutTime?: string;
  isLate?: boolean;
}

interface RawAttendanceRecord {
  person?: { _id: string };
  signInTime?: string;
  signOutTime?: string;
  isLate?: boolean;
}

function isOfficeLocked(): boolean {
  const hour = new Date().getHours();
  return hour >= 18 || hour < 6;
}

export default function OfficeDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const user = session?.user as SessionUser | undefined;
  const role = user?.role || "staff";
  const userName = user?.name || "Employee";
  const userEmail = user?.email || "employee@company.com";
  const userGroup = user?.group || "";
  const userId = user?.id || "";
  const isStaff = role === "staff";

  const userGender =
    user?.gender?.toLowerCase() === "female" ? "female" : "male";
  const avatarSeed = `${userGender}-${encodeURIComponent(userName)}`;
  const avatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${avatarSeed}`;

  const [attendance, setAttendance] = useState<AttendanceStatus>({
    signedIn: false,
  });
  const [loadingData, setLoadingData] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [confirmingSignOut, setConfirmingSignOut] = useState(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);
  const [officeLocked, setOfficeLocked] = useState(false);

  const hasRecordToday = Boolean(
    attendance.signInTime || attendance.signOutTime,
  );
  const statusLabel = attendance.signedIn
    ? "Clocked in"
    : hasRecordToday
      ? "Clocked out"
      : "Not signed in";

  const statusStyles = attendance.signedIn
    ? { bg: "#ecfdf5", border: "#059669", text: "#047857" }
    : hasRecordToday
      ? { bg: "#f8fafc", border: "#94a3b8", text: "#475569" }
      : {
          bg: "#fff7ed",
          border: "var(--color-primary)",
          text: "var(--color-primary)",
        };

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    const check = () => setOfficeLocked(isOfficeLocked());
    check();
    const interval = setInterval(check, 60_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (status !== "authenticated" || !userId) return;

    fetch(`/api/attendance?date=${new Date().toISOString().split("T")[0]}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load attendance");
        return res.json();
      })
      .then((data: RawAttendanceRecord[]) => {
        const todayRecord = Array.isArray(data)
          ? data.find((r) => r.person?._id === userId)
          : undefined;

        setAttendance({
          signedIn: Boolean(
            todayRecord?.signInTime && !todayRecord?.signOutTime,
          ),
          signInTime: todayRecord?.signInTime,
          signOutTime: todayRecord?.signOutTime,
          isLate: todayRecord?.isLate,
        });
      })
      .catch(() =>
        setErrorModal("Couldn't load today's attendance. Try refreshing."),
      )
      .finally(() => setLoadingData(false));
  }, [status, userId]);

  async function submitAttendanceAction(action: "signin" | "signout") {
    setActionLoading(true);
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personId: userId, action }),
      });
      const data = await res.json();

      if (res.ok) {
        setAttendance({
          signedIn: Boolean(data?.signInTime && !data?.signOutTime),
          signInTime: data?.signInTime,
          signOutTime: data?.signOutTime,
          isLate: data?.isLate,
        });
      } else if (res.status === 403) {
        // Office is closed. The button already prevents this in the normal
        // case, so just resync the lock state instead of showing a modal.
        setOfficeLocked(true);
      } else {
        setErrorModal(data.error || "Action failed. Please try again.");
      }
    } catch {
      setErrorModal("An error occurred while updating attendance.");
    } finally {
      setActionLoading(false);
    }
  }

  function handleToggle() {
    if (attendance.signedIn) {
      setConfirmingSignOut(true);
    } else {
      submitAttendanceAction("signin");
    }
  }

  async function handleLogout() {
    setLoggingOut(true);
    await signOut({ callbackUrl: "/" });
  }

  if (status === "loading" || (status === "authenticated" && loadingData)) {
    return <DashboardSkeleton />;
  }

  if (!session) return null;

  const signInDisabled =
    actionLoading ||
    (hasRecordToday && !attendance.signedIn) ||
    (officeLocked && !attendance.signedIn);

  return (
    <main className="max-w-md mx-auto w-full p-4 sm:p-6 space-y-5">
      {/* Sign-out confirmation */}
      {confirmingSignOut && (
        <Modal onClose={() => setConfirmingSignOut(false)}>
          <h3 className="text-base font-bold text-slate-900">
            Sign out for today?
          </h3>
          <p className="mt-1.5 text-sm text-slate-500">
            This records your departure time. You can&apos;t sign back in until
            tomorrow.
          </p>
          <div className="mt-5 flex gap-2">
            <button
              onClick={() => setConfirmingSignOut(false)}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setConfirmingSignOut(false);
                submitAttendanceAction("signout");
              }}
              disabled={actionLoading}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              {actionLoading && (
                <HugeiconsIcon
                  icon={Loading03Icon}
                  size={16}
                  className="animate-spin"
                />
              )}
              {actionLoading ? "Signing out..." : "Sign out"}
            </button>
          </div>
        </Modal>
      )}

      {/* Error modal — genuine errors only (network/server failures) */}
      {errorModal && (
        <Modal onClose={() => setErrorModal(null)}>
          <h3 className="text-base font-bold text-slate-900">
            Something went wrong
          </h3>
          <p className="mt-1.5 text-sm text-slate-500">{errorModal}</p>
          <button
            onClick={() => setErrorModal(null)}
            className="mt-5 w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            OK
          </button>
        </Modal>
      )}

      {/* Profile header */}
      <section className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={avatarUrl}
            alt=""
            className="h-11 w-11 shrink-0 rounded-xl border border-slate-200 bg-slate-50 object-cover"
          />
          <div className="min-w-0">
            <h1 className="truncate text-sm font-bold text-slate-900">
              {userName}
            </h1>
            <p className="truncate text-xs text-slate-400">{userEmail}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 disabled:opacity-60"
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
          {loggingOut ? "Logging out..." : "Log out"}
        </button>
      </section>

      {/* Status card */}
      <section
        className="rounded-2xl border p-5 shadow-sm transition-colors"
        style={{
          backgroundColor: statusStyles.bg,
          borderColor: statusStyles.border,
        }}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {isStaff ? "Staff attendance" : "Student attendance"}
          </span>
          <span
            className="rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide"
            style={{
              borderColor: statusStyles.border,
              color: statusStyles.text,
            }}
          >
            {statusLabel}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-white/70 p-3">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-medium text-slate-400">
                Signed in
              </p>
              {attendance.isLate && (
                <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-red-600">
                  Late
                </span>
              )}
            </div>
            <p className="mt-0.5 text-sm font-bold text-slate-800">
              {attendance.signInTime
                ? new Date(attendance.signInTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "—"}
            </p>
          </div>
          <TimeStat label="Signed out" value={attendance.signOutTime} />
        </div>

        <button
          onClick={handleToggle}
          disabled={signInDisabled}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white shadow-sm transition-transform active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
          style={{
            backgroundColor: attendance.signedIn
              ? "#dc2626"
              : "var(--color-primary)",
          }}
        >
          {actionLoading && (
            <HugeiconsIcon
              icon={Loading03Icon}
              size={18}
              className="animate-spin"
            />
          )}
          {actionLoading
            ? "Updating..."
            : attendance.signedIn
              ? "Tap to sign out"
              : hasRecordToday
                ? "Done for today"
                : officeLocked
                  ? "Office closed until 6:00 AM"
                  : "Tap to sign in"}
        </button>

        {officeLocked && !attendance.signedIn && !hasRecordToday && (
          <p className="mt-3 text-center text-xs text-slate-400">
            Sign-in is closed overnight and reopens at 6:00 AM.
          </p>
        )}
      </section>

      {/* Guidance */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="text-xs font-bold uppercase tracking-wide text-slate-900">
          How it works
        </h3>
        <ol className="mt-3 space-y-2 text-xs leading-relaxed text-slate-500">
          <li>
            1. Tap <strong className="text-slate-700">Sign in</strong> when you
            arrive at the office.
          </li>
          <li>2. Your status updates immediately above.</li>
          <li>
            3. Tap <strong className="text-slate-700">Sign out</strong> before
            you leave the office.
          </li>
        </ol>
        {userGroup && (
          <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-400">
            {isStaff ? "Department" : "Class"}:{" "}
            <span className="font-medium text-slate-600">{userGroup}</span>
          </p>
        )}
      </section>
    </main>
  );
}

function TimeStat({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-xl bg-white/70 p-3">
      <p className="text-[11px] font-medium text-slate-400">{label}</p>
      <p className="mt-0.5 text-sm font-bold text-slate-800">
        {value
          ? new Date(value).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "—"}
      </p>
    </div>
  );
}

function Modal({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <main className="max-w-md mx-auto w-full p-4 sm:p-6 space-y-5 animate-pulse">
      <div className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-slate-200" />
          <div className="space-y-2">
            <div className="h-3.5 w-28 rounded bg-slate-200" />
            <div className="h-3 w-36 rounded bg-slate-100" />
          </div>
        </div>
        <div className="h-8 w-16 rounded-lg bg-slate-100" />
      </div>
      <div className="h-56 rounded-2xl bg-slate-100" />
      <div className="h-32 rounded-2xl bg-slate-100" />
    </main>
  );
}
