"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AttendanceStatus {
  signedIn: boolean;
  signInTime?: string;
  signOutTime?: string;
}

export default function OfficeDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const role = (session?.user as any)?.role || "Employee";
  const userName = session?.user?.name || "Employee";
  const userEmail = session?.user?.email || "employee@company.com";
  const userGroup = (session?.user as any)?.group || "";
  const isStaff = role === "staff";
  const isStudent = role === "student";
  const userId = (session?.user as any)?.id || "";

  // Extract gender selection ("male" or "female")
  const rawGender = (session?.user as any)?.gender;
  const userGender = rawGender?.toLowerCase() === "female" ? "female" : "male";
  const avatarSeed = `${userGender}-${encodeURIComponent(userName || "user")}`;

  const [attendance, setAttendance] = useState<AttendanceStatus>({
    signedIn: false,
    signInTime: undefined,
    signOutTime: undefined,
  });
  const [loadingData, setLoadingData] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalMessage, setModalMessage] = useState<{
    title: string;
    description: string;
    confirmText?: string;
    onConfirm?: () => void;
  } | null>(null);

  // DiceBear avatar uses the user's gender in the seed so female accounts get a female-themed avatar.
  const avatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${avatarSeed}`;

  const hasAnyAttendanceRecord = Boolean(
    attendance.signInTime || attendance.signOutTime,
  );
  const badgeLabel = attendance.signedIn
    ? "CLOCKED IN"
    : hasAnyAttendanceRecord
      ? "CLOCKED OUT"
      : "NOT SIGNED IN";
  const badgeTone = attendance.signedIn
    ? "border-emerald-600 text-emerald-700 bg-emerald-100/60"
    : hasAnyAttendanceRecord
      ? "border-rose-600 text-rose-700 bg-rose-100/60"
      : "border-amber-600 text-amber-700 bg-amber-100/60";
  const badgeBackground = attendance.signedIn
    ? "#ecfdf5"
    : hasAnyAttendanceRecord
      ? "#fef2f2"
      : "#fff7ed";

  // Perforated stamp masking effect
  const r = 6;
  const spacing = 16;
  const stampMask = `
    radial-gradient(${r}px at ${r}px ${r}px, transparent 98%, #000 100%) -${r}px -${r}px / ${spacing}px ${spacing}px round,
    linear-gradient(#000 0 0) center / calc(100% - ${r * 2}px) calc(100% - ${r * 2}px) no-repeat
  `;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated" && userId) {
      fetch(`/api/attendance?date=${new Date().toISOString().split("T")[0]}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to load attendance");
          return res.json();
        })
        .then((data) => {
          const todayRecord = Array.isArray(data)
            ? data.find((record: any) => record.person?._id === userId)
            : null;

          setAttendance({
            signedIn: Boolean(
              todayRecord?.signInTime && !todayRecord?.signOutTime,
            ),
            signInTime: todayRecord?.signInTime,
            signOutTime: todayRecord?.signOutTime,
          });
          setLoadingData(false);
        })
        .catch((err) => {
          console.error(err);
          setLoadingData(false);
        });
    }
  }, [status, userId]);

  const handleToggleAttendance = async () => {
    if (attendance.signedIn) {
      setShowConfirmModal(true);
      return;
    }

    await submitAttendanceAction("signin");
  };

  const confirmSignOut = async () => {
    setShowConfirmModal(false);
    await submitAttendanceAction("signout");
  };

  const submitAttendanceAction = async (action: "signin" | "signout") => {
    setActionLoading(true);

    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personId: userId,
          action,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setAttendance({
          signedIn: Boolean(updated?.signInTime && !updated?.signOutTime),
          signInTime: updated?.signInTime,
          signOutTime: updated?.signOutTime,
        });
      } else {
        const errorData = await res.json().catch(() => ({}));
        setModalMessage({
          title: "Unable to update attendance",
          description: errorData.error || "Action failed. Please try again.",
          confirmText: "OK",
        });
      }
    } catch (err) {
      console.error(err);
      setModalMessage({
        title: "Something went wrong",
        description: "An error occurred while updating attendance.",
        confirmText: "OK",
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (status === "loading" || (status === "authenticated" && loadingData)) {
    return <DashboardSkeleton />;
  }

  if (!session) return null;

  return (
    <main className="max-w-2xl mx-auto w-full p-4 sm:p-6 space-y-8">
      {(showConfirmModal || modalMessage) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">
              {modalMessage?.title || "Confirm sign out"}
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              {modalMessage?.description ||
                "You are currently signed in. Do you want to record your sign-out time now?"}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setModalMessage(null);
                }}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                {modalMessage ? modalMessage.confirmText || "OK" : "Cancel"}
              </button>
              {!modalMessage && (
                <button
                  onClick={confirmSignOut}
                  disabled={actionLoading}
                  className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
                >
                  {actionLoading ? "Updating..." : "Yes, sign out"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Employee Info Header */}
      <section className="p-5 border border-slate-200 rounded-3xl bg-white shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <img
            src={avatarUrl}
            alt={`${userGender} avatar`}
            className="w-12 h-12 rounded-2xl bg-slate-100 p-0.5 border border-slate-200 object-cover"
          />
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-snug">
              {userName}
            </h1>
            <p className="text-xs text-slate-400">{userEmail}</p>
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="px-3.5 py-2 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-xl hover:bg-rose-100 transition-all"
        >
          LOG OUT
        </button>
      </section>

      {/* Perforated Office Badge */}
      <section className="relative transition-all duration-300">
        <div
          className="relative p-6 sm:p-8 shadow-xl shadow-slate-200/50 space-y-6"
          style={{
            backgroundColor: badgeBackground,
            WebkitMask: stampMask,
            mask: stampMask,
            paddingTop: "28px",
            paddingBottom: "28px",
          }}
        >
          {/* Status Stamp overlay */}
          <div className="absolute top-6 right-6 pointer-events-none select-none">
            <div
              className={`transform ${attendance.signedIn ? "rotate-12" : "-rotate-6"} border-4 font-black text-xs sm:text-sm tracking-widest px-3 py-1.5 rounded-lg uppercase shadow-sm ${badgeTone} ${attendance.signedIn ? "animate-pulse" : ""}`}
            >
              {attendance.signedIn ? `✓ ${badgeLabel}` : badgeLabel}
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Sign in
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              {isStaff
                ? "Staff Attendance"
                : isStudent
                  ? "Student Attendance"
                  : "Staff Attendance"}
            </h2>
          </div>

          {/* Details Card */}
          <div className="p-5 border border-slate-200/80 rounded-2xl bg-white/80 backdrop-blur-sm space-y-3">
            <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2.5">
              <span className="text-slate-400 font-medium">Profile Type</span>
              <span className="font-bold text-slate-800 capitalize bg-slate-100 px-2.5 py-1 rounded-md">
                {isStaff ? "Staff" : isStudent ? "Student" : role}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2.5">
              <span className="text-slate-400 font-medium">
                Designation / Role
              </span>
              <span className="font-bold text-slate-800 capitalize bg-slate-100 px-2.5 py-1 rounded-md">
                {role}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2.5">
              <span className="text-slate-400 font-medium">
                Class / Department
              </span>
              <span className="font-semibold text-slate-800 text-right max-w-[60%]">
                {userGroup || "Not provided"}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2.5">
              <span className="text-slate-400 font-medium">Clock-in Time</span>
              <span className="font-semibold text-slate-800">
                {attendance.signInTime
                  ? new Date(attendance.signInTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Not checked in today"}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Clock-out Time</span>
              <span className="font-semibold text-slate-800">
                {attendance.signOutTime
                  ? new Date(attendance.signOutTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "—"}
              </span>
            </div>
          </div>

          {/* Direct Tap Actions */}
          <div className="pt-2">
            <button
              onClick={handleToggleAttendance}
              disabled={actionLoading}
              className={`w-full py-3.5 px-4 rounded-xl text-sm font-bold tracking-wide transition-all duration-200 flex items-center justify-center gap-2 shadow-md ${
                attendance.signedIn
                  ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200"
                  : hasAnyAttendanceRecord
                    ? "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-200"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200"
              }`}
            >
              {actionLoading ? (
                <span>Updating records...</span>
              ) : attendance.signedIn ? (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  <span>TAP TO SIGN OUT</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 01-3-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  <span>TAP TO SIGN IN</span>
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Role-specific guidance */}
      <section className="p-6 border border-slate-200 rounded-3xl bg-white space-y-3">
        <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <svg
            className="w-4 h-4 text-slate-500"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Office Attendance Guidelines
        </h3>
        <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside leading-relaxed">
          {isStaff ? (
            <>
              <li>
                As a staff member, tap <strong>"TAP TO SIGN IN"</strong> when
                you arrive to log your attendance.
              </li>
              <li>
                Your staff badge will immediately reflect your active{" "}
                <strong>CLOCKED IN</strong> status.
              </li>
              <li>
                Before leaving, tap <strong>"TAP TO SIGN OUT"</strong> to record
                your departure time.
              </li>
            </>
          ) : isStudent ? (
            <>
              <li>
                As a student, tap <strong>"TAP TO SIGN IN"</strong> when you
                arrive for class or campus attendance.
              </li>
              <li>
                Your student badge will immediately show your active{" "}
                <strong>CLOCKED IN</strong> status.
              </li>
              <li>
                When you leave, tap <strong>"TAP TO SIGN OUT"</strong> to record
                your departure time.
              </li>
            </>
          ) : (
            <>
              <li>
                Upon arriving at the office, tap{" "}
                <strong>"TAP TO SIGN IN"</strong> to log your arrival time.
              </li>
              <li>
                Your badge will immediately reflect your active{" "}
                <strong>CLOCKED IN</strong> status.
              </li>
              <li>
                Before leaving for the day, tap{" "}
                <strong>"TAP TO SIGN OUT"</strong> to record your departure
                timestamp.
              </li>
            </>
          )}
        </ol>
      </section>
    </main>
  );
}

function DashboardSkeleton() {
  return (
    <main className="max-w-2xl mx-auto w-full p-4 sm:p-6 space-y-6 animate-pulse">
      <div className="p-5 rounded-3xl bg-white flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-200" />
          <div className="space-y-2">
            <div className="h-4 w-32 bg-slate-200 rounded" />
            <div className="h-3 w-44 bg-slate-100 rounded" />
          </div>
        </div>
        <div className="h-8 w-20 bg-slate-200 rounded-xl" />
      </div>

      <div className="p-8 rounded-3xl bg-slate-100 space-y-4 h-64" />
    </main>
  );
}
