import { connectDB } from "@/lib/db";
import Person from "@/models/Person";
import { NextRequest } from "next/server";

interface Params {
  params: Promise<{ id: string }>;
}

// PATCH { status: "approved" | "rejected" }
export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;

  await connectDB();
  const { status } = await request.json();

  if (!["approved", "rejected"].includes(status)) {
    return Response.json({ error: "Invalid status" }, { status: 400 });
  }

  const person = await Person.findByIdAndUpdate(id, { status }, { new: true });

  if (!person) {
    return Response.json({ error: "Person not found" }, { status: 404 });
  }

  return Response.json(person);
}
