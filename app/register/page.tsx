"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ViewIcon,
  ViewOffIcon,
  Loading03Icon,
} from "@hugeicons/core-free-icons";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    gender: "male",
    role: "student",
    group: "",
  });

  const [status, setStatus] = useState<
    "idle" | "submitting" | "done" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const isStudent = form.role === "student";
  const loading = status === "submitting";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    const normalizedEmail = form.email.trim().toLowerCase();
    const trimmedName = form.name.trim();
    const trimmedGroup = form.group.trim();

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      setErrorMsg("Please enter a valid email address.");
      setStatus("error");
      return;
    }

    if (form.password.length < 8) {
      setErrorMsg("Password must be at least 8 characters.");
      setStatus("error");
      return;
    }

    if (isStudent && !trimmedGroup) {
      setErrorMsg("Please enter your class or department.");
      setStatus("error");
      return;
    }

    setStatus("submitting");

    try {
      const res = await fetch("/api/people", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          name: trimmedName,
          email: normalizedEmail,
          group: trimmedGroup,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }

      const loginRes = await signIn("credentials", {
        email: normalizedEmail,
        password: form.password,
        redirect: false,
      });

      if (loginRes?.error) {
        router.replace("/login");
        return;
      }

      setStatus("done");
      router.replace("/");
      router.refresh();
    } catch {
      setErrorMsg("A network error occurred. Please try again.");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <main className="max-w-md mx-auto my-12 p-8 border border-gray-100 rounded-3xl bg-white shadow-xl text-center space-y-4">
        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
          ✓
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Account Created!</h1>
        <p className="text-sm text-gray-500 leading-relaxed">
          Your account is ready. Redirecting you to your dashboard...
        </p>
        <Link
          href="/"
          className="inline-block mt-2 text-xs font-semibold text-gray-900 underline"
        >
          Click here if not redirected automatically
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-lg mx-auto my-10 p-6 sm:p-10 border border-gray-100/80 rounded-3xl bg-white shadow-xl shadow-gray-100/50">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          Create Account
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Enter your profile details to set up your attendance ID card.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="space-y-1.5">
          <label
            htmlFor="name"
            className="text-xs font-semibold text-gray-600 uppercase tracking-wider"
          >
            Full Name
          </label>
          <input
            id="name"
            type="text"
            placeholder="John Doe"
            required
            autoComplete="name"
            disabled={loading}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-3 text-base rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all disabled:opacity-60"
          />
        </div>

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
            disabled={loading}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-3 text-base rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all disabled:opacity-60"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="password"
            className="text-xs font-semibold text-gray-600 uppercase tracking-wider"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="At least 8 characters"
              required
              minLength={8}
              autoComplete="new-password"
              disabled={loading}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-3 pr-12 text-base rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all disabled:opacity-60"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              disabled={loading}
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

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label
              htmlFor="gender"
              className="text-xs font-semibold text-gray-600 uppercase tracking-wider"
            >
              Gender
            </label>
            <select
              id="gender"
              disabled={loading}
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
              className="w-full px-3.5 py-3 text-sm rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all cursor-pointer disabled:opacity-60"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="role"
              className="text-xs font-semibold text-gray-600 uppercase tracking-wider"
            >
              Role
            </label>
            <select
              id="role"
              disabled={loading}
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full px-3.5 py-3 text-sm rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all cursor-pointer disabled:opacity-60"
            >
              <option value="student">Student</option>
              <option value="staff">Staff</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="group"
            className="text-xs font-semibold text-gray-600 uppercase tracking-wider"
          >
            Class / Department{" "}
            <span
              className={`font-normal ${isStudent ? "text-amber-600" : "text-gray-400"}`}
            >
              {isStudent ? "Required" : "Optional"}
            </span>
          </label>
          <input
            id="group"
            type="text"
            placeholder={
              isStudent ? "e.g., Computer Science B" : "e.g., Administration"
            }
            required={isStudent}
            disabled={loading}
            value={form.group}
            onChange={(e) => setForm({ ...form, group: e.target.value })}
            className="w-full px-4 py-3 text-base rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all disabled:opacity-60"
          />
          <p className="text-[11px] text-gray-400">
            {isStudent
              ? "Students must provide their class or department."
              : "Staff can leave this blank if they do not want to add a department."}
          </p>
        </div>

        {status === "error" && (
          <div
            role="alert"
            className="p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-medium"
          >
            {errorMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
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
          {loading ? "Creating Account..." : "Register"}
        </button>

        <p className="text-center text-xs text-gray-500 mt-2">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-gray-900 underline">
            Log in
          </Link>
        </p>
      </form>
    </main>
  );
}
