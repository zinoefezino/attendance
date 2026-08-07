import { connectDB } from "@/lib/db";
import Person from "@/models/Person";
import { generateUniqueCode } from "@/lib/generateCode";
import { NextRequest } from "next/server";

// GET /api/people
export async function GET() {
  await connectDB();
  const people = await Person.find().sort({ name: 1 });
  return Response.json(people);
}

// POST — admin adds a person directly, code is generated server-side
export async function POST(request: NextRequest) {
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
}
