"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ViewIcon,
  ViewOffIcon,
  Loading03Icon,
} from "@hugeicons/core-free-icons";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");
  const loading = status === "loading";

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Missing reset token.");
    }
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password.length < 8) {
      setStatus("error");
      setMessage("Password must be at least 8 characters.");
      return;
    }

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

  const formDisabled = loading || status === "done" || !token;

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
                {status === "error" ? "Reset failed" : "Password updated"}
              </p>
              <p className="mt-1">{message}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="space-y-1.5">
          <label
            htmlFor="password"
            className="text-xs font-semibold text-gray-600 uppercase tracking-wider"
          >
            New password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="At least 8 characters"
              required
              minLength={8}
              autoComplete="new-password"
              disabled={formDisabled}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 pr-12 text-sm rounded-xl border border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-gray-900/10 transition-all disabled:opacity-60"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              disabled={formDisabled}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-60"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <HugeiconsIcon
                icon={showPassword ? ViewOffIcon : ViewIcon}
                size={18}
                strokeWidth={1.8}
              />
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="confirmPassword"
            className="text-xs font-semibold text-gray-600 uppercase tracking-wider"
          >
            Confirm password
          </label>
          <input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            required
            minLength={8}
            autoComplete="new-password"
            disabled={formDisabled}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-gray-900/10 transition-all disabled:opacity-60"
          />
          {confirmPassword.length > 0 && confirmPassword !== password && (
            <p className="text-[11px] text-red-500">
              Passwords don&apos;t match yet.
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={formDisabled}
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
            ? "Updating..."
            : status === "done"
              ? "Password updated"
              : "Reset password"}
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
        <div className="max-w-lg mx-auto my-10 p-10 flex flex-col items-center justify-center gap-2 text-sm text-gray-500">
          <HugeiconsIcon
            icon={Loading03Icon}
            size={20}
            className="animate-spin text-gray-400"
          />
          Loading...
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
