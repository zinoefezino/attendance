import { connectDB } from "@/lib/db";
import Person from "@/models/Person";
import { generateUniqueCode } from "@/lib/generateCode";
import { NextRequest } from "next/server";

export async function GET() {
  await connectDB();
  const people = await Person.find().sort({ name: 1 });
  return Response.json(people);
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { name, role, group } = await request.json();

    if (!name || !role) {
      return Response.json(
        { error: "Name and role are required" },
        { status: 400 },
      );
    }

    const code = await generateUniqueCode();

    const person = await Person.create({ name, role, group, code });
    return Response.json(person, { status: 201 });
  } catch (err: any) {
    console.error("Failed to add person:", err);

    if (err?.code === 11000) {
      return Response.json(
        { error: "That code was just taken — please try again." },
        { status: 409 },
      );
    }

    return Response.json(
      { error: err?.message || "Failed to add person." },
      { status: 500 },
    );
  }
}
