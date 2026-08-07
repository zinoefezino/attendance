"use client";

import { useEffect, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Loading03Icon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons";

interface Person {
  _id: string;
  name: string;
  role: "student" | "staff";
}

interface AttendanceRecord {
  _id: string;
  person: string;
  signInTime?: string;
  signOutTime?: string;
}

interface RawAttendanceRecord {
  _id: string;
  person: { _id: string } | string;
  signInTime?: string;
  signOutTime?: string;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function KioskSignInPage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [records, setRecords] = useState<Record<string, AttendanceRecord>>({});
  const [tab, setTab] = useState<"student" | "staff">("student");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const [pinTarget, setPinTarget] = useState<Person | null>(null);
  const [pin, setPin] = useState("");
  const [pinLoading, setPinLoading] = useState(false);
  const [pinError, setPinError] = useState("");
  const pinInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadPeople();
    loadRecords();
    const interval = setInterval(loadRecords, 30_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (pinTarget) pinInputRef.current?.focus();
  }, [pinTarget]);

  function loadPeople() {
    fetch("/api/people")
      .then((res) => res.json())
      .then(setPeople);
  }

  function loadRecords() {
    fetch("/api/attendance")
      .then((res) => res.json())
      .then((data: RawAttendanceRecord[]) => {
        const map: Record<string, AttendanceRecord> = {};
        data.forEach((r) => {
          const personId =
            typeof r.person === "string" ? r.person : r.person._id;
          map[personId] = { ...r, person: personId };
        });
        setRecords(map);
      });
  }

  function flash(text: string, error = false) {
    setIsError(error);
    setMessage(text);
    setTimeout(() => setMessage(""), 2200);
  }

  function openTap(person: Person) {
    const record = records[person._id];

    if (!record) {
      setPinTarget(person);
      setPin("");
      setPinError("");
      return;
    }

    if (!record.signOutTime) {
      submitSignOut(person);
    }
  }

  async function submitSignOut(person: Person) {
    const res = await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ personId: person._id, action: "signout" }),
    });
    const data = await res.json();
    flash(res.ok ? `${person.name} signed out` : data.error, !res.ok);
    if (res.ok) loadRecords();
  }

  async function submitPin() {
    if (!pinTarget) return;
    setPinLoading(true);
    setPinError("");

    const res = await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        personId: pinTarget._id,
        action: "signin",
        code: pin,
      }),
    });
    const data = await res.json();

    setPinLoading(false);

    if (res.ok) {
      flash(`${pinTarget.name} signed in`);
      setPinTarget(null);
      loadRecords();
    } else {
      setPinError(data.error || "Incorrect code");
      setPin("");
      pinInputRef.current?.focus();
    }
  }

  const filtered = people.filter((p) => p.role === tab);

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col p-4 sm:p-8">
      {/* PIN modal */}
      {pinTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          onClick={() => setPinTarget(null)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold text-white"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              {initials(pinTarget.name)}
            </div>
            <h3 className="mt-4 text-center text-lg font-bold text-gray-900">
              {pinTarget.name}
            </h3>
            <p className="mt-1 text-center text-sm text-gray-500">
              Enter your sign-in code
            </p>

            <input
              ref={pinInputRef}
              type="tel"
              inputMode="numeric"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) =>
                e.key === "Enter" && pin.length >= 4 && submitPin()
              }
              className="mt-6 w-full rounded-2xl border-2 border-gray-200 px-4 py-4 text-center text-3xl font-bold tracking-[0.4em] focus:outline-none"
              style={{ borderColor: pinError ? "#dc2626" : undefined }}
              placeholder="——————"
            />

            {pinError && (
              <p className="mt-2 text-center text-sm font-medium text-red-600">
                {pinError}
              </p>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setPinTarget(null)}
                className="flex-1 rounded-2xl border border-gray-200 py-3.5 text-base font-semibold text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={submitPin}
                disabled={pin.length < 4 || pinLoading}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl py-3.5 text-base font-semibold text-white disabled:opacity-50"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                {pinLoading && (
                  <HugeiconsIcon
                    icon={Loading03Icon}
                    size={20}
                    className="animate-spin"
                  />
                )}
                {pinLoading ? "Checking..." : "Sign In"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mb-5 flex items-start gap-3 rounded-2xl border border-gray-200 bg-white p-4">
        <HugeiconsIcon
          icon={InformationCircleIcon}
          size={22}
          className="mt-0.5 flex-shrink-0 text-gray-400"
        />
        <div className="text-xs leading-relaxed text-gray-600 sm:text-sm">
          <p>
            <strong className="text-gray-900">Signing in:</strong> Tap your
            name, then enter your sign-in code when asked.
          </p>
          <p className="mt-1">
            <strong className="text-gray-900">Signing out:</strong> Tap your
            name again when you leave — no code needed. You can only sign in and
            out once per day.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-5 flex gap-3">
        <button
          onClick={() => setTab("student")}
          className="flex-1 rounded-2xl py-4 text-lg font-bold transition-colors"
          style={{
            backgroundColor:
              tab === "student" ? "var(--color-primary)" : "#f3f4f6",
            color: tab === "student" ? "#fff" : "#111",
          }}
        >
          Students
        </button>
        <button
          onClick={() => setTab("staff")}
          className="flex-1 rounded-2xl py-4 text-lg font-bold transition-colors"
          style={{
            backgroundColor:
              tab === "staff" ? "var(--color-primary)" : "#f3f4f6",
            color: tab === "staff" ? "#fff" : "#111",
          }}
        >
          Staff
        </button>
      </div>

      {/* Toast */}
      <div className="mb-3 h-6 text-center">
        {message && (
          <p
            className={`text-sm font-semibold ${isError ? "text-red-600" : "text-green-600"}`}
          >
            {message}
          </p>
        )}
      </div>

      {/* Grid — capped height, scrolls internally instead of growing the page */}
      <div className="max-h-[65vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filtered.map((person) => {
            const record = records[person._id];
            const signedIn = !!record && !record.signOutTime;
            const done = !!record && !!record.signOutTime;

            return (
              <button
                key={person._id}
                onClick={() => openTap(person)}
                disabled={done}
                className={`relative flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-transform active:scale-95 ${
                  done
                    ? "cursor-not-allowed border-gray-200 bg-white opacity-50"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                }`}
              >
                <span
                  className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full"
                  style={{
                    backgroundColor: signedIn
                      ? "#22c55e"
                      : done
                        ? "#9ca3af"
                        : "transparent",
                  }}
                />
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: "var(--color-primary)" }}
                >
                  {initials(person.name)}
                </div>
                <span className="text-sm font-semibold leading-tight text-gray-900">
                  {person.name}
                </span>
                <span className="text-[11px] text-gray-400">
                  {done
                    ? "Signed out"
                    : signedIn
                      ? "Tap to sign out"
                      : "Tap to sign in"}
                </span>
              </button>
            );
          })}

          {filtered.length === 0 && (
            <p className="col-span-full py-12 text-center text-sm text-gray-400">
              No one added yet — ask an admin to add people.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
