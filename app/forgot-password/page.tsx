"use client";

import { useState } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading03Icon } from "@hugeicons/core-free-icons";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");
  const loading = status === "loading";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("done");
        setMessage(
          data.message || "If an account exists, a reset link has been sent.",
        );
      } else {
        setStatus("error");
        setMessage(data.error || "Unable to send reset email.");
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
          Forgot password
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Enter your email and we&apos;ll send a reset link.
        </p>
      </div>

      {message && (
        <div
          role="status"
          aria-live="polite"
          className={`mb-6 p-3.5 rounded-xl border text-xs font-medium ${
            status === "error"
              ? "bg-red-50 border-red-100 text-red-600"
              : "bg-emerald-50 border-emerald-100 text-emerald-600"
          }`}
        >
          <div className="flex items-start gap-2">
            <span className="mt-0.5 text-sm">
              {status === "error" ? "⚠" : "✓"}
            </span>
            <div>
              <p className="font-semibold">
                {status === "error"
                  ? "Unable to send reset link"
                  : "Reset link sent"}
              </p>
              <p className="mt-1">{message}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="text-xs font-semibold text-gray-600 uppercase tracking-wider"
          >
            Email Address
          </label>
          <input
            id="email"
            type="email"
            placeholder="john@example.com"
            required
            autoComplete="email"
            disabled={loading || status === "done"}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 text-base rounded-xl border border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-gray-900/10 transition-all disabled:opacity-60"
          />
        </div>

        <button
          type="submit"
          disabled={loading || status === "done"}
          className="mt-2 flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-semibold text-white text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: "var(--color-primary, #111827)" }}
        >
          {loading && (
            <HugeiconsIcon
              icon={Loading03Icon}
              size={16}
              className="animate-spin"
            />
          )}
          {loading
            ? "Sending..."
            : status === "done"
              ? "Link sent"
              : "Send reset link"}
        </button>
      </form>

      <p className="text-center text-xs text-gray-500 mt-8">
        Remembered your password?{" "}
        <Link
          href="/login"
          className="font-semibold text-gray-900 hover:underline transition-all"
        >
          Back to login
        </Link>
      </p>
    </main>
  );
}
