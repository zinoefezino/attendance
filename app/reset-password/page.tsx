"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Missing reset token.");
    }
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("done");
        setMessage(data.message || "Password reset successfully.");
        setTimeout(() => router.push("/login"), 1500);
      } else {
        setStatus("error");
        setMessage(data.error || "Unable to reset password.");
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  return (
    <main className="max-w-lg mx-auto my-10 p-6 sm:p-10 border border-gray-100/80 rounded-3xl bg-white shadow-xl shadow-gray-100/50">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          Reset password
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Choose a new password for your account.
        </p>
      </div>

      {message && (
        <div
          role="status"
          aria-live="polite"
          className={`mb-6 p-3.5 rounded-xl border text-xs font-medium ${status === "error" ? "bg-red-50 border-red-100 text-red-600" : "bg-emerald-50 border-emerald-100 text-emerald-600"}`}
        >
          <div className="flex items-start gap-2">
            <span className="mt-0.5 text-sm">
              {status === "error" ? "⚠" : "✓"}
            </span>
            <div>
              <p className="font-semibold">
                {status === "error" ? "Reset failed" : "Password updated"}
              </p>
              <p className="mt-1">{message}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
            New password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-gray-900/10 transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Confirm password
          </label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-gray-900/10 transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={status === "loading" || !token}
          className="mt-2 py-3.5 px-6 rounded-xl font-semibold text-white text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: "var(--color-primary, #111827)" }}
        >
          {status === "loading" ? "Updating..." : "Reset password"}
        </button>
      </form>

      <p className="text-center text-xs text-gray-500 mt-8">
        {status === "error" && !token ? (
          <Link
            href="/forgot-password"
            className="font-semibold text-gray-900 hover:underline transition-all"
          >
            Request a new reset link
          </Link>
        ) : (
          <Link
            href="/login"
            className="font-semibold text-gray-900 hover:underline transition-all"
          >
            Back to login
          </Link>
        )}
      </p>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-lg mx-auto my-10 p-10 text-center text-sm text-gray-500">
          Loading...
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
