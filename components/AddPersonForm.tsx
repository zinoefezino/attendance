"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading03Icon } from "@hugeicons/core-free-icons";

interface CreatedPerson {
  name: string;
  code: string;
}

export default function AddPersonForm({ onAdded }: { onAdded: () => void }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState<"student" | "staff">("student");
  const [group, setGroup] = useState("");
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState<CreatedPerson | null>(null);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/people", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), role, group: group.trim() }),
      });
      const data = await res.json();

      if (res.ok) {
        setCreated({ name: data.name, code: data.code });
        setName("");
        setGroup("");
        onAdded();
      } else {
        setError(data.error || "Something went wrong.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <h3 className="text-sm font-bold text-gray-900">Add Person</h3>

      {created ? (
        <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
          <p className="text-xs text-emerald-700">
            <strong>{created.name}</strong>&apos;s sign-in code:
          </p>
          <p className="mt-1 text-3xl font-black tracking-widest text-emerald-800">
            {created.code}
          </p>
          <p className="mt-1 text-[11px] text-emerald-600">
            Give this to them — they&apos;ll need it every time they sign in.
            You can always look it up again below if they lose it.
          </p>
          <button
            onClick={() => setCreated(null)}
            className="mt-3 text-xs font-semibold text-emerald-700 underline"
          >
            Add another person
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-3">
          <input
            type="text"
            placeholder="Full name"
            required
            disabled={loading}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-base disabled:opacity-60"
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              value={role}
              disabled={loading}
              onChange={(e) => setRole(e.target.value as "student" | "staff")}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm disabled:opacity-60"
            >
              <option value="student">Student</option>
              <option value="staff">Staff</option>
            </select>
            <input
              type="text"
              placeholder="Class / Dept"
              disabled={loading}
              value={group}
              onChange={(e) => setGroup(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm disabled:opacity-60"
            />
          </div>

          {error && <p className="text-xs font-medium text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            {loading && (
              <HugeiconsIcon
                icon={Loading03Icon}
                size={20}
                className="animate-spin"
              />
            )}
            {loading ? "Adding..." : "Add & Generate Code"}
          </button>
        </form>
      )}
    </div>
  );
}
