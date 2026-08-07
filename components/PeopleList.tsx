"use client";

import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Loading03Icon,
  SearchList01Icon,
  Delete02Icon,
} from "@hugeicons/core-free-icons";

interface Person {
  _id: string;
  name: string;
  role: "student" | "staff";
  group?: string;
  code: string;
}

export default function PeopleList({ refreshKey }: { refreshKey: number }) {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Person | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    loadPeople();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  function loadPeople() {
    setLoading(true);
    fetch("/api/people")
      .then((res) => res.json())
      .then(setPeople)
      .finally(() => setLoading(false));
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError("");

    try {
      const res = await fetch(`/api/people/${deleteTarget._id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (res.ok) {
        setDeleteTarget(null);
        loadPeople();
      } else {
        setDeleteError(data.error || "Failed to delete.");
      }
    } catch {
      setDeleteError("Network error. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  const filtered = people.filter((p) =>
    p.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          onClick={() => !deleting && setDeleteTarget(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-gray-900">
              Remove this person?
            </h3>
            <p className="mt-1.5 text-sm text-gray-500">
              <strong>{deleteTarget.name} </strong> will be removed from the
              roster along with their attendance history. This can&apos;t be
              undone.
            </p>

            {deleteError && (
              <p className="mt-2 text-xs font-medium text-red-600">
                {deleteError}
              </p>
            )}

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-700 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting && (
                  <HugeiconsIcon
                    icon={Loading03Icon}
                    size={16}
                    className="animate-spin"
                  />
                )}
                {deleting ? "Removing..." : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900">People & Codes</h3>
        <span className="text-xs text-gray-400">{people.length}</span>
      </div>

      <div className="relative mt-3">
        <HugeiconsIcon
          icon={SearchList01Icon}
          size={20}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="Search name to find their code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-3 text-sm"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-8 text-gray-400">
          <HugeiconsIcon
            icon={Loading03Icon}
            size={20}
            className="animate-spin"
          />
          <span className="text-xs">Loading...</span>
        </div>
      ) : filtered.length === 0 ? (
        <p className="mt-4 text-center text-xs text-gray-400">No matches.</p>
      ) : (
        <div className="mt-3 divide-y divide-gray-100">
          {filtered.map((p) => (
            <div
              key={p._id}
              className="flex items-center justify-between py-2.5"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">{p.name}</p>
                <p className="text-xs capitalize text-gray-400">
                  {p.role}
                  {p.group ? ` · ${p.group}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="rounded-lg px-2.5 py-1.5 text-sm font-bold tracking-widest"
                  style={{
                    backgroundColor: "#fff7ed",
                    color: "var(--color-primary)",
                  }}
                >
                  {p.code}
                </span>
                <button
                  onClick={() => {
                    setDeleteTarget(p);
                    setDeleteError("");
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600"
                  aria-label={`Remove ${p.name}`}
                >
                  <HugeiconsIcon icon={Delete02Icon} size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
