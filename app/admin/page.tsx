"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
  signInTime?: string;
  signOutTime?: string;
}

export default function AdminPage() {
  const router = useRouter();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loadingRecords, setLoadingRecords] = useState(true);

  // 1. Check admin authorization
  useEffect(() => {
    async function checkAdminAuth() {
      try {
        const res = await fetch("/api/admin/check-auth");
        if (res.ok) {
          setIsAuthenticated(true);
        } else {
          router.push("/admin/login");
        }
      } catch {
        router.push("/admin/login");
      }
    }

    checkAdminAuth();
  }, [router]);

  // 2. Fetch attendance logs for selected date
  useEffect(() => {
    if (isAuthenticated) {
      setLoadingRecords(true);
      fetch(`/api/attendance?date=${date}`)
        .then((res) => res.json())
        .then((data) => {
          setRecords(Array.isArray(data) ? data : []);
          setLoadingRecords(false);
        })
        .catch(() => setLoadingRecords(false));
    }
  }, [date, isAuthenticated]);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  if (isAuthenticated === null) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-2">
        <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-gray-500 font-medium">
          Verifying password...
        </p>
      </div>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">ADMIN</h1>
          <p className="text-xs text-gray-500">
            View and monitor daily attendance records
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 text-xs font-semibold border rounded bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Daily Attendance Section */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <h2 className="text-lg font-semibold">Daily Attendance Logs</h2>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border p-2 rounded text-sm w-full sm:w-auto bg-white"
          />
        </div>

        {loadingRecords ? (
          <p className="text-sm text-gray-400">
            Fetching records for {date}...
          </p>
        ) : records.length === 0 ? (
          <div className="p-6 border rounded bg-gray-50 text-sm text-gray-500 text-center">
            No attendance records found for this date.
          </div>
        ) : (
          <div className="overflow-x-auto border rounded bg-white shadow-sm">
            <table className="w-full border-collapse text-left min-w-[500px]">
              <thead>
                <tr className="border-b bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                  <th className="p-3">Name</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Sign In</th>
                  <th className="p-3">Sign Out</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                {records.map((r) => (
                  <tr key={r._id} className="hover:bg-gray-50/50">
                    <td className="p-3 font-medium text-gray-900">
                      {r.person?.name || "Unknown"}
                    </td>
                    <td className="p-3 text-gray-500 capitalize">
                      {r.person?.role || "-"}
                    </td>
                    <td className="p-3 text-gray-700">
                      {r.signInTime
                        ? new Date(r.signInTime).toLocaleTimeString()
                        : "-"}
                    </td>
                    <td className="p-3 text-gray-700">
                      {r.signOutTime
                        ? new Date(r.signOutTime).toLocaleTimeString()
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
