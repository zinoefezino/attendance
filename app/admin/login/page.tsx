"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Incorrect administrative password.");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-md mx-auto my-12 p-6 sm:p-10 border border-gray-100/80 rounded-3xl bg-white shadow-xl shadow-gray-100/50">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          Admin Access
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Enter the master system key to view administrative tools.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Master Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 py-3.5 px-6 rounded-xl font-semibold text-white text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: "var(--color-primary, #111827)" }}
        >
          {loading ? "Authenticating..." : "Login"}
        </button>
      </form>
    </main>
  );
}
