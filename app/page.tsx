"use client";

import { useEffect, useState } from "react";

interface Person {
  _id: string;
  name: string;
  role: "student" | "staff";
}

export default function SignInPage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [tab, setTab] = useState<"student" | "staff">("student");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/people")
      .then((res) => res.json())
      .then(setPeople);
  }, []);

  async function handleSignIn(personId: string) {
    const res = await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ personId, action: "signin" }),
    });
    const data = await res.json();
    setMessage(res.ok ? "Signed in!" : data.error);
    setTimeout(() => setMessage(""), 2000);
  }

  const filtered = people.filter((p) => p.role === tab);

  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-1">Attendance</h1>
      <p className="text-gray-500 mb-4">{new Date().toDateString()}</p>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab("student")}
          className={`px-4 py-2 rounded ${tab === "student" ? "bg-black text-white" : "bg-gray-200"}`}
        >
          Students
        </button>
        <button
          onClick={() => setTab("staff")}
          className={`px-4 py-2 rounded ${tab === "staff" ? "bg-black text-white" : "bg-gray-200"}`}
        >
          Staff
        </button>
      </div>

      {message && <p className="mb-3 text-green-600">{message}</p>}

      <div className="grid grid-cols-2 gap-3">
        {filtered.map((person) => (
          <button
            key={person._id}
            onClick={() => handleSignIn(person._id)}
            className="p-4 bg-gray-100 rounded-lg text-left hover:bg-gray-200"
          >
            {person.name}
          </button>
        ))}
      </div>
    </main>
  );
}