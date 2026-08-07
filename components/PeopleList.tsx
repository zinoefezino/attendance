"use client";

import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading03Icon, SearchList01Icon } from "@hugeicons/core-free-icons";

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

  useEffect(() => {
    setLoading(true);
    fetch("/api/people")
      .then((res) => res.json())
      .then(setPeople)
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const filtered = people.filter((p) =>
    p.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
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
              <span
                className="rounded-lg px-2.5 py-1.5 text-sm font-bold tracking-widest"
                style={{
                  backgroundColor: "#fff7ed",
                  color: "var(--color-primary)",
                }}
              >
                {p.code}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
