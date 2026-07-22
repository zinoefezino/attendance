"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ViewIcon, ViewOffIcon } from "@hugeicons/core-free-icons";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      setLoading(false);

      if (res?.error) {
        setError("Invalid email or password.");
      } else {
        router.replace("/");
        router.refresh();
      }
    } catch {
      setLoading(false);
      setError("An unexpected error occurred. Please try again.");
    }
  }

  return (
    <main className="max-w-lg mx-auto my-10 p-6 sm:p-10 border border-gray-100/80 rounded-3xl bg-white shadow-xl shadow-gray-100/50">
      {/* Header section */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          Welcome Back
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Sign in to access your attendance dashboard.
        </p>
      </div>

      {/* Error alert banner */}
      {error && (
        <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Email Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Email Address
          </label>
          <input
            type="email"
            placeholder="john@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all"
          />
        </div>

        {/* Password Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 pr-12 text-sm rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
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

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className="mt-2 py-3.5 px-6 rounded-xl font-semibold text-white text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: "var(--color-primary, #111827)" }}
        >
          {loading ? "Signing in..." : "Log In"}
        </button>
        <div className="flex justify-center">
          <Link
            href="/forgot-password"
            className="text-xs font-semibold text-gray-900 hover:underline transition-all"
          >
            Forgot password?
          </Link>
        </div>
      </form>

      {/* Footer link */}
      <p className="text-center text-xs text-gray-500 mt-8">
        Don't have an account?{" "}
        <Link
          href="/register"
          className="font-semibold text-gray-900 hover:underline transition-all"
        >
          Register here
        </Link>
      </p>
    </main>
  );
}
